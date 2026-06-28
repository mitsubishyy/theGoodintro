import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { queueOverduePaymentReminders } from "../lib/meetings";

/**
 * D2 payment reminder for unpaid overcommit meetings (STATE_MACHINES.md
 * uncredited-payment sub-flow step 3: "Reminders: at booking, and ~7 days before
 * payment_due_at"; NOTIFICATION_TEMPLATES "D2 · Payment reminder"; migration
 * 0035). Proves the scan queues a single VENDOR D2 only for the right rows
 * (confirmed, uncredited, not-yet-due, inside the 7-day window, not already
 * reminded), stamps payment_reminder_sent_at, audits, and — the no-spam contract
 * — never re-reminds a meeting on a re-run.
 *
 * Runs against a DEDICATED vendor (off the seed's Alpha/Beta AND off the
 * auto-cancel suite's vendor) so it can never collide with a seed-pinned
 * reporting invariant or another parallel suite. Meetings are inserted directly
 * in `confirmed` (the 0012 guard only fires on UPDATE), so the window fixture is
 * exact and deterministic.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PASSWORD = "Passw0rd!test";

const RILEY = "00000000-0000-0000-0000-00000000ec02"; // seed exec, NO ea_id
const CHARITY = "00000000-0000-0000-0000-00000000c1a2";
const VENDOR = "00000000-0000-0000-0000-0000000a7041"; // dedicated; off auto-cancel's 0a7021
const VUSER = "00000000-0000-0000-0000-0000000a7042";

/** A fixed `p_now`; the wrapper derives the window end (now + 7 days) from it. */
const NOW = new Date("2024-06-01T00:00:00Z");
const IN_WINDOW = "2024-06-05T00:00:00Z"; // 4 days out — inside the 7-day window
const WINDOW_EDGE = "2024-06-08T00:00:00Z"; // exactly 7 days out — inclusive edge
const FAR_OUT = "2024-06-20T00:00:00Z"; // 19 days out — not yet in the window
const PAST_DUE = "2020-01-01T00:00:00Z"; // already past — D3's job, never reminded
const DUE_NOW = "2024-06-01T00:00:00Z"; // exactly now — not > now, excluded

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
  await svc.from("vendor").insert({ id: VENDOR, name: "ReminderTest Co", email_domain: "reminder.test", status: "active" });
  await svc.from("vendor_user").insert({ id: VUSER, vendor_id: VENDOR, email: "r@reminder.test", name: "Remy", role: "owner", status: "active" });
  await svc.from("vendor").update({ owner_user_id: VUSER }).eq("id", VENDOR);
}

/** Insert a meeting in a chosen state directly (INSERT bypasses the 0012 UPDATE guard). */
async function makeMeeting(
  svc: SupabaseClient,
  opts: {
    status?: string;
    creditLotId?: string | null;
    paymentDueAt?: string | null;
    scheduledAt?: string | null;
    reminderSentAt?: string | null;
  },
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
      payment_due_at: opts.paymentDueAt ?? null,
      scheduled_at: opts.scheduledAt ?? "2024-07-05T00:00:00Z",
      payment_reminder_sent_at: opts.reminderSentAt ?? null,
    })
    .select("id")
    .single();
  return { reqId: req!.id as string, meetingId: m!.id as string };
}

async function meetingRow(svc: SupabaseClient, meetingId: string) {
  const { data } = await svc
    .from("meeting")
    .select("status, payment_reminder_sent_at")
    .eq("id", meetingId)
    .single();
  return data as { status: string; payment_reminder_sent_at: string | null };
}

async function d2NoticesFor(svc: SupabaseClient, reqId: string) {
  const { data } = await svc
    .from("notification")
    .select("recipient_type, recipient_id, event")
    .eq("request_id", reqId)
    .eq("event", "D2_payment_reminder");
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

describe("D2 payment reminder queue (0035)", () => {
  it("queues a single vendor D2, stamps the meeting, and audits", async () => {
    const sb = await admin();
    const svc = service();
    const { reqId, meetingId } = await makeMeeting(svc, { paymentDueAt: IN_WINDOW });

    const res = await queueOverduePaymentReminders(sb, NOW);
    expect(res).toMatchObject({ ok: true, queued: 1 });

    // Exactly one D2 notice, to the requesting vendor user. No exec/EA copy exists.
    const notices = await d2NoticesFor(svc, reqId);
    expect(notices.length).toBe(1);
    expect(notices[0].recipient_type).toBe("vendor_user");
    expect(notices[0].recipient_id).toBe(VUSER);

    // The meeting stays confirmed (D2 is not a state move) and is stamped at p_now.
    const m = await meetingRow(svc, meetingId);
    expect(m.status).toBe("confirmed");
    expect(m.payment_reminder_sent_at).not.toBeNull();
    expect(new Date(m.payment_reminder_sent_at!).toISOString()).toBe(NOW.toISOString());

    const { data: au } = await svc
      .from("audit_entry")
      .select("id")
      .eq("action", "meeting.payment_reminder_queued")
      .eq("target_id", meetingId);
    expect((au ?? []).length).toBe(1);
  });

  it("includes the inclusive 7-day window edge", async () => {
    const sb = await admin();
    const svc = service();
    const { reqId } = await makeMeeting(svc, { paymentDueAt: WINDOW_EDGE });

    const res = await queueOverduePaymentReminders(sb, NOW);
    expect(res).toMatchObject({ ok: true, queued: 1 });
    expect((await d2NoticesFor(svc, reqId)).length).toBe(1);
  });

  it("never reminds a credited, past-due, far-out, due-now, proposed, or already-reminded meeting", async () => {
    const sb = await admin();
    const svc = service();

    const { data: lot } = await svc
      .from("credit_lot")
      .insert({ vendor_id: VENDOR, quantity: 1, quantity_remaining: 1 })
      .select("id")
      .single();
    const credited = await makeMeeting(svc, { creditLotId: lot!.id as string, paymentDueAt: IN_WINDOW });
    const pastDue = await makeMeeting(svc, { paymentDueAt: PAST_DUE }); // D3's job, not D2
    const farOut = await makeMeeting(svc, { paymentDueAt: FAR_OUT }); // not yet in window
    const dueNow = await makeMeeting(svc, { paymentDueAt: DUE_NOW }); // not strictly in the future
    const proposed = await makeMeeting(svc, { status: "proposed", paymentDueAt: IN_WINDOW });
    const reminded = await makeMeeting(svc, { paymentDueAt: IN_WINDOW, reminderSentAt: "2024-05-30T00:00:00Z" });

    const res = await queueOverduePaymentReminders(sb, NOW);
    expect(res).toMatchObject({ ok: true, queued: 0 });

    for (const m of [credited, pastDue, farOut, dueNow, proposed, reminded]) {
      expect((await d2NoticesFor(svc, m.reqId)).length).toBe(0);
    }
    // The already-reminded meeting's stamp is left exactly as it was (not bumped).
    const remindedStamp = (await meetingRow(svc, reminded.meetingId)).payment_reminder_sent_at;
    expect(new Date(remindedStamp!).toISOString()).toBe(new Date("2024-05-30T00:00:00Z").toISOString());
    // The reserved credit is untouched.
    const { data: after } = await svc.from("credit_lot").select("quantity_remaining").eq("id", lot!.id).single();
    expect(after?.quantity_remaining).toBe(1);
  });

  it("is idempotent: a second run queues nothing new and does not re-notify", async () => {
    const sb = await admin();
    const svc = service();
    const { reqId, meetingId } = await makeMeeting(svc, { paymentDueAt: IN_WINDOW });

    const first = await queueOverduePaymentReminders(sb, NOW);
    expect(first).toMatchObject({ ok: true, queued: 1 });
    const second = await queueOverduePaymentReminders(sb, NOW);
    expect(second).toMatchObject({ ok: true, queued: 0 });

    expect((await d2NoticesFor(svc, reqId)).length).toBe(1); // not doubled
    const { data: au } = await svc
      .from("audit_entry")
      .select("id")
      .eq("action", "meeting.payment_reminder_queued")
      .eq("target_id", meetingId);
    expect((au ?? []).length).toBe(1);
  });

  it("queues every in-window meeting in one run and counts them", async () => {
    const sb = await admin();
    const svc = service();
    const a = await makeMeeting(svc, { paymentDueAt: IN_WINDOW });
    const b = await makeMeeting(svc, { paymentDueAt: WINDOW_EDGE });
    const safe = await makeMeeting(svc, { paymentDueAt: FAR_OUT }); // excluded

    const res = await queueOverduePaymentReminders(sb, NOW);
    expect(res).toMatchObject({ ok: true, queued: 2 });
    expect((await d2NoticesFor(svc, a.reqId)).length).toBe(1);
    expect((await d2NoticesFor(svc, b.reqId)).length).toBe(1);
    expect((await d2NoticesFor(svc, safe.reqId)).length).toBe(0);
  });
});
