import { describe, it, expect, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { confirmMeeting, markHeld, releaseMeeting, rescheduleMeeting, reverseHeld } from "../lib/meetings";
import { markGiftPaid } from "../lib/gifts";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const PASSWORD = "Passw0rd!test";
const BETA = "00000000-0000-0000-0000-00000000bd01";
const BETA_USER = "00000000-0000-0000-0000-00000000b5b1";
const RILEY = "00000000-0000-0000-0000-00000000ec02";
const CHARITY = "00000000-0000-0000-0000-00000000c1a2";

async function admin(): Promise<SupabaseClient> {
  const c = createClient(URL, KEY, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email: "admin@thegoodintro.test", password: PASSWORD });
  if (error) throw new Error(error.message);
  return c;
}

async function newProposedMeeting(sb: SupabaseClient) {
  const { data: req } = await sb
    .from("request")
    .insert({ vendor_id: BETA, requested_by_user_id: BETA_USER, executive_id: RILEY, q1_what: "x", q2_why: "y", status: "accepted" })
    .select("id")
    .single();
  const { data: meeting } = await sb
    .from("meeting")
    .insert({ request_id: req!.id, charity_id: CHARITY, status: "proposed" })
    .select("id")
    .single();
  return { reqId: req!.id as string, meetingId: meeting!.id as string };
}

describe("meeting money path", () => {
  it("reserve a credit, hold the meeting, lock the gift, consume the credit", async () => {
    const sb = await admin();
    const { data: lot } = await sb
      .from("credit_lot")
      .insert({ vendor_id: BETA, quantity: 1, quantity_remaining: 1 })
      .select("id")
      .single();
    const { reqId, meetingId } = await newProposedMeeting(sb);

    const confirm = await confirmMeeting(sb, meetingId, new Date(Date.now() + 7 * 864e5).toISOString(), "https://zoom.test/x");
    expect(confirm).toMatchObject({ ok: true, detail: "reserved" });

    const { data: m1 } = await sb.from("meeting").select("status, credit_lot_id").eq("id", meetingId).single();
    expect(m1?.status).toBe("confirmed");
    expect(m1?.credit_lot_id).toBe(lot!.id);

    const held = await markHeld(sb, meetingId, "admin");
    expect(held).toMatchObject({ ok: true, detail: "band_1" });

    const { data: gift } = await sb
      .from("gift_record")
      .select("charity_amount_cents, admin_fee_cents, band_at_completion, status")
      .eq("meeting_id", meetingId)
      .single();
    expect(gift).toMatchObject({
      charity_amount_cents: 90000,
      admin_fee_cents: 60000,
      band_at_completion: "band_1",
      status: "released",
    });

    const { data: lot2 } = await sb.from("credit_lot").select("quantity_remaining").eq("id", lot!.id).single();
    expect(lot2?.quantity_remaining).toBe(0);

    // cleanup (request delete cascades meeting + gift). markHeld now resolves/opens
    // a band cycle for Beta (DEC-4), so clear it too or it leaks into other suites.
    await sb.from("request").delete().eq("id", reqId);
    await sb.from("credit_lot").delete().eq("id", lot!.id);
    await sb.from("cycle").delete().eq("vendor_id", BETA);
  });

  it("reschedule edits a confirmed meeting's time + link without touching status or credit; rejects non-confirmed", async () => {
    const sb = await admin();
    const { data: lot } = await sb
      .from("credit_lot")
      .insert({ vendor_id: BETA, quantity: 1, quantity_remaining: 1 })
      .select("id")
      .single();
    const { reqId, meetingId } = await newProposedMeeting(sb);

    // A proposed meeting cannot be rescheduled (use the confirm flow first).
    const rejected = await rescheduleMeeting(sb, meetingId, new Date(Date.now() + 10 * 864e5).toISOString(), null);
    expect(rejected.ok).toBe(false);

    await confirmMeeting(sb, meetingId, new Date(Date.now() + 7 * 864e5).toISOString(), "https://zoom.test/a");
    const newWhen = new Date(Date.now() + 14 * 864e5).toISOString();
    const r = await rescheduleMeeting(sb, meetingId, newWhen, "https://zoom.test/b");
    expect(r).toMatchObject({ ok: true });

    const { data: m } = await sb
      .from("meeting")
      .select("status, scheduled_at, join_url, credit_lot_id")
      .eq("id", meetingId)
      .single();
    expect(m?.status).toBe("confirmed"); // status unchanged
    expect(m?.credit_lot_id).toBe(lot!.id); // credit reservation untouched
    expect(m?.join_url).toBe("https://zoom.test/b");
    expect(new Date(m!.scheduled_at as string).toISOString()).toBe(newWhen);

    await sb.from("request").delete().eq("id", reqId);
    await sb.from("credit_lot").delete().eq("id", lot!.id);
  });

  it("with no credit, confirm schedules at least 30 days out (overcommit)", async () => {
    const sb = await admin();
    const { reqId, meetingId } = await newProposedMeeting(sb);

    const confirm = await confirmMeeting(sb, meetingId, null, null);
    expect(confirm).toMatchObject({ ok: true, detail: "overcommit" });

    const { data: m } = await sb.from("meeting").select("scheduled_at, payment_due_at, credit_lot_id").eq("id", meetingId).single();
    expect(m?.credit_lot_id).toBeNull();
    const days = (new Date(m!.scheduled_at as string).getTime() - Date.now()) / 864e5;
    expect(days).toBeGreaterThanOrEqual(29.5);
    expect(m?.payment_due_at).toBeTruthy();

    await sb.from("request").delete().eq("id", reqId);
  });

  it("no-show releases the reservation", async () => {
    const sb = await admin();
    const { data: lot } = await sb
      .from("credit_lot")
      .insert({ vendor_id: BETA, quantity: 1, quantity_remaining: 1 })
      .select("id")
      .single();
    const { reqId, meetingId } = await newProposedMeeting(sb);
    await confirmMeeting(sb, meetingId, new Date(Date.now() + 7 * 864e5).toISOString(), null);

    const released = await releaseMeeting(sb, meetingId, "no_show");
    expect(released.ok).toBe(true);
    const { data: m } = await sb.from("meeting").select("status, credit_lot_id").eq("id", meetingId).single();
    expect(m?.status).toBe("no_show");
    expect(m?.credit_lot_id).toBeNull();
    // credit not consumed
    const { data: l } = await sb.from("credit_lot").select("quantity_remaining").eq("id", lot!.id).single();
    expect(l?.quantity_remaining).toBe(1);

    await sb.from("request").delete().eq("id", reqId);
    await sb.from("credit_lot").delete().eq("id", lot!.id);
  });

  it("reversing a held meeting returns the credit, voids the gift, frees the band position, spawns a rebook", async () => {
    const sb = await admin();
    const { data: lot } = await sb
      .from("credit_lot")
      .insert({ vendor_id: BETA, quantity: 1, quantity_remaining: 1 })
      .select("id")
      .single();
    const { reqId, meetingId } = await newProposedMeeting(sb);
    await confirmMeeting(sb, meetingId, new Date(Date.now() + 7 * 864e5).toISOString(), null);
    await markHeld(sb, meetingId, "admin");

    const reversed = await reverseHeld(sb, meetingId);
    expect(reversed).toMatchObject({ ok: true, detail: "gift_voided" });

    const { data: m } = await sb.from("meeting").select("status").eq("id", meetingId).single();
    expect(m?.status).toBe("reversed");

    const { data: gift } = await sb.from("gift_record").select("status").eq("meeting_id", meetingId).single();
    expect(gift?.status).toBe("voided");

    const { data: l } = await sb.from("credit_lot").select("quantity_remaining").eq("id", lot!.id).single();
    expect(l?.quantity_remaining).toBe(1);

    const { data: cycle } = await sb.from("cycle").select("held_meetings_count").eq("vendor_id", BETA).single();
    expect(cycle?.held_meetings_count).toBe(0);

    // The rebook: a fresh proposed meeting on the same request.
    const { data: rebook } = await sb
      .from("meeting")
      .select("id, status")
      .eq("request_id", reqId)
      .eq("status", "proposed");
    expect(rebook?.length).toBe(1);

    // A reversed meeting is terminal — a second reversal is a no-op error.
    const again = await reverseHeld(sb, meetingId);
    expect(again.ok).toBe(false);

    await sb.from("request").delete().eq("id", reqId);
    await sb.from("credit_lot").delete().eq("id", lot!.id);
    await sb.from("cycle").delete().eq("vendor_id", BETA);
  });

  it("reversing after the gift was paid keeps the gift (goodwill) but still returns the credit", async () => {
    const sb = await admin();
    const { data: staff } = await sb.from("staff").select("id").limit(1).single();
    const { data: lot } = await sb
      .from("credit_lot")
      .insert({ vendor_id: BETA, quantity: 1, quantity_remaining: 1 })
      .select("id")
      .single();
    const { reqId, meetingId } = await newProposedMeeting(sb);
    await confirmMeeting(sb, meetingId, new Date(Date.now() + 7 * 864e5).toISOString(), null);
    await markHeld(sb, meetingId, "admin");

    const { data: gift } = await sb.from("gift_record").select("id").eq("meeting_id", meetingId).single();
    await markGiftPaid(sb, gift!.id as string, staff!.id as string);

    const reversed = await reverseHeld(sb, meetingId);
    expect(reversed).toMatchObject({ ok: true, detail: "gift_paid_kept" });

    // Paid is terminal: the donation stands, the credit return is goodwill.
    const { data: g } = await sb.from("gift_record").select("status").eq("meeting_id", meetingId).single();
    expect(g?.status).toBe("paid");

    const { data: l } = await sb.from("credit_lot").select("quantity_remaining").eq("id", lot!.id).single();
    expect(l?.quantity_remaining).toBe(1);

    // The paid gift still counts toward the band, so the position is kept.
    const { data: cycle } = await sb.from("cycle").select("held_meetings_count").eq("vendor_id", BETA).single();
    expect(cycle?.held_meetings_count).toBe(1);

    await sb.from("request").delete().eq("id", reqId);
    await sb.from("credit_lot").delete().eq("id", lot!.id);
    await sb.from("cycle").delete().eq("vendor_id", BETA);
  });

  // Defensive: ensure no Beta band cycle leaks out of this file even if a test
  // fails before its own cleanup runs.
  afterAll(async () => {
    const sb = await admin();
    await sb.from("cycle").delete().eq("vendor_id", BETA);
  });
});
