import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { markHeld } from "../lib/meetings";

/**
 * Vendor side of C6 (NOTIFICATION_TEMPLATES C6: "To vendor, email + in-app"): the
 * meeting-completed / gift-recorded note. mark_held already queues the exec C6
 * email + staff C5 task in-transaction; the markHeld WRAPPER adds the two vendor
 * rows (email + in_app) with the EXACT frozen amount + charity name snapshotted
 * into the payload. Proves they are queued once on the held flip, carry the right
 * payload, and are NOT re-queued on a replay (the flip is the idempotency guard).
 *
 * Runs against a DEDICATED vendor (off the seed + other suites). The meeting is
 * inserted directly in `confirmed` with a reserved credit (INSERT bypasses the
 * 0012 guard), then held through the production wrapper.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PASSWORD = "Passw0rd!test";

const RILEY = "00000000-0000-0000-0000-00000000ec02";
const CHARITY = "00000000-0000-0000-0000-00000000c1a2"; // OzHarvest
const VENDOR = "00000000-0000-0000-0000-0000000a7071"; // dedicated
const VUSER = "00000000-0000-0000-0000-0000000a7072";

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
  await svc.from("vendor").insert({ id: VENDOR, name: "CompleteTest Co", email_domain: "complete.test", status: "active" });
  await svc.from("vendor_user").insert({ id: VUSER, vendor_id: VENDOR, email: "k@complete.test", name: "Kim", role: "owner", status: "active" });
  await svc.from("vendor").update({ owner_user_id: VUSER }).eq("id", VENDOR);
}

/** A confirmed, credit-reserved meeting ready to be held. */
async function confirmedMeeting(svc: SupabaseClient) {
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
  return { reqId: req!.id as string, meetingId: m!.id as string };
}

async function c6VendorFor(svc: SupabaseClient, reqId: string) {
  const { data } = await svc
    .from("notification")
    .select("recipient_type, recipient_id, channel, payload")
    .eq("request_id", reqId)
    .eq("event", "C6_meeting_completed")
    .eq("recipient_type", "vendor_user");
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

describe("C6 vendor completion notice (markHeld wrapper)", () => {
  it("holding a meeting queues the vendor C6 email + in-app with the frozen payload", async () => {
    const sb = await admin();
    const svc = service();
    const { reqId, meetingId } = await confirmedMeeting(svc);

    const held = await markHeld(sb, meetingId, "admin");
    expect(held).toMatchObject({ ok: true, detail: "band_1" });

    const vendorC6 = await c6VendorFor(svc, reqId);
    expect(vendorC6.length).toBe(2);
    expect(vendorC6.some((n) => n.channel === "email")).toBe(true);
    expect(vendorC6.some((n) => n.channel === "in_app")).toBe(true);
    for (const n of vendorC6) {
      expect(n.recipient_id).toBe(VUSER);
      expect((n.payload as { charity_amount_cents: number }).charity_amount_cents).toBe(90000); // band 1 = $900
      expect((n.payload as { charity_name: string }).charity_name).toBe("OzHarvest");
    }

    // The exec C6 + staff C5 queued by mark_held are untouched (still exactly one each).
    const { data: execC6 } = await svc
      .from("notification")
      .select("id")
      .eq("request_id", reqId)
      .eq("event", "C6_meeting_completed")
      .eq("recipient_type", "executive");
    expect((execC6 ?? []).length).toBe(1);
  });

  it("is idempotent: a second markHeld does not re-queue the vendor C6", async () => {
    const sb = await admin();
    const svc = service();
    const { reqId, meetingId } = await confirmedMeeting(svc);

    const first = await markHeld(sb, meetingId, "admin");
    expect(first.ok).toBe(true);
    const second = await markHeld(sb, meetingId, "admin");
    expect(second.ok).toBe(false); // already held -> bad_state, no re-queue

    expect((await c6VendorFor(svc, reqId)).length).toBe(2);
  });
});
