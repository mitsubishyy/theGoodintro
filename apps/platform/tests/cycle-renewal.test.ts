import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cycleEndsAt } from "@thegoodintro/pricing/ledger";
import { markHeld } from "../lib/meetings";

/**
 * DEC-4: the charity band cycle runs on a rolling 12-month window anchored on the
 * vendor's first cycle and RESETS to band 1 at each renewal. markHeld resolves the
 * window containing `now` and, if a 12-month boundary was crossed, opens the next
 * cycle lazily. This test holds a meeting in a vendor whose only cycle already
 * ended (with 5 held), and proves the gift comes out band 1 (not band 2), a second
 * cycle is created, and the DEC-3 snapshot columns are populated.
 *
 * Uses a throwaway, isolated vendor so cross-file cycle state cannot interfere.
 */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const PASSWORD = "Passw0rd!test";
const RILEY = "00000000-0000-0000-0000-00000000ec02";
const CHARITY = "00000000-0000-0000-0000-00000000c1a2";
const VENDOR = "00000000-0000-0000-0000-0000000ce001";
const USER = "00000000-0000-0000-0000-0000000ce0a1";
const MONTH = 30 * 864e5;

async function admin(): Promise<SupabaseClient> {
  const c = createClient(URL, KEY, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email: "admin@thegoodintro.test", password: PASSWORD });
  if (error) throw new Error(error.message);
  return c;
}

describe("band cycle renewal (DEC-4)", () => {
  let sb: SupabaseClient;

  beforeAll(async () => {
    if (!URL || !KEY) throw new Error("Supabase env vars are not set");
    sb = await admin();
    await sb.from("vendor").upsert({ id: VENDOR, name: "Renew Co", email_domain: "renew.test", status: "active" });
    await sb.from("vendor_user").upsert({ id: USER, vendor_id: VENDOR, email: "owner@renew.test", name: "Renew Owner", role: "owner", status: "active" });
  });

  afterAll(async () => {
    await sb.from("request").delete().eq("vendor_id", VENDOR);   // cascades meeting + gift
    await sb.from("credit_lot").delete().eq("vendor_id", VENDOR);
    await sb.from("cycle").delete().eq("vendor_id", VENDOR);
    await sb.from("vendor_user").delete().eq("vendor_id", VENDOR);
    await sb.from("vendor").delete().eq("id", VENDOR);
  });

  it("a meeting held after the 12-month boundary opens a new cycle and resets to band 1", async () => {
    const now = Date.now();
    // The vendor's only cycle started ~13 months ago and already ended (~1 month
    // ago), with 5 meetings held. If the band did NOT reset, the next meeting
    // would be the 6th (band 2 = $1,000). It must reset to band 1 ($900).
    const oldStart = new Date(now - 13 * MONTH);
    const oldEnd = cycleEndsAt(oldStart); // exactly +12 calendar months => ~1 month ago
    await sb.from("cycle").insert({
      vendor_id: VENDOR,
      started_at: oldStart.toISOString(),
      ends_at: oldEnd.toISOString(),
      held_meetings_count: 5,
    });

    const { data: lot } = await sb.from("credit_lot").insert({ vendor_id: VENDOR, quantity: 1, quantity_remaining: 1 }).select("id").single();
    const { data: req } = await sb.from("request").insert({ vendor_id: VENDOR, requested_by_user_id: USER, executive_id: RILEY, q1_what: "x", q2_why: "y", status: "accepted" }).select("id").single();
    const { data: meeting } = await sb.from("meeting").insert({ request_id: req!.id, charity_id: CHARITY, status: "confirmed", credit_lot_id: lot!.id }).select("id").single();

    const held = await markHeld(sb, meeting!.id as string, "admin");
    expect(held).toMatchObject({ ok: true, detail: "band_1" }); // RESET, not band_2

    const { data: gift } = await sb
      .from("gift_record")
      .select("band_at_completion, charity_amount_cents, admin_fee_cents, position_n, cycle_number, schedule_version, sat_date")
      .eq("meeting_id", meeting!.id)
      .single();
    expect(gift).toMatchObject({
      band_at_completion: "band_1",
      charity_amount_cents: 90000,
      admin_fee_cents: 60000,
      position_n: 1,        // first held in the NEW cycle
      cycle_number: 2,      // the vendor's second cycle
      schedule_version: "v1",
    });
    expect(gift!.sat_date).toBe(new Date(now).toISOString().slice(0, 10));

    // A second cycle now exists, contains `now`, and counted this hold; the old
    // cycle is untouched.
    const { data: cycles } = await sb
      .from("cycle")
      .select("started_at, ends_at, held_meetings_count")
      .eq("vendor_id", VENDOR)
      .order("started_at", { ascending: true });
    expect(cycles).toHaveLength(2);
    expect(cycles![0].held_meetings_count).toBe(5); // old, untouched
    expect(cycles![1].held_meetings_count).toBe(1); // new renewal cycle
    expect(new Date(cycles![1].started_at as string).getTime()).toBeLessThanOrEqual(now);
    expect(new Date(cycles![1].ends_at as string).getTime()).toBeGreaterThan(now);

    // Credit consumed.
    const { data: l } = await sb.from("credit_lot").select("quantity_remaining").eq("id", lot!.id).single();
    expect(l?.quantity_remaining).toBe(0);
  });
});
