import { describe, it, expect } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { markGiftPaid } from "../lib/gifts";
import { charityDonatedForPeriod } from "../lib/reporting";

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

describe("gift paid path", () => {
  // Regression for the paid_date defect: markGiftPaid stored only the
  // confirmation JSON, so the paid gift never matched the paid_date filter in
  // charityDonatedToDate and vanished from the FY donated figures.
  it("marking a gift paid writes paid_date so the FY donated report sees it", async () => {
    const sb = await admin();
    const { data: staff } = await sb.from("staff").select("id").limit(1).single();

    const { data: req } = await sb
      .from("request")
      .insert({ vendor_id: BETA, requested_by_user_id: BETA_USER, executive_id: RILEY, q1_what: "x", q2_why: "y", status: "accepted" })
      .select("id")
      .single();
    const { data: meeting } = await sb
      .from("meeting")
      .insert({ request_id: req!.id, charity_id: CHARITY, status: "held" })
      .select("id")
      .single();
    const today = new Date().toISOString().slice(0, 10);
    const { data: gift } = await sb
      .from("gift_record")
      .insert({
        meeting_id: meeting!.id,
        charity_id: CHARITY,
        band_at_completion: "band_1",
        charity_amount_cents: 90000,
        admin_fee_cents: 60000,
        status: "released",
        sat_date: today,
      })
      .select("id")
      .single();

    const before = await charityDonatedForPeriod(sb);

    const r = await markGiftPaid(sb, gift!.id as string, staff!.id as string);
    expect(r.ok).toBe(true);

    const { data: row } = await sb
      .from("gift_record")
      .select("status, paid_date, confirmation")
      .eq("id", gift!.id)
      .single();
    expect(row?.status).toBe("paid");
    expect(row?.paid_date).toBe(today);
    expect((row?.confirmation as { by: string })?.by).toBe(staff!.id);

    // The symptom the bug caused: the gift must now count toward FY donated.
    const after = await charityDonatedForPeriod(sb);
    expect(after.totalCents - before.totalCents).toBe(90000);

    // C7 queued on the flip: exec email + vendor in-app, with the EXACT frozen
    // amount and the charity name snapshotted into the payload.
    const { data: c7 } = await sb
      .from("notification")
      .select("recipient_type, recipient_id, channel, payload")
      .eq("request_id", req!.id)
      .eq("event", "C7_gift_confirmed");
    expect(c7?.length).toBe(2);
    const execNote = c7!.find((n) => n.recipient_type === "executive");
    const vendorNote = c7!.find((n) => n.recipient_type === "vendor_user");
    expect(execNote?.channel).toBe("email");
    expect(vendorNote?.channel).toBe("in_app");
    expect(vendorNote?.recipient_id).toBe(BETA_USER);
    for (const n of c7!) {
      expect((n.payload as { charity_amount_cents: number }).charity_amount_cents).toBe(90000);
      expect((n.payload as { charity_name: string }).charity_name).toBeTruthy();
    }

    // Only a released gift can be paid (guard, and DB trigger backs it).
    const again = await markGiftPaid(sb, gift!.id as string, staff!.id as string);
    expect(again.ok).toBe(false);

    // The failed re-pay queued no second C7 (the flip is the idempotency guard).
    const { data: c7After } = await sb
      .from("notification")
      .select("id")
      .eq("request_id", req!.id)
      .eq("event", "C7_gift_confirmed");
    expect(c7After?.length).toBe(2);

    await sb.from("notification").delete().eq("request_id", req!.id);
    await sb.from("request").delete().eq("id", req!.id);
  });
});
