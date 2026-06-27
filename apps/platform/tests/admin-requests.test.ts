import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requestStatusPill, REQUEST_STATUSES } from "../app/admin/requests/_status";
import { shapeRequestRow, pickLatestMeeting, type RawRequest } from "../app/admin/requests/_rows";

/**
 * Read-only /admin/requests list. Pure tests cover the status-pill mapping and
 * the row shaping / latest-meeting picker; the DB test proves the exact
 * PostgREST select the page runs (including the reverse `meeting (...)` embed)
 * works AND is readable under a staff RLS session, then shapes to the loop-
 * visibility row. Runs against a DEDICATED vendor so it never collides with the
 * seed-pinned suites.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PASSWORD = "Passw0rd!test";

const RILEY = "00000000-0000-0000-0000-00000000ec02";
const CHARITY = "00000000-0000-0000-0000-00000000c1a2";
const VENDOR = "00000000-0000-0000-0000-0000000a7031";
const VUSER = "00000000-0000-0000-0000-0000000a7032";

// The exact select the page issues (kept in lock-step with app/admin/requests/page.tsx).
const SELECT =
  "id, status, created_at, vendor:vendor_id ( name ), requester:requested_by_user_id ( name, role, email ), executive:executive_id ( name, title, company ), meeting ( status, scheduled_at, created_at )";

function service(): SupabaseClient {
  return createClient(URL, SECRET, { auth: { persistSession: false } });
}
async function admin(): Promise<SupabaseClient> {
  const c = createClient(URL, PUBLISHABLE, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email: "admin@thegoodintro.test", password: PASSWORD });
  if (error) throw new Error(error.message);
  return c;
}

async function newRequest(svc: SupabaseClient, status: string) {
  const { data } = await svc
    .from("request")
    .insert({ vendor_id: VENDOR, requested_by_user_id: VUSER, executive_id: RILEY, q1_what: "x", q2_why: "y", status })
    .select("id")
    .single();
  return data!.id as string;
}

beforeAll(async () => {
  const svc = service();
  await svc.from("request").delete().eq("vendor_id", VENDOR); // cascades meetings
  await svc.from("vendor_user").delete().eq("id", VUSER);
  await svc.from("vendor").delete().eq("id", VENDOR);
  await svc.from("vendor").insert({ id: VENDOR, name: "Requests Test Co", email_domain: "req.test", status: "active" });
  await svc.from("vendor_user").insert({ id: VUSER, vendor_id: VENDOR, email: "r@req.test", name: "Reese Requester", role: "owner", status: "active" });
});

afterAll(async () => {
  const svc = service();
  await svc.from("request").delete().eq("vendor_id", VENDOR);
  await svc.from("vendor_user").delete().eq("id", VUSER);
  await svc.from("vendor").delete().eq("id", VENDOR);
});

describe("requestStatusPill", () => {
  it("maps every request status to a label + tone", () => {
    expect(requestStatusPill("submitted")).toEqual({ label: "Submitted", tone: "amber" });
    expect(requestStatusPill("accepted")).toEqual({ label: "Accepted", tone: "green" });
    expect(requestStatusPill("declined")).toEqual({ label: "Declined", tone: "danger" });
    expect(requestStatusPill("closed")).toEqual({ label: "Closed", tone: "muted" });
  });
  it("covers all four enum values", () => {
    expect(REQUEST_STATUSES).toEqual(["submitted", "accepted", "declined", "closed"]);
    for (const s of REQUEST_STATUSES) expect(requestStatusPill(s).label.length).toBeGreaterThan(0);
  });
});

describe("pickLatestMeeting", () => {
  it("returns null when there is no linked meeting", () => {
    expect(pickLatestMeeting(null)).toBeNull();
    expect(pickLatestMeeting([])).toBeNull();
  });
  it("picks the newest by created_at (a reversal spawns a fresh one)", () => {
    const picked = pickLatestMeeting([
      { status: "reversed", scheduled_at: null, created_at: "2024-01-01T00:00:00Z" },
      { status: "proposed", scheduled_at: null, created_at: "2024-03-01T00:00:00Z" },
    ]);
    expect(picked).toEqual({ status: "proposed", scheduledIso: null });
  });
  it("normalises a single embedded object (not an array)", () => {
    const picked = pickLatestMeeting({ status: "confirmed", scheduled_at: "2024-05-01T00:00:00Z", created_at: "2024-04-01T00:00:00Z" });
    expect(picked).toEqual({ status: "confirmed", scheduledIso: "2024-05-01T00:00:00Z" });
  });
});

describe("shapeRequestRow", () => {
  it("normalises array embeds and composes the requester + exec detail lines", () => {
    const raw: RawRequest = {
      id: "r1",
      status: "submitted",
      created_at: new Date(Date.now() - 3 * 86_400_000).toISOString(),
      vendor: [{ name: "Acme" }],
      requester: [{ name: "Reese", role: "Head of Sales", email: "reese@acme.test" }],
      executive: [{ name: "Riley Chen", title: "COO", company: "Latitude" }],
      meeting: null,
    };
    const row = shapeRequestRow(raw);
    expect(row.vendorName).toBe("Acme");
    expect(row.requesterName).toBe("Reese");
    expect(row.requesterDetail).toBe("Head of Sales · reese@acme.test");
    expect(row.execName).toBe("Riley Chen");
    expect(row.execDetail).toBe("COO, Latitude");
    expect(row.meeting).toBeNull();
    expect(row.ageLabel).toMatch(/^\d+[dhm]$/);
  });
  it("falls back cleanly when relations are missing", () => {
    const row = shapeRequestRow({
      id: "r2", status: "closed", created_at: new Date().toISOString(),
      vendor: null, requester: null, executive: null, meeting: null,
    });
    expect(row.vendorName).toBe("Vendor");
    expect(row.requesterName).toBeNull();
    expect(row.requesterDetail).toBeNull();
    expect(row.execDetail).toBeNull();
  });
});

describe("admin requests query (DB, staff session)", () => {
  it("reads every status and the latest linked meeting under staff RLS", async () => {
    const svc = service();
    // One request per status for loop visibility.
    await newRequest(svc, "submitted");
    await newRequest(svc, "declined");
    await newRequest(svc, "closed");
    // An accepted request with two meetings (older proposed, newer confirmed):
    // the row must surface the NEWEST.
    const acceptedId = await newRequest(svc, "accepted");
    await svc.from("meeting").insert([
      { request_id: acceptedId, charity_id: CHARITY, status: "proposed", created_at: "2024-01-01T00:00:00Z" },
      { request_id: acceptedId, charity_id: CHARITY, status: "confirmed", scheduled_at: "2024-06-01T00:00:00Z", created_at: "2024-02-01T00:00:00Z" },
    ]);

    const sb = await admin(); // staff session — proves RLS readability
    const { data, error } = await sb.from("request").select(SELECT).eq("vendor_id", VENDOR).order("created_at", { ascending: false });
    expect(error).toBeNull();

    const rows = ((data ?? []) as unknown as RawRequest[]).map(shapeRequestRow);
    expect(rows.length).toBe(4);

    // All four statuses are visible.
    const byStatus = Object.fromEntries(rows.map((r) => [r.status, r]));
    for (const s of REQUEST_STATUSES) expect(byStatus[s]).toBeDefined();

    // Every row resolves the vendor + requester + executive for loop visibility.
    for (const r of rows) {
      expect(r.vendorName).toBe("Requests Test Co");
      expect(r.requesterName).toBe("Reese Requester");
      expect(r.execName).toBe("Riley Chen");
    }

    // The accepted request shows the newest linked meeting (confirmed), not the
    // older proposed one; the others have no meeting.
    expect(byStatus.accepted.meeting?.status).toBe("confirmed");
    expect(byStatus.accepted.meeting?.scheduledIso).toContain("2024-06-01");
    expect(byStatus.submitted.meeting).toBeNull();
    expect(byStatus.declined.meeting).toBeNull();
  });
});
