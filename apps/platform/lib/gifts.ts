import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Gift-record transitions (STATE_MACHINES.md), run by staff. Lives in lib (not
 * the server action) so the DB-backed tests exercise the exact production path.
 */

type Result = { ok: true } | { ok: false; error: string };

/**
 * Mark a released gift as paid. `paid_date` MUST be written here: the reporting
 * layer (charityDonatedToDate, CALCULATIONS 2.2/2.13) filters paid gifts on the
 * `paid_date` column, so a paid gift without it silently vanishes from the FY
 * "donated to date" figures and the P&L. The `confirmation` JSON is evidence
 * for the audit trail, not what reporting reads.
 */
export async function markGiftPaid(
  supabase: SupabaseClient,
  giftId: string,
  staffId: string,
): Promise<Result> {
  const paidAt = new Date();
  const { data } = await supabase
    .from("gift_record")
    .update({
      status: "paid",
      paid_date: paidAt.toISOString().slice(0, 10),
      confirmation: { paid_at: paidAt.toISOString(), by: staffId },
    })
    .eq("id", giftId)
    .eq("status", "released")
    .select("id");
  return data?.length ? { ok: true } : { ok: false, error: "bad_state" };
}
