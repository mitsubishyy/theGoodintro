import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { markHeld, reverseHeld } from "../lib/meetings";
import { markGiftPaid } from "../lib/gifts";

/**
 * E1 reversal/rebook notices (NOTIFICATION_TEMPLATES E1). reverse_held queues
 * nothing; the reverseHeld WRAPPER queues the vendor note (email + in-app), the
 * exec note (email), and the staff dashboard task (in_app, carrying whether a
 * paid gift was kept as a goodwill cost). Proves the four rows are queued on the
 * reversal, the staff flag reflects gift_voided vs gift_paid_kept, and a replay
 * does not re-queue (the held->reversed flip is the guard). Reversal money logic
 * is unchanged (asserted by the existing meetings.test.ts; here we only check the
 * notices).
 *
 * Runs against a DEDICATED vendor. The meeting is inserted confirmed + reserved,
 * held through the wrapper, then reversed through the wrapper.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PASSWORD = "Passw0rd!test";

const RILEY = "00000000-0000-0000-0000-00000000ec02";
const CHARITY = "00000000-0000-0000-0000-00000000c1a2";
const VENDOR = "00000000-0000-0000-0000-0000000a7081"; // dedicated
const VUSER = "00000000-0000-0000-0000-0000000a7082";

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
  await svc.from("request").delete().eq("vendor_id", VENDOR);
  await svc.from("credit_lot").delete().eq("vendor_id", VENDOR);
  await svc.from("cycle").delete().eq("vendor_id", VENDOR);
  await svc.from("vendor_user").delete().eq("id", VUSER);
  await svc.from("vendor").delete().eq("id", VENDOR);
  await svc.from("vendor").insert({ id: VENDOR, name: "ReverseTest Co", email_domain: "reverse.test", status: "active" });
  await svc.from("vendor_user").insert({ id: VUSER, vendor_id: VENDOR, email: "v@reverse.test", name: "Val", role: "owner", status: "active" });
  await svc.from("vendor").update({ owner_user_id: VUSER }).eq("id", VENDOR);
}

/** A held meeting (confirmed + reserved, then held) ready to be reversed. */
async function heldMeeting(svc: SupabaseClient, sb: SupabaseClient) {
  const { data: lot } = await svc
    .from("credit_lot")
    .insert({ vendor_id: VENDOR, quantity: 1, quantity_remaining: 1 })
    .select("id")
    .single();
  const { data: req } = await svc
    .from("request")
    .insert({ vendor_id: VENDOR, requested_by_user_id: VUSER, executive_id: RILEY, q1_what: "x", q2_why: "y", status: "accepted" })
    .select("id")
    .single();
  const { data: m } = await svc
    .from("meeting")
    .insert({ request_id: req!.id, charity_id: CHARITY, status: "confirmed", credit_lot_id: lot!.id })
    .select("id")
    .single();
  await markHeld(sb, m!.id as string, "admin");
  return { reqId: req!.id as string, meetingId: m!.id as string };
}

async function e1For(svc: SupabaseClient, reqId: string) {
  const { data } = await svc
    .from("notification")
    .select("recipient_type, recipient_id, channel, event, payload")
    .eq("request_id", reqId)
    .in("event", ["E1_reversal_rebook", "E1_reversal_admin"]);
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

describe("E1 reversal/rebook notices (reverseHeld wrapper)", () => {
  it("reversing a held meeting (released gift) queues vendor + exec + staff, flag not-paid", async () => {
    const sb = await admin();
    const svc = service();
    const { reqId, meetingId } = await heldMeeting(svc, sb);

    const res = await reverseHeld(sb, meetingId);
    expect(res).toMatchObject({ ok: true, detail: "gift_voided" });

    const e1 = await e1For(svc, reqId);
    // 3 customer rows + 1 staff row.
    const rebook = e1.filter((n) => n.event === "E1_reversal_rebook");
    const adminTask = e1.filter((n) => n.event === "E1_reversal_admin");
    expect(rebook.length).toBe(3);
    expect(rebook.some((n) => n.recipient_type === "vendor_user" && n.channel === "email" && n.recipient_id === VUSER)).toBe(true);
    expect(rebook.some((n) => n.recipient_type === "vendor_user" && n.channel === "in_app")).toBe(true);
    expect(rebook.some((n) => n.recipient_type === "executive" && n.channel === "email")).toBe(true);
    expect(rebook.some((n) => n.recipient_type === "ea")).toBe(false);

    expect(adminTask.length).toBe(1);
    expect(adminTask[0].recipient_type).toBe("staff");
    expect(adminTask[0].channel).toBe("in_app");
    expect((adminTask[0].payload as { gift_paid_kept: boolean }).gift_paid_kept).toBe(false);
  });

  it("reversing after the gift was paid sets the staff goodwill flag true", async () => {
    const sb = await admin();
    const svc = service();
    const { data: staff } = await sb.from("staff").select("id").limit(1).single();
    const { reqId, meetingId } = await heldMeeting(svc, sb);

    const { data: gift } = await svc.from("gift_record").select("id").eq("meeting_id", meetingId).single();
    await markGiftPaid(sb, gift!.id as string, staff!.id as string);

    const res = await reverseHeld(sb, meetingId);
    expect(res).toMatchObject({ ok: true, detail: "gift_paid_kept" });

    const adminTask = (await e1For(svc, reqId)).filter((n) => n.event === "E1_reversal_admin");
    expect(adminTask.length).toBe(1);
    expect((adminTask[0].payload as { gift_paid_kept: boolean }).gift_paid_kept).toBe(true);
  });

  it("is idempotent: a second reversal does not re-queue E1", async () => {
    const sb = await admin();
    const svc = service();
    const { reqId, meetingId } = await heldMeeting(svc, sb);

    const first = await reverseHeld(sb, meetingId);
    expect(first.ok).toBe(true);
    const second = await reverseHeld(sb, meetingId);
    expect(second.ok).toBe(false); // reversed is terminal -> bad_state, no re-queue

    // Still 3 customer + 1 staff = 4 E1 rows.
    expect((await e1For(svc, reqId)).length).toBe(4);
  });
});
