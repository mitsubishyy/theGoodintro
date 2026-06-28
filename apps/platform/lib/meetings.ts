import type { SupabaseClient } from "@supabase/supabase-js";
import { CHARITY_BANDS, adminFeeCents, SCHEDULE_VERSION } from "@thegoodintro/pricing";
import {
  cycleEndsAt,
  earliestUncreditedSchedule,
  paymentDueAt,
  paymentReminderWindowEnd,
  OVERCOMMIT_MAX_UNPAID,
} from "@thegoodintro/pricing/ledger";

/**
 * Meeting state-machine transitions (STATE_MACHINES.md). Each money/state
 * transition runs as ONE atomic Postgres function (migration 0027) so all of its
 * writes — the status flip, the credit/cycle counters, the gift record, the
 * notifications, and the audit row — commit or roll back together, and the
 * counters move under a row lock so concurrent calls cannot lose an update.
 *
 * These wrappers are deliberately thin: they compute the band schedule and the
 * cycle/overcommit dates from @thegoodintro/pricing (the single source of money
 * math) and pass them into the RPC. The SQL never re-derives a rate or a date.
 */

type Result = { ok: true; detail?: string } | { ok: false; error: string };

/** Postgres surfaces a `raise exception '<code>'` as the error message; keep the
 *  short stable token (e.g. "bad_state", "overcommit_cap_reached"). */
function rpcError(message: string | undefined): string {
  if (!message) return "rpc_error";
  return message.replace(/^.*?:\s*/, "").trim() || message;
}

/** Confirm a time: reserve a credit if available, else schedule as overcommit.
 *  Atomic + per-vendor serialized inside public.confirm_meeting so two confirms
 *  cannot both claim the last credit. */
export async function confirmMeeting(
  supabase: SupabaseClient,
  meetingId: string,
  scheduledAtISO: string | null,
  joinUrl: string | null,
): Promise<Result> {
  // Overcommit fallback timing (used only if no credit is available): at least
  // 30 days out, payment due 30 days before — from the pricing ledger.
  const minDate = earliestUncreditedSchedule(new Date());
  let when = scheduledAtISO ? new Date(scheduledAtISO) : minDate;
  if (when < minDate) when = minDate;

  const { data, error } = await supabase.rpc("confirm_meeting", {
    p_meeting_id: meetingId,
    p_scheduled_at: scheduledAtISO,
    p_join_url: joinUrl,
    p_overcommit_scheduled_at: when.toISOString(),
    p_overcommit_payment_due_at: paymentDueAt(when).toISOString(),
    p_overcommit_max: OVERCOMMIT_MAX_UNPAID,
  });
  if (error) return { ok: false, error: rpcError(error.message) };
  return { ok: true, detail: data as string };
}

/**
 * Edit the time / join link of an already-confirmed meeting (admin reschedule).
 * Status does not change, so the transition guard passes it freely (0012) and no
 * credit is touched — a credited meeting keeps its reservation, an uncredited
 * (overcommit) meeting just re-derives its payment-due date from the new time.
 * This is a single conditional update, already atomic, so it stays in app code.
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

/** Meeting held: consume the credit, lock the gift split, advance the band — all
 *  atomic in public.mark_held. The cycle window is resolved here from the
 *  vendor's anchor cycle using the pricing date math; the DB locks the cycle row
 *  and reads+increments the counter so concurrent helds get distinct positions. */
export async function markHeld(
  supabase: SupabaseClient,
  meetingId: string,
  source: "zoom_teams_api" | "vendor_reported" | "admin" = "zoom_teams_api",
): Promise<Result> {
  const now = new Date();

  // Resolve which 12-month band-cycle window `now` falls in, anchored on the
  // vendor's first cycle (DEC-4). The DB creates the window only if none
  // contains `now`; we pass the dates so no date math lives in SQL.
  const { data: ctx } = await supabase
    .from("meeting")
    .select("request:request_id(vendor_id)")
    .eq("id", meetingId)
    .maybeSingle();
  const req = ctx ? (Array.isArray(ctx.request) ? ctx.request[0] : ctx.request) : null;
  const vendorId = (req as { vendor_id?: string } | null)?.vendor_id;

  let start = new Date(now);
  if (vendorId) {
    const { data: first } = await supabase
      .from("cycle")
      .select("started_at")
      .eq("vendor_id", vendorId)
      .order("started_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (first) start = new Date(first.started_at as string);
  }
  let end = cycleEndsAt(start);
  let guard = 0;
  while (end <= now && guard++ < 1000) {
    start = end;
    end = cycleEndsAt(start);
  }

  // The band schedule (position -> split), straight from pricing.
  const bands = CHARITY_BANDS.map((b) => ({
    band_key: `band_${b.band}`,
    lo: b.lo,
    hi: b.hi,
    charity_cents: b.rateCents,
    admin_cents: adminFeeCents(b.rateCents),
  }));

  const { data, error } = await supabase.rpc("mark_held", {
    p_meeting_id: meetingId,
    p_source: source,
    p_now: now.toISOString(),
    p_cycle_window_start: start.toISOString(),
    p_cycle_window_end: end.toISOString(),
    p_bands: bands,
    p_schedule_version: SCHEDULE_VERSION,
  });
  if (error) return { ok: false, error: rpcError(error.message) };
  return { ok: true, detail: data as string };
}

/**
 * Manual reversal (`held → reversed`): atomically returns the consumed credit,
 * voids the gift while it is still `released` (a `paid` gift stands as goodwill),
 * frees the band position, and spawns a `proposed` rebook on the same request.
 */
export async function reverseHeld(supabase: SupabaseClient, meetingId: string): Promise<Result> {
  const { data, error } = await supabase.rpc("reverse_held", { p_meeting_id: meetingId });
  if (error) return { ok: false, error: rpcError(error.message) };
  return { ok: true, detail: data as string };
}

/** No-show or cancellation of a confirmed meeting: release the reservation, no gift. */
export async function releaseMeeting(
  supabase: SupabaseClient,
  meetingId: string,
  outcome: "no_show" | "cancelled",
): Promise<Result> {
  const { error } = await supabase.rpc("release_meeting", {
    p_meeting_id: meetingId,
    p_outcome: outcome,
  });
  if (error) return { ok: false, error: rpcError(error.message) };
  return { ok: true };
}

/** Cancel a meeting still in `proposed` (no credit was reserved yet). */
export async function cancelProposedMeeting(
  supabase: SupabaseClient,
  meetingId: string,
): Promise<Result> {
  const { data, error } = await supabase.rpc("cancel_proposed_meeting", { p_meeting_id: meetingId });
  if (error) return { ok: false, error: rpcError(error.message) };
  return { ok: true, detail: data as string };
}

/** Close a still-open (`submitted`) request: admin housekeeping for stale/withdrawn. */
export async function closeRequest(supabase: SupabaseClient, requestId: string): Promise<Result> {
  const { data, error } = await supabase.rpc("close_request", { p_request_id: requestId });
  if (error) return { ok: false, error: rpcError(error.message) };
  return { ok: true, detail: data as string };
}

/**
 * Auto-cancel confirmed overcommit meetings whose payment never cleared by
 * `payment_due_at` (STATE_MACHINES.md `confirmed -> cancelled`, the uncredited-
 * payment sub-flow step 5). Atomic + money-safe inside public.cancel_overdue_
 * overcommit_meetings: it only ever touches uncredited (credit_lot_id null),
 * genuinely past-due rows, so it can never cancel a credited booking, and queues
 * the D3 vendor + exec + EA notices. Driven by the /api/jobs/cancel-overdue cron
 * route (the daily SCHEDULE is a cloud/ops step). Returns how many it cancelled.
 */
export async function cancelOverdueOvercommitMeetings(
  supabase: SupabaseClient,
  now: Date = new Date(),
): Promise<{ ok: true; cancelled: number } | { ok: false; error: string }> {
  const { data, error } = await supabase.rpc("cancel_overdue_overcommit_meetings", {
    p_now: now.toISOString(),
  });
  if (error) return { ok: false, error: rpcError(error.message) };
  return { ok: true, cancelled: (data as number) ?? 0 };
}

/**
 * Queue the D2 payment reminder for unpaid overcommit meetings ~7 days before
 * their `payment_due_at` (STATE_MACHINES.md uncredited-payment sub-flow step 3;
 * NOTIFICATION_TEMPLATES "D2 · Payment reminder"). Once-only per meeting inside
 * public.queue_overdue_payment_reminders: it stamps `payment_reminder_sent_at`
 * as it claims each row, so a daily re-run never re-reminds, and only ever
 * targets confirmed, uncredited, not-yet-due meetings inside the 7-day window,
 * queuing the single vendor D2 email. The window edge is computed here from the
 * pricing ledger (no date math in SQL). Driven by the /api/jobs/payment-reminders
 * cron route (the daily SCHEDULE is a cloud/ops step). Returns how many it queued.
 */
export async function queueOverduePaymentReminders(
  supabase: SupabaseClient,
  now: Date = new Date(),
): Promise<{ ok: true; queued: number } | { ok: false; error: string }> {
  const { data, error } = await supabase.rpc("queue_overdue_payment_reminders", {
    p_now: now.toISOString(),
    p_window_end: paymentReminderWindowEnd(now).toISOString(),
  });
  if (error) return { ok: false, error: rpcError(error.message) };
  return { ok: true, queued: (data as number) ?? 0 };
}
