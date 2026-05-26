import type { SupabaseClient } from "@supabase/supabase-js";
import { giftSplitForHeldMeeting } from "@thegoodintro/pricing";
import {
  canOverbook,
  earliestUncreditedSchedule,
  paymentDueAt,
} from "@thegoodintro/pricing/ledger";

/**
 * Meeting state-machine transitions (STATE_MACHINES.md), run by staff (or the
 * service role). Credit reserve/consume/release and gift creation live here so
 * the booking flow never re-implements the money math — the split comes from
 * @thegoodintro/pricing. Each transition flips state with a conditional update
 * so a double-submit can't double-apply.
 */

type Result = { ok: true; detail?: string } | { ok: false; error: string };

async function vendorIdForMeeting(supabase: SupabaseClient, meetingId: string) {
  const { data } = await supabase
    .from("meeting")
    .select("id, status, credit_lot_id, charity_id, request:request_id(vendor_id)")
    .eq("id", meetingId)
    .maybeSingle();
  if (!data) return null;
  const req = Array.isArray(data.request) ? data.request[0] : data.request;
  return { meeting: data, vendorId: req?.vendor_id as string };
}

/** Available = sum(remaining) − reserved (confirmed meetings holding a credit). */
async function reservedCount(supabase: SupabaseClient, vendorId: string) {
  const { count } = await supabase
    .from("meeting")
    .select("id, request:request_id!inner(vendor_id)", { count: "exact", head: true })
    .eq("status", "confirmed")
    .not("credit_lot_id", "is", null)
    .eq("request.vendor_id", vendorId);
  return count ?? 0;
}

async function unpaidOvercommitCount(supabase: SupabaseClient, vendorId: string) {
  const { count } = await supabase
    .from("meeting")
    .select("id, request:request_id!inner(vendor_id)", { count: "exact", head: true })
    .eq("status", "confirmed")
    .is("credit_lot_id", null)
    .eq("request.vendor_id", vendorId);
  return count ?? 0;
}

/** Confirm a time: reserve a credit if available, else schedule as overcommit. */
export async function confirmMeeting(
  supabase: SupabaseClient,
  meetingId: string,
  scheduledAtISO: string | null,
  joinUrl: string | null,
): Promise<Result> {
  const ctx = await vendorIdForMeeting(supabase, meetingId);
  if (!ctx) return { ok: false, error: "not_found" };
  const { vendorId } = ctx;

  const { data: lots } = await supabase
    .from("credit_lot")
    .select("id, quantity_remaining, purchased_at")
    .eq("vendor_id", vendorId)
    .gt("quantity_remaining", 0)
    .order("purchased_at", { ascending: true });
  const remaining = (lots ?? []).reduce((s, l) => s + (l.quantity_remaining as number), 0);
  const reserved = await reservedCount(supabase, vendorId);
  const available = remaining - reserved;

  let creditLotId: string | null = null;
  let scheduledAt = scheduledAtISO;
  let paymentDue: string | null = null;

  if (available > 0) {
    // Pick the oldest lot with spare capacity (remaining > its reservations).
    for (const lot of lots ?? []) {
      const { count } = await supabase
        .from("meeting")
        .select("id", { count: "exact", head: true })
        .eq("status", "confirmed")
        .eq("credit_lot_id", lot.id);
      if ((lot.quantity_remaining as number) > (count ?? 0)) {
        creditLotId = lot.id as string;
        break;
      }
    }
  } else {
    // Overcommit: cap of 4, at least 30 days out, payment due 30 days before.
    if (!canOverbook(await unpaidOvercommitCount(supabase, vendorId))) {
      return { ok: false, error: "overcommit_cap_reached" };
    }
    const minDate = earliestUncreditedSchedule(new Date());
    let when = scheduledAtISO ? new Date(scheduledAtISO) : minDate;
    if (when < minDate) when = minDate;
    scheduledAt = when.toISOString();
    paymentDue = paymentDueAt(when).toISOString();
  }

  const { data: updated } = await supabase
    .from("meeting")
    .update({
      status: "confirmed",
      scheduled_at: scheduledAt,
      join_url: joinUrl,
      credit_lot_id: creditLotId,
      payment_due_at: paymentDue,
    })
    .eq("id", meetingId)
    .in("status", ["proposed", "confirmed"])
    .select("id");
  if (!updated?.length) return { ok: false, error: "bad_state" };

  await supabase.from("notification").insert({
    recipient_type: "vendor_user",
    recipient_id: null,
    channel: "email",
    event: creditLotId ? "C2_time_confirmed" : "D1_uncredited_booked",
    status: "queued",
  });

  return { ok: true, detail: creditLotId ? "reserved" : "overcommit" };
}

/** Meeting held: consume the credit, lock the gift split, advance the band. */
export async function markHeld(
  supabase: SupabaseClient,
  meetingId: string,
  source: "zoom_teams_api" | "vendor_reported" | "admin" = "zoom_teams_api",
): Promise<Result> {
  const ctx = await vendorIdForMeeting(supabase, meetingId);
  if (!ctx) return { ok: false, error: "not_found" };
  const { meeting, vendorId } = ctx;

  const { data: flipped } = await supabase
    .from("meeting")
    .update({ status: "held", outcome_source: source })
    .eq("id", meetingId)
    .eq("status", "confirmed")
    .select("id");
  if (!flipped?.length) return { ok: false, error: "bad_state" };

  const { data: cycle } = await supabase
    .from("cycle")
    .select("id, held_meetings_count")
    .eq("vendor_id", vendorId)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const heldBefore = (cycle?.held_meetings_count as number) ?? 0;
  const split = giftSplitForHeldMeeting(heldBefore);

  // Consume the reserved credit.
  if (meeting.credit_lot_id) {
    const { data: lot } = await supabase
      .from("credit_lot")
      .select("quantity_remaining")
      .eq("id", meeting.credit_lot_id)
      .single();
    await supabase
      .from("credit_lot")
      .update({ quantity_remaining: Math.max(0, (lot?.quantity_remaining as number) - 1) })
      .eq("id", meeting.credit_lot_id);
  }

  if (cycle) {
    await supabase
      .from("cycle")
      .update({ held_meetings_count: heldBefore + 1 })
      .eq("id", cycle.id);
  }

  // One canonical gift record per held meeting (meeting_id is unique).
  await supabase.from("gift_record").insert({
    meeting_id: meetingId,
    charity_id: meeting.charity_id,
    band_at_completion: split.bandKey,
    charity_amount_cents: split.charityCents,
    admin_fee_cents: split.adminCents,
    status: "released",
  });

  await supabase.from("notification").insert([
    { recipient_type: "executive", recipient_id: null, channel: "email", event: "C6_meeting_completed", status: "queued" },
    { recipient_type: "staff", recipient_id: null, channel: "in_app", event: "C5_release_gift", status: "queued" },
  ]);

  return { ok: true, detail: split.bandKey };
}

/** No-show or cancellation: release the reservation, no gift. */
export async function releaseMeeting(
  supabase: SupabaseClient,
  meetingId: string,
  outcome: "no_show" | "cancelled",
): Promise<Result> {
  const { data: flipped } = await supabase
    .from("meeting")
    .update({ status: outcome, credit_lot_id: null })
    .eq("id", meetingId)
    .eq("status", "confirmed")
    .select("id");
  if (!flipped?.length) return { ok: false, error: "bad_state" };
  return { ok: true };
}
