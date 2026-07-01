import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { releaseMeeting, cancelProposedMeeting } from "../lib/meetings";

/**
 * C3 meeting-cancelled notices (NOTIFICATION_TEMPLATES C3; STATE_MACHINES.md
 * `confirmed -> cancelled` and `proposed -> cancelled`). Proves the vendor + exec
 * C3 rows are queued ONLY when the cancellation actually succeeds: a `no_show`
 * (also via release_meeting) queues nothing, a cancel that hits the wrong state
 * queues nothing, and a replay does not double-queue (the state flip is the
 * guard). C3 is kept distinct from the D3 unpaid auto-cancel (`C3_meeting_
 * cancelled` vs `D3_unpaid_cancelled`) and carries no EA row.
 *
 * Runs against a DEDICATED vendor (off the seed + other suites). Cancellations go
 * through the production wrappers (releaseMeeting / cancelProposedMeeting) under
 * the admin staff session, exactly as the admin actions call them.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PASSWORD = "Passw0rd!test";

const RILEY = "00000000-0000-0000-0000-00000000ec02"; // seed exec, NO ea_id
const CHARITY = "00000000-0000-0000-0000-00000000c1a2";
const VENDOR = "00000000-0000-0000-0000-0000000a7061"; // dedicated
const VUSER = "00000000-0000-0000-0000-0000000a7062";

const SCHEDULED = "2026-09-01T03:00:00Z";

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
  await svc.from("request").delete().eq("vendor_id", VENDOR); // cascades meetings
  await svc.from("credit_lot").delete().eq("vendor_id", VENDOR);
  await svc.from("vendor_user").delete().eq("id", VUSER);
  await svc.from("vendor").delete().eq("id", VENDOR);
  await svc.from("vendor").insert({ id: VENDOR, name: "CancelTest Co", email_domain: "cancel.test", status: "active" });
  await svc.from("vendor_user").insert({ id: VUSER, vendor_id: VENDOR, email: "c@cancel.test", name: "Cass", role: "owner", status: "active" });
  await svc.from("vendor").update({ owner_user_id: VUSER }).eq("id", VENDOR);
}

/** Insert a meeting in a chosen state directly (INSERT bypasses the 0012 guard). */
async function makeMeeting(
  svc: SupabaseClient,
  opts: { status?: string; creditLotId?: string | null; scheduledAt?: string | null },
) {
  const { data: req } = await svc
    .from("request")
    .insert({ vendor_id: VENDOR, requested_by_user_id: VUSER, executive_id: RILEY, q1_what: "x", q2_why: "y", status: "accepted" })
    .select("id")
    .single();
  const { data: m } = await svc
    .from("meeting")
    .insert({
      request_id: req!.id,
      charity_id: CHARITY,
      status: opts.status ?? "confirmed",
      credit_lot_id: opts.creditLotId ?? null,
      scheduled_at: opts.scheduledAt ?? SCHEDULED,
    })
    .select("id")
    .single();
  return { reqId: req!.id as string, meetingId: m!.id as string };
}

async function statusOf(svc: SupabaseClient, meetingId: string) {
  const { data } = await svc.from("meeting").select("status").eq("id", meetingId).single();
  return data?.status as string;
}

async function c3For(svc: SupabaseClient, reqId: string) {
  const { data } = await svc
    .from("notification")
    .select("recipient_type, recipient_id, channel, event")
    .eq("request_id", reqId)
    .eq("event", "C3_meeting_cancelled");
  return data ?? [];
}

beforeEach(async () => {
  await freshVendor(service());
});

afterAll(async () => {
  const svc = service();
  await svc.from("request").delete().eq("vendor_id", VENDOR);
  await svc.from("credit_lot").delete().eq("vendor_id", VENDOR);
  await svc.from("vendor_user").delete().eq("id", VUSER);
  await svc.from("vendor").delete().eq("id", VENDOR);
});

describe("C3 meeting-cancelled notices", () => {
  it("cancelling a confirmed meeting queues a vendor + exec C3 (no EA)", async () => {
    const sb = await admin();
    const svc = service();
    const { reqId, meetingId } = await makeMeeting(svc, { status: "confirmed", creditLotId: null });

    const res = await releaseMeeting(sb, meetingId, "cancelled");
    expect(res).toMatchObject({ ok: true });
    expect(await statusOf(svc, meetingId)).toBe("cancelled");

    const notices = await c3For(svc, reqId);
    expect(notices.length).toBe(2);
    const vendorNote = notices.find((n) => n.recipient_type === "vendor_user");
    const execNote = notices.find((n) => n.recipient_type === "executive");
    expect(vendorNote?.channel).toBe("email");
    expect(vendorNote?.recipient_id).toBe(VUSER);
    expect(execNote?.channel).toBe("email");
    expect(execNote?.recipient_id).toBeNull();
    expect(notices.some((n) => n.recipient_type === "ea")).toBe(false);
  });

  it("cancelling a proposed meeting queues a vendor + exec C3", async () => {
    const sb = await admin();
    const svc = service();
    const { reqId, meetingId } = await makeMeeting(svc, { status: "proposed", scheduledAt: null });

    const res = await cancelProposedMeeting(sb, meetingId);
    expect(res).toMatchObject({ ok: true });
    expect(await statusOf(svc, meetingId)).toBe("cancelled");
    expect((await c3For(svc, reqId)).length).toBe(2);
  });

  it("a NO-SHOW (not a cancellation) queues no C3", async () => {
    const sb = await admin();
    const svc = service();
    const { reqId, meetingId } = await makeMeeting(svc, { status: "confirmed" });

    const res = await releaseMeeting(sb, meetingId, "no_show");
    expect(res).toMatchObject({ ok: true });
    expect(await statusOf(svc, meetingId)).toBe("no_show");
    expect((await c3For(svc, reqId)).length).toBe(0);
  });

  it("queues nothing when the cancellation does not succeed (wrong state)", async () => {
    const sb = await admin();
    const svc = service();
    // release_meeting requires `confirmed`; a proposed meeting fails -> no C3.
    const proposed = await makeMeeting(svc, { status: "proposed", scheduledAt: null });
    const rel = await releaseMeeting(sb, proposed.meetingId, "cancelled");
    expect(rel.ok).toBe(false);
    expect((await c3For(svc, proposed.reqId)).length).toBe(0);

    // cancel_proposed_meeting requires `proposed`; a confirmed meeting fails -> no C3.
    const confirmed = await makeMeeting(svc, { status: "confirmed" });
    const can = await cancelProposedMeeting(sb, confirmed.meetingId);
    expect(can.ok).toBe(false);
    expect((await c3For(svc, confirmed.reqId)).length).toBe(0);
  });

  it("is idempotent: a second cancel queues no second C3", async () => {
    const sb = await admin();
    const svc = service();
    const { reqId, meetingId } = await makeMeeting(svc, { status: "confirmed" });

    const first = await releaseMeeting(sb, meetingId, "cancelled");
    expect(first.ok).toBe(true);
    const second = await releaseMeeting(sb, meetingId, "cancelled");
    expect(second.ok).toBe(false); // already cancelled -> bad_state, no re-queue
    expect((await c3For(svc, reqId)).length).toBe(2);
  });
});
