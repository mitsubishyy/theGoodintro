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
 *
 * On the flip it queues the C7 notices (NOTIFICATION_TEMPLATES C7): the
 * executive email (from Issy, "your gift has reached {charity}") and the vendor
 * in-app note. The conditional UPDATE is the idempotency guard — only the one
 * call that flips released -> paid reaches the queue, so a double-click or replay
 * never double-queues C7.
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
    .select("id, meeting_id, charity_id, charity_amount_cents");
  if (!data?.length) return { ok: false, error: "bad_state" };
  await queueGiftConfirmed(supabase, data[0] as GiftFlip);
  return { ok: true };
}

type GiftFlip = { meeting_id: string; charity_id: string | null; charity_amount_cents: number };

/**
 * Queue the C7 gift-paid confirmation (NOTIFICATION_TEMPLATES C7): the exec email
 * and the vendor in-app note. Best-effort and deliberately AFTER the paid flip:
 * the paid record is the source of truth, so a queue hiccup must never un-pay a
 * gift. The EXACT frozen amount and the charity NAME are snapshotted into the
 * payload so the composer reads them straight (no re-derivation from the
 * request's latest meeting — a paid gift can later be reversed, which spawns a
 * new meeting on the request). The vendor row is `in_app`; there is no in-app
 * renderer yet, so it sits queued forward-compatibly, like mark_held's
 * C5_release_gift staff note.
 */
async function queueGiftConfirmed(supabase: SupabaseClient, gift: GiftFlip): Promise<void> {
  const { data: meeting } = await supabase
    .from("meeting")
    .select("request_id")
    .eq("id", gift.meeting_id)
    .maybeSingle();
  const requestId = meeting?.request_id as string | undefined;
  if (!requestId) return; // no request to resolve the exec/vendor from; skip (paid stands)

  const { data: req } = await supabase
    .from("request")
    .select("requested_by_user_id")
    .eq("id", requestId)
    .maybeSingle();
  const { data: charity } = gift.charity_id
    ? await supabase.from("charity").select("name").eq("id", gift.charity_id).maybeSingle()
    : { data: null };

  const payload = {
    charity_amount_cents: gift.charity_amount_cents,
    charity_name: (charity?.name as string | null) ?? null,
  };

  await supabase.from("notification").insert([
    {
      recipient_type: "executive",
      recipient_id: null,
      channel: "email",
      event: "C7_gift_confirmed",
      status: "queued",
      request_id: requestId,
      payload,
    },
    {
      recipient_type: "vendor_user",
      recipient_id: (req?.requested_by_user_id as string | null) ?? null,
      channel: "in_app",
      event: "C7_gift_confirmed",
      status: "queued",
      request_id: requestId,
      payload,
    },
  ]);
}
