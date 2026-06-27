import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cancelOverdueOvercommitMeetings } from "../lib/meetings";

/**
 * Auto-cancel of unpaid, overdue overcommit meetings (STATE_MACHINES.md
 * `confirmed -> cancelled`, the uncredited-payment sub-flow step 5; migration
 * 0034). Proves the transition fires for the right rows, queues the D3 vendor +
 * exec + EA notices, and — the money-safety contract — never touches a credited
 * booking or a not-yet-due one, even when called with a far-future `p_now`.
 *
 * Runs against a DEDICATED vendor (off the seed's Alpha/Beta) so it can never
 * collide with the seed-pinned reporting invariants or other parallel suites.
 * Meetings are inserted directly in `confirmed` (the 0012 guard only fires on
 * UPDATE), so the overdue/uncredited fixture is exact and deterministic.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PASSWORD = "Passw0rd!test";

const RILEY = "00000000-0000-0000-0000-00000000ec02"; // seed exec, NO ea_id
const JORDAN = "00000000-0000-0000-0000-00000000ec01"; // seed exec WITH ea_id
const SAM_EA = "00000000-0000-0000-0000-0000000000ea"; // Jordan's linked EA
const CHARITY = "00000000-0000-0000-0000-00000000c1a2";
const VENDOR = "00000000-0000-0000-0000-0000000a7021";
const VUSER = "00000000-0000-0000-0000-0000000a7022";

const PAST = new Date("2020-01-01T00:00:00Z").toISOString();
const FUTURE = new Date("2999-01-01T00:00:00Z").toISOString();
/** A `p_now` well after PAST but before FUTURE — what the cron passes as now(). */
const NOW = new Date("2024-06-01T00:00:00Z");

async function admin(): Promise<SupabaseClient> {
  const c = createClient(URL, PUBLISHABLE, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email: "admin@thegoodintro.test", password: PASSWORD });
  if (error) throw new Error(error.message);
  return c;
}

function service(): SupabaseClient {
  return createClient(URL, SECRET, { auth: { persistSession: false } });
}

async function freshVendor(svc: SupabaseClient) {
  await svc.from("request").delete().eq("vendor_id", VENDOR); // cascades meetings + gifts
  await svc.from("credit_lot").delete().eq("vendor_id", VENDOR);
  await svc.from("cycle").delete().eq("vendor_id", VENDOR);
  await svc.from("vendor_user").delete().eq("id", VUSER);
  await svc.from("vendor").delete().eq("id", VENDOR);
  await svc.from("vendor").insert({ id: VENDOR, name: "OverdueTest Co", email_domain: "overdue.test", status: "active" });
  await svc.from("vendor_user").insert({ id: VUSER, vendor_id: VENDOR, email: "o@overdue.test", name: "Over", role: "owner", status: "active" });
  await svc.from("vendor").update({ owner_user_id: VUSER }).eq("id", VENDOR);
}

/** Insert a meeting in a chosen state directly (INSERT bypasses the 0012 UPDATE guard). */
async function makeMeeting(
  svc: SupabaseClient,
  opts: { exec?: string; status?: string; creditLotId?: string | null; paymentDueAt?: string | null },
) {
  const { data: req } = await svc
    .from("request")
    .insert({ vendor_id: VENDOR, requested_by_user_id: VUSER, executive_id: opts.exec ?? RILEY, q1_what: "x", q2_why: "y", status: "accepted" })
    .select("id")
    .single();
  const { data: m } = await svc
    .from("meeting")
    .insert({
      request_id: req!.id,
      charity_id: CHARITY,
      status: opts.status ?? "confirmed",
      credit_lot_id: opts.creditLotId ?? null,
      payment_due_at: opts.paymentDueAt ?? null,
    })
    .select("id")
    .single();
  return { reqId: req!.id as string, meetingId: m!.id as string };
}

async function statusOf(svc: SupabaseClient, meetingId: string) {
  const { data } = await svc.from("meeting").select("status").eq("id", meetingId).single();
  return data?.status as string;
}

async function noticesFor(svc: SupabaseClient, reqId: string) {
  const { data } = await svc
    .from("notification")
    .select("recipient_type, recipient_id, event")
    .eq("request_id", reqId)
    .eq("event", "D3_unpaid_cancelled");
  return data ?? [];
}

beforeEach(async () => {
  await freshVendor(service());
});

afterAll(async () => {
  const svc = service();
  await svc.from("request").delete().eq("vendor_id", VENDOR);
  await svc.from("credit_lot").delete().eq("vendor_id", VENDOR);
  await svc.from("cycle").delete().eq("vendor_id", VENDOR);
  await svc.from("vendor_user").delete().eq("id", VUSER);
  await svc.from("vendor").delete().eq("id", VENDOR);
});

describe("auto-cancel overdue overcommit meetings (0034)", () => {
  it("cancels a confirmed, uncredited, past-due meeting; queues vendor + exec D3; audits", async () => {
    const sb = await admin();
    const svc = service();
    const { reqId, meetingId } = await makeMeeting(svc, { exec: RILEY, paymentDueAt: PAST });

    const res = await cancelOverdueOvercommitMeetings(sb, NOW);
    expect(res).toMatchObject({ ok: true, cancelled: 1 });
    expect(await statusOf(svc, meetingId)).toBe("cancelled");

    // Riley has no EA -> exactly two notices: vendor_user (the requester) + executive.
    const notices = await noticesFor(svc, reqId);
    expect(notices.length).toBe(2);
    expect(notices.find((n) => n.recipient_type === "vendor_user")?.recipient_id).toBe(VUSER);
    expect(notices.some((n) => n.recipient_type === "executive")).toBe(true);
    expect(notices.some((n) => n.recipient_type === "ea")).toBe(false);

    const { data: au } = await svc
      .from("audit_entry")
      .select("id")
      .eq("action", "meeting.auto_cancelled")
      .eq("target_id", meetingId);
    expect((au ?? []).length).toBe(1);
  });

  it("also notifies the linked EA when the exec has one", async () => {
    const sb = await admin();
    const svc = service();
    const { reqId } = await makeMeeting(svc, { exec: JORDAN, paymentDueAt: PAST });

    const res = await cancelOverdueOvercommitMeetings(sb, NOW);
    expect(res).toMatchObject({ ok: true, cancelled: 1 });

    const notices = await noticesFor(svc, reqId);
    expect(notices.length).toBe(3); // vendor + exec + ea
    expect(notices.find((n) => n.recipient_type === "ea")?.recipient_id).toBe(SAM_EA);
  });

  it("never cancels a credited, a not-yet-due, or a proposed meeting (money-safe)", async () => {
    const sb = await admin();
    const svc = service();

    // A credited (reserved) meeting whose payment_due_at is somehow in the past:
    // must NOT be cancelled — it holds a real reservation.
    const { data: lot } = await svc
      .from("credit_lot")
      .insert({ vendor_id: VENDOR, quantity: 1, quantity_remaining: 1 })
      .select("id")
      .single();
    const credited = await makeMeeting(svc, { creditLotId: lot!.id as string, paymentDueAt: PAST });
    const notDue = await makeMeeting(svc, { paymentDueAt: FUTURE }); // uncredited but deadline ahead
    const proposed = await makeMeeting(svc, { status: "proposed", paymentDueAt: PAST });

    const res = await cancelOverdueOvercommitMeetings(sb, NOW);
    expect(res).toMatchObject({ ok: true, cancelled: 0 });

    expect(await statusOf(svc, credited.meetingId)).toBe("confirmed");
    expect(await statusOf(svc, notDue.meetingId)).toBe("confirmed");
    expect(await statusOf(svc, proposed.meetingId)).toBe("proposed");

    // The reserved credit is untouched.
    const { data: after } = await svc.from("credit_lot").select("quantity_remaining").eq("id", lot!.id).single();
    expect(after?.quantity_remaining).toBe(1);

    // No D3 notices were queued for any of them.
    for (const id of [credited.reqId, notDue.reqId, proposed.reqId]) {
      expect((await noticesFor(svc, id)).length).toBe(0);
    }
  });

  it("is idempotent: a second run cancels nothing new and does not re-notify", async () => {
    const sb = await admin();
    const svc = service();
    const { reqId, meetingId } = await makeMeeting(svc, { paymentDueAt: PAST });

    const first = await cancelOverdueOvercommitMeetings(sb, NOW);
    expect(first).toMatchObject({ ok: true, cancelled: 1 });
    const second = await cancelOverdueOvercommitMeetings(sb, NOW);
    expect(second).toMatchObject({ ok: true, cancelled: 0 });

    expect(await statusOf(svc, meetingId)).toBe("cancelled");
    expect((await noticesFor(svc, reqId)).length).toBe(2); // not doubled to 4
    const { data: au } = await svc
      .from("audit_entry")
      .select("id")
      .eq("action", "meeting.auto_cancelled")
      .eq("target_id", meetingId);
    expect((au ?? []).length).toBe(1);
  });

  it("cancels every overdue meeting in one run and counts them", async () => {
    const sb = await admin();
    const svc = service();
    const a = await makeMeeting(svc, { paymentDueAt: PAST });
    const b = await makeMeeting(svc, { exec: JORDAN, paymentDueAt: PAST });
    const safe = await makeMeeting(svc, { paymentDueAt: FUTURE }); // not due -> excluded

    const res = await cancelOverdueOvercommitMeetings(sb, NOW);
    expect(res).toMatchObject({ ok: true, cancelled: 2 });
    expect(await statusOf(svc, a.meetingId)).toBe("cancelled");
    expect(await statusOf(svc, b.meetingId)).toBe("cancelled");
    expect(await statusOf(svc, safe.meetingId)).toBe("confirmed");
  });
});
