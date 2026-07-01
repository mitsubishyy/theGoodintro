import type { SupabaseClient } from "@supabase/supabase-js";
import { giftSplitForHeldMeeting, SCHEDULE_VERSION } from "@thegoodintro/pricing";
import {
  canOverbook,
  cycleEndsAt,
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
    .select("id, status, request_id, credit_lot_id, charity_id, request:request_id(vendor_id)")
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
    request_id: ctx.meeting.request_id,
  });

  return { ok: true, detail: creditLotId ? "reserved" : "overcommit" };
}

/**
 * Edit the time / join link of an already-confirmed meeting (admin reschedule).
 * Status does not change, so the transition guard passes it freely (0012) and no
 * credit is touched — a credited meeting keeps its reservation, an uncredited
 * (overcommit) meeting just re-derives its payment-due date from the new time.
 */
export async function rescheduleMeeting(
  supabase: SupabaseClient,
  meetingId: string,
  scheduledAtISO: string | null,
  joinUrl: string | null,
): Promise<Result> {
  const { data: m } = await supabase
    .from("meeting")
    .select("id, status, credit_lot_id")
    .eq("id", meetingId)
    .maybeSingle();
  if (!m) return { ok: false, error: "not_found" };
  if (m.status !== "confirmed") return { ok: false, error: "bad_state" };

  const paymentDue =
    m.credit_lot_id == null && scheduledAtISO
      ? paymentDueAt(new Date(scheduledAtISO)).toISOString()
      : null;

  const { data: updated } = await supabase
    .from("meeting")
    .update({ scheduled_at: scheduledAtISO, join_url: joinUrl, payment_due_at: paymentDue })
    .eq("id", meetingId)
    .eq("status", "confirmed")
    .select("id");
  if (!updated?.length) return { ok: false, error: "bad_state" };
  return { ok: true };
}

/** The vendor's cycle ordinal (1-based) for a cycle starting at `startedAtIso`. */
async function cycleOrdinal(
  supabase: SupabaseClient,
  vendorId: string,
  startedAtIso: string,
): Promise<number> {
  const { count } = await supabase
    .from("cycle")
    .select("id", { count: "exact", head: true })
    .eq("vendor_id", vendorId)
    .lte("started_at", startedAtIso);
  return count ?? 1;
}

/**
 * Resolve the band cycle that `now` falls in (DEC-4). The band tier runs on a
 * rolling 12-month window anchored on the vendor's FIRST cycle (their first
 * payment), independent of the access window (billing.ts re-purchase only extends
 * access, never creates a band cycle). Lazy renewal: if no existing cycle's
 * half-open `[started_at, ends_at)` contains `now`, a 12-month boundary was
 * crossed, so we materialise the window that contains `now` by stepping forward
 * from the anchor, with `held_meetings_count = 0` (the band resets to band 1).
 */
async function resolveBandCycle(
  supabase: SupabaseClient,
  vendorId: string,
  now: Date,
): Promise<{ id: string; heldBefore: number; cycleNumber: number }> {
  const nowIso = now.toISOString();

  // 1. An existing cycle whose window contains `now`.
  const { data: containing } = await supabase
    .from("cycle")
    .select("id, started_at, held_meetings_count")
    .eq("vendor_id", vendorId)
    .lte("started_at", nowIso)
    .gt("ends_at", nowIso)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (containing) {
    return {
      id: containing.id as string,
      heldBefore: (containing.held_meetings_count as number) ?? 0,
      cycleNumber: await cycleOrdinal(supabase, vendorId, containing.started_at as string),
    };
  }

  // 2. Renewal (or no cycle yet): anchor on the first cycle and step 12-month
  //    windows until one contains `now`. Anchor at `now` if there is no cycle.
  const { data: first } = await supabase
    .from("cycle")
    .select("started_at")
    .eq("vendor_id", vendorId)
    .order("started_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  let start = first ? new Date(first.started_at as string) : new Date(now);
  let end = cycleEndsAt(start);
  let guard = 0;
  while (end <= now && guard++ < 1000) {
    start = end;
    end = cycleEndsAt(start);
  }

  const { data: created } = await supabase
    .from("cycle")
    .insert({
      vendor_id: vendorId,
      started_at: start.toISOString(),
      ends_at: end.toISOString(),
      held_meetings_count: 0,
    })
    .select("id")
    .single();

  return {
    id: created!.id as string,
    heldBefore: 0,
    cycleNumber: await cycleOrdinal(supabase, vendorId, start.toISOString()),
  };
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

  const now = new Date();

  const { data: flipped } = await supabase
    .from("meeting")
    .update({ status: "held", outcome_source: source })
    .eq("id", meetingId)
    .eq("status", "confirmed")
    .select("id");
  if (!flipped?.length) return { ok: false, error: "bad_state" };

  // DEC-4: the band cycle containing `now` (renews lazily across a 12-month boundary).
  const cycle = await resolveBandCycle(supabase, vendorId, now);
  const heldBefore = cycle.heldBefore;
  const split = giftSplitForHeldMeeting(heldBefore);
  const positionN = heldBefore + 1;

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

  await supabase
    .from("cycle")
    .update({ held_meetings_count: heldBefore + 1 })
    .eq("id", cycle.id);

  // One canonical gift record per held meeting (meeting_id is unique), with the
  // DEC-3 snapshot columns: sat_date (held date), the cycle + position it sits in,
  // and the band-schedule version frozen at completion.
  await supabase.from("gift_record").insert({
    meeting_id: meetingId,
    charity_id: meeting.charity_id,
    band_at_completion: split.bandKey,
    charity_amount_cents: split.charityCents,
    admin_fee_cents: split.adminCents,
    status: "released",
    sat_date: now.toISOString().slice(0, 10),
    cycle_number: cycle.cycleNumber,
    position_n: positionN,
    schedule_version: SCHEDULE_VERSION,
  });

  await supabase.from("notification").insert([
    { recipient_type: "executive", recipient_id: null, channel: "email", event: "C6_meeting_completed", status: "queued", request_id: meeting.request_id },
    { recipient_type: "staff", recipient_id: null, channel: "in_app", event: "C5_release_gift", status: "queued", request_id: meeting.request_id },
  ]);

  return { ok: true, detail: split.bandKey };
}

/**
 * Manual reversal (STATE_MACHINES.md `held → reversed`): the vendor reported a
 * wrongly-marked meeting. Returns the consumed credit to the lot, voids the
 * gift while it is still `released` (a `paid` gift is terminal per DEC-6 — the
 * credit return is then a goodwill cost, surfaced via `detail`), gives the
 * band position back to the cycle, and spawns the rebook: a fresh `proposed`
 * meeting on the same request, so the same exec can be rebooked from the
 * meetings list.
 */
export async function reverseHeld(supabase: SupabaseClient, meetingId: string): Promise<Result> {
  const ctx = await vendorIdForMeeting(supabase, meetingId);
  if (!ctx) return { ok: false, error: "not_found" };
  const { meeting, vendorId } = ctx;

  const { data: flipped } = await supabase
    .from("meeting")
    .update({ status: "reversed" })
    .eq("id", meetingId)
    .eq("status", "held")
    .select("id");
  if (!flipped?.length) return { ok: false, error: "bad_state" };

  const { data: voidedRows } = await supabase
    .from("gift_record")
    .update({ status: "voided" })
    .eq("meeting_id", meetingId)
    .eq("status", "released")
    .select("id, sat_date");
  const voided = voidedRows?.[0];

  // Return the credit consumed at held.
  if (meeting.credit_lot_id) {
    const { data: lot } = await supabase
      .from("credit_lot")
      .select("quantity, quantity_remaining")
      .eq("id", meeting.credit_lot_id)
      .single();
    if (lot) {
      await supabase
        .from("credit_lot")
        .update({
          quantity_remaining: Math.min(
            lot.quantity as number,
            (lot.quantity_remaining as number) + 1,
          ),
        })
        .eq("id", meeting.credit_lot_id);
    }
  }

  // Give the band position back. Reporting counts non-voided gifts, so the
  // cycle counter must drop with the void or the next held meeting lands one
  // position (possibly one band) too high. A paid gift still counts, so no
  // decrement in the goodwill case. The cycle is found by the gift's sat_date;
  // if a 12-month boundary fell on that exact UTC day this picks the later
  // window — acceptable at MVP volume.
  if (voided?.sat_date) {
    const dayStart = `${voided.sat_date as string}T00:00:00Z`;
    const nextDay = new Date(new Date(dayStart).getTime() + 864e5).toISOString();
    const { data: cycle } = await supabase
      .from("cycle")
      .select("id, held_meetings_count")
      .eq("vendor_id", vendorId)
      .lt("started_at", nextDay)
      .gt("ends_at", dayStart)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (cycle && (cycle.held_meetings_count as number) > 0) {
      await supabase
        .from("cycle")
        .update({ held_meetings_count: (cycle.held_meetings_count as number) - 1 })
        .eq("id", cycle.id);
    }
  }

  // Rebook with the same exec: a new proposed meeting on the same request.
  await supabase
    .from("meeting")
    .insert({ request_id: meeting.request_id, charity_id: meeting.charity_id, status: "proposed" });

  return { ok: true, detail: voided ? "gift_voided" : "gift_paid_kept" };
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

/**
 * Admin manual create (the loop's fallback when a meeting was not arranged by
 * email): an accepted request + a proposed meeting for a vendor and executive,
 * mirroring what act_on_request_token does on accept but driven by staff. The
 * requester is attributed to a user of the vendor (requested_by_user_id is NOT
 * NULL); the charity defaults to the executive's standing nomination when not
 * given (it powers the gift at held). Confirming a time stays in confirmMeeting.
 */
export async function createProposedMeeting(
  supabase: SupabaseClient,
  input: { vendorId: string; executiveId: string; charityId: string | null; q1What: string; q2Why: string },
): Promise<{ ok: true; requestId: string; meetingId: string } | { ok: false; error: string }> {
  const { data: vendorUser } = await supabase
    .from("vendor_user")
    .select("id")
    .eq("vendor_id", input.vendorId)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();
  if (!vendorUser) return { ok: false, error: "no_vendor_user" };

  let charityId = input.charityId;
  if (!charityId) {
    const { data: exec } = await supabase
      .from("executive")
      .select("default_charity_id")
      .eq("id", input.executiveId)
      .maybeSingle();
    charityId = (exec?.default_charity_id as string | null) ?? null;
  }
  if (!charityId) return { ok: false, error: "no_charity" };

  const { data: req, error: reqErr } = await supabase
    .from("request")
    .insert({
      vendor_id: input.vendorId,
      requested_by_user_id: vendorUser.id,
      executive_id: input.executiveId,
      q1_what: input.q1What,
      q2_why: input.q2Why,
      status: "accepted",
    })
    .select("id")
    .single();
  if (reqErr || !req) return { ok: false, error: reqErr?.message ?? "request_insert_failed" };

  const { data: meeting, error: meetingErr } = await supabase
    .from("meeting")
    .insert({ request_id: req.id, charity_id: charityId, status: "proposed" })
    .select("id")
    .single();
  if (meetingErr || !meeting) return { ok: false, error: meetingErr?.message ?? "meeting_insert_failed" };

  return { ok: true, requestId: req.id as string, meetingId: meeting.id as string };
}
