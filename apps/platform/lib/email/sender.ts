import type { SupabaseClient } from "@supabase/supabase-js";
import { MEETING_FEE_CENTS } from "@thegoodintro/pricing";
import { indicativeGiftAud } from "../gift-amount";
import { formatAud } from "../format";
import {
  adminSignupAlertEmail,
  execAcceptedVendorEmail,
  execRequestEmail,
  forwardToEaEmail,
  giftPaidExecEmail,
  meetingCancelledExecEmail,
  meetingCancelledVendorEmail,
  meetingCompletedExecEmail,
  meetingCompletedVendorEmail,
  paymentReminderVendorEmail,
  reversalRebookExecEmail,
  reversalRebookVendorEmail,
  timeConfirmedVendorEmail,
  uncreditedBookedVendorEmail,
  unpaidCancelledExecEmail,
  unpaidCancelledVendorEmail,
  vendorReceiptEmail,
  vendorWelcomeEmail,
  type ComposedEmail,
} from "./templates";
import type { EmailTransport } from "./transport";

/**
 * The notification-queue drain (PRODUCTION_READINESS A1). Idempotent per
 * notification id, never double-sends:
 *
 *  - a row is CLAIMED with a conditional update (queued -> sending, attempts+1)
 *    so two concurrent drains cannot both pick it up;
 *  - the provider call carries the notification id as an idempotency key, so a
 *    drain that crashed between "provider accepted" and "status written back"
 *    can re-run safely (Resend replays the original response, no second email);
 *  - write-back: sent (+ provider_message_id, sent_at, sent_to) or failed
 *    (+ last_error). Failed rows retry on later drains up to MAX_ATTEMPTS;
 *    `sending` rows older than STALE_SENDING_MINUTES are treated as crashed
 *    and retried. `bounced` is written by the A3 webhook (not built yet).
 *
 * SEND-MODE GUARD: unless EMAIL_MODE=live, every email is redirected to
 * EMAIL_TEST_RECIPIENT (default Resend's delivered@resend.dev test inbox) and
 * sent from Resend's onboarding sender. No real external address can receive
 * mail until Issy flips EMAIL_MODE=live after DNS is verified.
 *
 * Trigger: the admin "Send queued emails" action (manual stopgap until the S6
 * cron exists). Only events with a template here are drained; everything else
 * stays queued untouched.
 */

export const SUPPORTED_EMAIL_EVENTS = [
  "B1_request_submitted",
  "B_forward_to_ea",
  "C1_exec_accepted",
  "C2_time_confirmed",
  "C3_meeting_cancelled",
  "C6_meeting_completed",
  "C7_gift_confirmed",
  "D1_uncredited_booked",
  "D2_payment_reminder",
  "D3_unpaid_cancelled",
  "E1_reversal_rebook",
  "A1_vendor_signed_up",
  "A1_vendor_welcome",
  "A4_invoice_paid",
] as const;

const MAX_ATTEMPTS = 3;
const STALE_SENDING_MINUTES = 15;
const TEST_FROM = "TheGoodIntro (test) <onboarding@resend.dev>";
const TEST_TO_FALLBACK = "delivered@resend.dev";

export type DrainSummary = { picked: number; sent: number; failed: number; skipped: number };

type NotificationRow = {
  id: string;
  event: string;
  status: string;
  attempts: number;
  recipient_type: string;
  recipient_id: string | null;
  request_id: string | null;
  payload: Record<string, unknown> | null;
};

class ComposeError extends Error {}

function isLiveMode(): boolean {
  return process.env.EMAIL_MODE === "live";
}

function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001").replace(/\/+$/, "");
}

function fromAddress(kind: ComposedEmail["fromKind"]): string {
  if (!isLiveMode()) return TEST_FROM;
  const v = kind === "personal" ? process.env.EMAIL_FROM_PERSONAL : process.env.EMAIL_FROM_BRAND;
  if (!v) {
    throw new ComposeError(
      `missing ${kind === "personal" ? "EMAIL_FROM_PERSONAL" : "EMAIL_FROM_BRAND"} for live mode`,
    );
  }
  return v;
}

function one<T>(v: unknown): T | undefined {
  return (Array.isArray(v) ? v[0] : v) as T | undefined;
}

/**
 * Resolve the live action-link token for a request: reuse the still-valid token
 * or mint a fresh one if the 90-day backstop retired the old link (migration
 * 0028). Centralised in the DB (ensure_request_action_token) so every email that
 * links to /e/<token> agrees on the same live link.
 */
async function resolveActionToken(
  supabase: SupabaseClient,
  requestId: string,
): Promise<string> {
  const { data, error } = await supabase.rpc("ensure_request_action_token", {
    p_request_id: requestId,
  });
  const token = typeof data === "string" ? data : null;
  // ensure_request_action_token raises request_not_open for a closed/accepted/
  // declined request, so an action email queued against one fails to compose and
  // the drain sends nothing. Surface the reason for observability.
  if (error || !token)
    throw new ComposeError(
      error?.message
        ? `could not resolve an action token: ${error.message}`
        : "could not resolve an action token for request",
    );
  return token;
}

/** B1: the exec request email, composed from the request + its signed link. */
async function composeExecRequest(
  supabase: SupabaseClient,
  row: NotificationRow,
): Promise<{ email: ComposedEmail; to: string }> {
  if (!row.request_id) throw new ComposeError("notification has no request_id");
  const { data: req } = await supabase
    .from("request")
    .select(
      `id, q1_what, q2_why, vendor_id, attendee, meeting_minutes,
       vendor:vendor_id(name),
       requester:requested_by_user_id(name),
       executive:executive_id(name, primary_email, charity:default_charity_id(name), ea:ea_id(name))`,
    )
    .eq("id", row.request_id)
    .single();
  if (!req) throw new ComposeError("request not found");

  const vendor = one<{ name: string }>(req.vendor);
  const requester = one<{ name: string }>(req.requester);
  const exec = one<{ name: string; primary_email: string; charity: unknown; ea: unknown }>(
    req.executive,
  );
  const charity = one<{ name: string }>(exec?.charity);
  const ea = one<{ name: string }>(exec?.ea);
  if (!exec?.primary_email) throw new ComposeError("executive has no primary email");
  // Reuse the still-valid action token, or mint a fresh one if the 90-day
  // backstop retired the old link, so a follow-up email always carries a live link.
  const tokenStr = await resolveActionToken(supabase, req.id as string);

  // The person in the vendor block is whoever will sit the meeting: the
  // on-behalf-of attendee when one was named, else the requesting user.
  // vendor_user has no title column, so the role line degrades to company-only
  // unless the attendee carried one.
  const attendee = (req.attendee ?? null) as { name?: string; title?: string } | null;
  const requesterName = attendee?.name?.trim() || requester?.name || vendor?.name || "A member vendor";
  const requesterTitle = attendee?.title?.trim() || null;

  // Indicative amount: the ONE shared source with the /e/[token] action pages
  // (lib/gift-amount.ts), fed the latest cycle's held count, so the email and
  // the pages it links to always show the identical figure. The locked surface
  // ALWAYS renders it "approximately $X"; the exact gift locks at Held.
  const { data: cycle } = await supabase
    .from("cycle")
    .select("held_meetings_count")
    .eq("vendor_id", req.vendor_id)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const indicative = indicativeGiftAud((cycle?.held_meetings_count as number | undefined) ?? 0);

  return {
    to: exec.primary_email,
    email: execRequestEmail({
      execFirstName: (exec.name ?? "").split(" ")[0] || "there",
      requesterName,
      requesterTitle,
      vendorCompany: vendor?.name ?? "A member vendor",
      // abnVerified stays unpassed until vendor ABN capture lands with the
      // vetting build; the verification line degrades to "Founder reviewed".
      q1: req.q1_what as string,
      q2: req.q2_why as string,
      durationMinutes: (req.meeting_minutes as number | null) ?? 45,
      indicativeAmount: indicative,
      charityName: charity?.name ?? "your chosen charity",
      eaFirstName: ea?.name ? ea.name.split(" ")[0] : null,
      confirmUrl: `${appBaseUrl()}/e/${tokenStr}`,
    }),
  };
}

/**
 * B_forward_to_ea: the "Send to EA" forward email. Same request context as B1,
 * addressed to the linked EA (the notification's recipient), framed as acting
 * for the executive. Reuses the request + token + indicative-amount fetch; the
 * EA's address comes from the notification recipient (the `ea` table).
 */
async function composeForwardToEa(
  supabase: SupabaseClient,
  row: NotificationRow,
): Promise<{ email: ComposedEmail; to: string }> {
  if (!row.request_id) throw new ComposeError("notification has no request_id");
  if (!row.recipient_id) throw new ComposeError("forward-to-ea has no recipient ea");

  const { data: ea } = await supabase
    .from("ea")
    .select("name, email")
    .eq("id", row.recipient_id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!ea?.email) throw new ComposeError("ea not found or has no email");

  const { data: req } = await supabase
    .from("request")
    .select(
      `id, q1_what, q2_why, vendor_id, attendee, meeting_minutes,
       vendor:vendor_id(name),
       requester:requested_by_user_id(name),
       executive:executive_id(name, charity:default_charity_id(name))`,
    )
    .eq("id", row.request_id)
    .single();
  if (!req) throw new ComposeError("request not found");

  const vendor = one<{ name: string }>(req.vendor);
  const requester = one<{ name: string }>(req.requester);
  const exec = one<{ name: string; charity: unknown }>(req.executive);
  const charity = one<{ name: string }>(exec?.charity);
  if (!exec?.name) throw new ComposeError("executive not found");
  // Same reuse-or-refresh resolution as B1 (the EA acts on the same link).
  const tokenStr = await resolveActionToken(supabase, req.id as string);

  const attendee = (req.attendee ?? null) as { name?: string; title?: string } | null;
  const requesterName = attendee?.name?.trim() || requester?.name || vendor?.name || "A member vendor";
  const requesterTitle = attendee?.title?.trim() || null;

  // Same indicative-amount source as B1 + the /e/[token] pages, so all three agree.
  const { data: cycle } = await supabase
    .from("cycle")
    .select("held_meetings_count")
    .eq("vendor_id", req.vendor_id)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const indicative = indicativeGiftAud((cycle?.held_meetings_count as number | undefined) ?? 0);

  return {
    to: ea.email as string,
    email: forwardToEaEmail({
      eaFirstName: (ea.name as string | null)?.split(" ")[0] || "there",
      execFirstName: exec.name.split(" ")[0] || "your executive",
      requesterName,
      requesterTitle,
      vendorCompany: vendor?.name ?? "A member vendor",
      q1: req.q1_what as string,
      q2: req.q2_why as string,
      durationMinutes: (req.meeting_minutes as number | null) ?? 45,
      indicativeAmount: indicative,
      charityName: charity?.name ?? "their chosen charity",
      confirmUrl: `${appBaseUrl()}/e/${tokenStr}`,
    }),
  };
}

/** UTC timestamp -> "Wednesday, 24 June 2026 at 11:30 am AEST" (Sydney). v1 is
 *  AU-only; the vendor timezone is not captured yet, so Sydney is the default. */
function formatMeetingDatetime(iso: string): string {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Australia/Sydney",
    timeZoneName: "short",
  }).format(new Date(iso));
}

/** UTC timestamp -> "Wednesday, 24 June 2026" (Sydney date, no time). */
function formatMeetingDate(iso: string): string {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Australia/Sydney",
  }).format(new Date(iso));
}

/** D1: uncredited (overcommit) meeting booked, the vendor pay-by-date email. */
async function composeUncreditedBooked(
  supabase: SupabaseClient,
  row: NotificationRow,
): Promise<{ email: ComposedEmail; to: string }> {
  if (!row.request_id) throw new ComposeError("notification has no request_id");
  const { data: req } = await supabase
    .from("request")
    .select(`id, requester:requested_by_user_id(email), executive:executive_id(name)`)
    .eq("id", row.request_id)
    .single();
  if (!req) throw new ComposeError("request not found");
  const requester = one<{ email: string }>(req.requester);
  const exec = one<{ name: string }>(req.executive);
  if (!requester?.email) throw new ComposeError("requesting vendor user has no email");
  if (!exec?.name) throw new ComposeError("executive not found");
  const { data: meeting } = await supabase
    .from("meeting")
    .select("scheduled_at, payment_due_at")
    .eq("request_id", row.request_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!meeting?.scheduled_at) throw new ComposeError("no scheduled meeting for request");
  return {
    to: requester.email,
    email: uncreditedBookedVendorEmail({
      execName: exec.name,
      meetingDateLabel: formatMeetingDate(meeting.scheduled_at as string),
      amount: formatAud(MEETING_FEE_CENTS),
      paymentDueDateLabel: meeting.payment_due_at ? formatMeetingDate(meeting.payment_due_at as string) : "soon",
      payUrl: process.env.EMAIL_PAY_URL || `${appBaseUrl()}/vendor/billing`,
    }),
  };
}

/**
 * D2: the payment reminder for an unpaid overcommit meeting, ~7 days before the
 * deadline (queue_overdue_payment_reminders, migration 0035). Vendor-only (the
 * template has no exec/EA copy). The meeting is derived from request_id — the
 * SAME parked inference as D1/C2/C6/D3 (STATE_MACHINES.md "Edges (decided)"): the
 * notification carries request_id, not meeting_id, so "the meeting" is the latest
 * on the request. Correct while `cancelled` is terminal and rebooks only spawn
 * from `held`; if rebooking after auto-cancel is ever allowed, store/snapshot
 * meeting_id and read the exact meeting by id here. `daysLeft` is computed live
 * from the deadline at SEND time, so it is accurate even if the drain runs a
 * little after the reminder was queued.
 */
async function composePaymentReminder(
  supabase: SupabaseClient,
  row: NotificationRow,
): Promise<{ email: ComposedEmail; to: string }> {
  if (!row.request_id) throw new ComposeError("notification has no request_id");
  const { data: req } = await supabase
    .from("request")
    .select(`id, requester:requested_by_user_id(email), executive:executive_id(name)`)
    .eq("id", row.request_id)
    .single();
  if (!req) throw new ComposeError("request not found");
  const requester = one<{ email: string }>(req.requester);
  const exec = one<{ name: string }>(req.executive);
  if (!requester?.email) throw new ComposeError("requesting vendor user has no email");
  if (!exec?.name) throw new ComposeError("executive not found");
  const { data: meeting } = await supabase
    .from("meeting")
    .select("scheduled_at, payment_due_at")
    .eq("request_id", row.request_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!meeting?.scheduled_at) throw new ComposeError("no scheduled meeting for request");
  if (!meeting?.payment_due_at) throw new ComposeError("meeting has no payment deadline");

  // Days remaining, from the live deadline at send time. Clamp to >= 1: the
  // queue guarantees the deadline is in the future when it queues, and a same-day
  // reminder should still read "1 day away", never "0".
  const dueMs = new Date(meeting.payment_due_at as string).getTime();
  const daysLeft = Math.max(1, Math.ceil((dueMs - Date.now()) / 86_400_000));

  return {
    to: requester.email,
    email: paymentReminderVendorEmail({
      execName: exec.name,
      meetingDateLabel: formatMeetingDate(meeting.scheduled_at as string),
      paymentDueDateLabel: formatMeetingDate(meeting.payment_due_at as string),
      daysLeft,
      payUrl: process.env.EMAIL_PAY_URL || `${appBaseUrl()}/vendor/billing`,
    }),
  };
}

/** A1: the vendor welcome (to the new owner user, queued at sign-up by 0025). */
async function composeVendorWelcome(
  supabase: SupabaseClient,
  row: NotificationRow,
): Promise<{ email: ComposedEmail; to: string }> {
  if (!row.recipient_id) throw new ComposeError("welcome has no recipient vendor_user");
  const { data: user } = await supabase
    .from("vendor_user")
    .select("email, name")
    .eq("id", row.recipient_id)
    .maybeSingle();
  if (!user?.email) throw new ComposeError("vendor_user not found for welcome");
  return {
    to: user.email as string,
    email: vendorWelcomeEmail({
      contactFirstName: (user.name as string | null)?.split(" ")[0] || "there",
      bookCallUrl: process.env.EMAIL_BOOK_CALL_URL || `${appBaseUrl()}/vendor/get-started`,
    }),
  };
}

/** C1: exec accepted, the vendor "securing a time" email. */
async function composeExecAcceptedVendor(
  supabase: SupabaseClient,
  row: NotificationRow,
): Promise<{ email: ComposedEmail; to: string }> {
  if (!row.request_id) throw new ComposeError("notification has no request_id");
  const { data: req } = await supabase
    .from("request")
    .select(`id, requester:requested_by_user_id(email), executive:executive_id(name)`)
    .eq("id", row.request_id)
    .single();
  if (!req) throw new ComposeError("request not found");
  const requester = one<{ email: string }>(req.requester);
  const exec = one<{ name: string }>(req.executive);
  if (!requester?.email) throw new ComposeError("requesting vendor user has no email");
  if (!exec?.name) throw new ComposeError("executive not found");
  return { to: requester.email, email: execAcceptedVendorEmail({ execName: exec.name }) };
}

/** C2: time confirmed, the vendor confirmation (with the scheduled time + join link). */
async function composeTimeConfirmedVendor(
  supabase: SupabaseClient,
  row: NotificationRow,
): Promise<{ email: ComposedEmail; to: string }> {
  if (!row.request_id) throw new ComposeError("notification has no request_id");
  const { data: req } = await supabase
    .from("request")
    .select(`id, requester:requested_by_user_id(email), executive:executive_id(name)`)
    .eq("id", row.request_id)
    .single();
  if (!req) throw new ComposeError("request not found");
  const requester = one<{ email: string }>(req.requester);
  const exec = one<{ name: string }>(req.executive);
  if (!requester?.email) throw new ComposeError("requesting vendor user has no email");
  if (!exec?.name) throw new ComposeError("executive not found");
  const { data: meeting } = await supabase
    .from("meeting")
    .select("scheduled_at, join_url")
    .eq("request_id", row.request_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!meeting?.scheduled_at) throw new ComposeError("no scheduled meeting for request");
  return {
    to: requester.email,
    email: timeConfirmedVendorEmail({
      execName: exec.name,
      meetingDatetimeLabel: formatMeetingDatetime(meeting.scheduled_at as string),
      joinUrl: (meeting.join_url as string | null) ?? null,
    }),
  };
}

/** C6: meeting held, the exec thank-you with the EXACT frozen gift figure. */
async function composeMeetingCompletedExec(
  supabase: SupabaseClient,
  row: NotificationRow,
): Promise<{ email: ComposedEmail; to: string }> {
  if (!row.request_id) throw new ComposeError("notification has no request_id");
  const { data: req } = await supabase
    .from("request")
    .select(`id, vendor:vendor_id(name), executive:executive_id(name, primary_email)`)
    .eq("id", row.request_id)
    .single();
  if (!req) throw new ComposeError("request not found");
  const vendor = one<{ name: string }>(req.vendor);
  const exec = one<{ name: string; primary_email: string }>(req.executive);
  if (!exec?.primary_email) throw new ComposeError("executive has no primary email");
  const { data: meeting } = await supabase
    .from("meeting")
    .select("id")
    .eq("request_id", row.request_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!meeting?.id) throw new ComposeError("no meeting for request");
  const { data: gift } = await supabase
    .from("gift_record")
    .select(`charity_amount_cents, charity:charity_id(name)`)
    .eq("meeting_id", meeting.id)
    .maybeSingle();
  if (!gift) throw new ComposeError("no gift record for completed meeting");
  const charity = one<{ name: string }>(gift.charity);
  return {
    to: exec.primary_email,
    email: meetingCompletedExecEmail({
      execFirstName: (exec.name ?? "").split(" ")[0] || "there",
      vendorName: vendor?.name ?? "your guest",
      charityAmount: formatAud(gift.charity_amount_cents as number),
      charityName: charity?.name ?? "your chosen charity",
    }),
  };
}

/**
 * C6 vendor completion note (queued best-effort by lib/meetings.ts after the held
 * flip). Reads the EXACT frozen amount + charity name from the payload
 * snapshotted at queue time (no re-derivation from the gift here); resolves the
 * requester address + exec name from the request. The vendor also gets an in-app
 * C6 row (channel in_app) which the email drain's channel filter never reaches.
 * Distinct from the C7 gift-PAID confirmation.
 */
async function composeMeetingCompletedVendor(
  supabase: SupabaseClient,
  row: NotificationRow,
): Promise<{ email: ComposedEmail; to: string }> {
  if (!row.request_id) throw new ComposeError("notification has no request_id");
  const p = row.payload ?? {};
  const amountCents = Number(p.charity_amount_cents);
  const charityName = typeof p.charity_name === "string" ? p.charity_name : null;
  if (!Number.isFinite(amountCents) || amountCents < 0)
    throw new ComposeError("C6 payload has no charity amount");
  if (!charityName) throw new ComposeError("C6 payload has no charity name");
  const { data: req } = await supabase
    .from("request")
    .select(`id, requester:requested_by_user_id(email), executive:executive_id(name)`)
    .eq("id", row.request_id)
    .single();
  if (!req) throw new ComposeError("request not found");
  const requester = one<{ email: string }>(req.requester);
  const exec = one<{ name: string }>(req.executive);
  if (!requester?.email) throw new ComposeError("requesting vendor user has no email");
  if (!exec?.name) throw new ComposeError("executive not found");
  return {
    to: requester.email,
    email: meetingCompletedVendorEmail({
      execName: exec.name,
      charityAmount: formatAud(amountCents),
      charityName,
    }),
  };
}

/**
 * C7: the gift-paid confirmation to the executive (queued at the gift
 * released -> paid transition in lib/gifts.ts). The EXACT frozen amount and the
 * charity name are snapshotted into the notification payload at queue time, so
 * the composer reads them straight from the payload and never re-derives the
 * gift from the request's latest meeting (sidestepping the parked
 * meeting_id-vs-request_id inference; a paid gift can later be reversed, which
 * spawns a new meeting on the same request). Only the exec address + first name
 * come from the request. The vendor-side C7 is an in-app row (channel in_app),
 * so the email drain's channel filter never reaches it here.
 */
async function composeGiftPaid(
  supabase: SupabaseClient,
  row: NotificationRow,
): Promise<{ email: ComposedEmail; to: string }> {
  if (!row.request_id) throw new ComposeError("notification has no request_id");
  const p = row.payload ?? {};
  const amountCents = Number(p.charity_amount_cents);
  const charityName = typeof p.charity_name === "string" ? p.charity_name : null;
  if (!Number.isFinite(amountCents) || amountCents < 0)
    throw new ComposeError("C7 payload has no charity amount");
  if (!charityName) throw new ComposeError("C7 payload has no charity name");
  const { data: req } = await supabase
    .from("request")
    .select(`id, executive:executive_id(name, primary_email)`)
    .eq("id", row.request_id)
    .single();
  if (!req) throw new ComposeError("request not found");
  const exec = one<{ name: string; primary_email: string }>(req.executive);
  if (!exec?.primary_email) throw new ComposeError("executive has no primary email");
  return {
    to: exec.primary_email,
    email: giftPaidExecEmail({
      execFirstName: (exec.name ?? "").split(" ")[0] || "there",
      charityAmount: formatAud(amountCents),
      charityName,
    }),
  };
}

/** A1: the new-sign-up alert to Issy. */
async function composeSignupAlert(
  supabase: SupabaseClient,
  row: NotificationRow,
): Promise<{ email: ComposedEmail; to: string }> {
  const p = row.payload ?? {};
  let to = process.env.EMAIL_ADMIN_ALERTS;
  if (!to) {
    const { data: staff } = await supabase
      .from("staff")
      .select("email")
      .eq("role", "super_admin")
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    to = staff?.email as string | undefined;
  }
  if (!to) throw new ComposeError("no admin alert recipient (set EMAIL_ADMIN_ALERTS)");
  return {
    to,
    email: adminSignupAlertEmail({
      company: String(p.company ?? "Unknown company"),
      name: String(p.name ?? "unknown"),
      email: String(p.email ?? "unknown"),
      adminVendorsUrl: `${appBaseUrl()}/admin/vendors`,
    }),
  };
}

/** A4: the vendor payment receipt. */
async function composeVendorReceipt(
  supabase: SupabaseClient,
  row: NotificationRow,
): Promise<{ email: ComposedEmail; to: string }> {
  if (!row.recipient_id) throw new ComposeError("receipt has no recipient vendor_user");
  const { data: user } = await supabase
    .from("vendor_user")
    .select("email")
    .eq("id", row.recipient_id)
    .maybeSingle();
  if (!user?.email) throw new ComposeError("vendor_user not found for receipt");
  const credits = Number((row.payload ?? {}).credits);
  if (!Number.isFinite(credits) || credits <= 0) throw new ComposeError("receipt payload has no credits");
  return {
    to: user.email as string,
    email: vendorReceiptEmail({
      credits,
      startRequestUrl: `${appBaseUrl()}/vendor/executives`,
    }),
  };
}

/**
 * D3: an unpaid overcommit meeting auto-cancelled at its payment deadline
 * (cancel_overdue_overcommit_meetings, migration 0034). ONE event, three
 * recipient types — the requesting vendor user (reassuring brand note), the
 * executive, and the linked EA (both the from-Issy note). We branch on
 * recipient_type to resolve the address + the right copy. The meeting date for
 * the exec/EA line comes from the now-cancelled meeting's scheduled time.
 */
async function composeUnpaidCancelled(
  supabase: SupabaseClient,
  row: NotificationRow,
): Promise<{ email: ComposedEmail; to: string }> {
  if (!row.request_id) throw new ComposeError("notification has no request_id");
  const { data: req } = await supabase
    .from("request")
    .select(
      `id, vendor:vendor_id(name), requester:requested_by_user_id(name, email), executive:executive_id(name, primary_email)`,
    )
    .eq("id", row.request_id)
    .single();
  if (!req) throw new ComposeError("request not found");
  const vendor = one<{ name: string }>(req.vendor);
  const requester = one<{ name: string; email: string }>(req.requester);
  const exec = one<{ name: string; primary_email: string }>(req.executive);
  if (!exec?.name) throw new ComposeError("executive not found");

  if (row.recipient_type === "vendor_user") {
    if (!requester?.email) throw new ComposeError("requesting vendor user has no email");
    return { to: requester.email, email: unpaidCancelledVendorEmail({ execName: exec.name }) };
  }

  // exec + EA share the meeting-date line, from the cancelled meeting's time.
  // PARKED (STATE_MACHINES.md "Edges (decided)"): the notification carries
  // request_id, not meeting_id, so "the cancelled meeting" is the latest meeting
  // on the request. Correct while `cancelled` is terminal and rebooks only spawn
  // from `held`; if rebooking after auto-cancel is ever allowed, store/snapshot
  // meeting_id and read the exact meeting by id here.
  const { data: meeting } = await supabase
    .from("meeting")
    .select("scheduled_at")
    .eq("request_id", req.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const meetingDateLabel = meeting?.scheduled_at
    ? formatMeetingDate(meeting.scheduled_at as string)
    : "the planned date";
  const vendorName = vendor?.name ?? "a member vendor";

  if (row.recipient_type === "executive") {
    if (!exec.primary_email) throw new ComposeError("executive has no primary email");
    return {
      to: exec.primary_email,
      email: unpaidCancelledExecEmail({
        execFirstName: exec.name.split(" ")[0] || "there",
        vendorName,
        meetingDateLabel,
        eaFirstName: null,
      }),
    };
  }
  if (row.recipient_type === "ea") {
    if (!row.recipient_id) throw new ComposeError("ea notification has no recipient ea");
    const { data: ea } = await supabase
      .from("ea")
      .select("name, email")
      .eq("id", row.recipient_id)
      .is("deleted_at", null)
      .maybeSingle();
    if (!ea?.email) throw new ComposeError("ea not found or has no email");
    return {
      to: ea.email as string,
      email: unpaidCancelledExecEmail({
        execFirstName: exec.name.split(" ")[0] || "the executive",
        vendorName,
        meetingDateLabel,
        eaFirstName: (ea.name as string | null)?.split(" ")[0] || "there",
      }),
    };
  }
  throw new ComposeError(`unexpected recipient_type "${row.recipient_type}" for D3`);
}

/**
 * C3: a meeting cancelled by Issy (a `confirmed` or `proposed` cancellation;
 * queued best-effort by lib/meetings.ts after the release_meeting /
 * cancel_proposed_meeting flip). ONE event, two recipient types — the requesting
 * vendor user (reassuring brand note) and the executive (from-Issy note). We
 * branch on recipient_type to resolve the address + copy. This is DISTINCT from
 * D3 (the unpaid auto-cancel): a general cancellation, no payment reason, and no
 * EA recipient (the C3 template lists vendor + executive only; EA parked).
 *
 * The exec's date line comes from the cancelled meeting's scheduled time. PARKED
 * (STATE_MACHINES.md "Edges (decided)"): the notification carries request_id, not
 * meeting_id, so "the cancelled meeting" is the latest meeting on the request.
 * Correct while `cancelled` is terminal and rebooks only spawn from `held`. A
 * `proposed` cancel has no scheduled_at, so the exec note omits the date.
 */
async function composeMeetingCancelled(
  supabase: SupabaseClient,
  row: NotificationRow,
): Promise<{ email: ComposedEmail; to: string }> {
  if (!row.request_id) throw new ComposeError("notification has no request_id");
  const { data: req } = await supabase
    .from("request")
    .select(
      `id, vendor:vendor_id(name), requester:requested_by_user_id(email), executive:executive_id(name, primary_email)`,
    )
    .eq("id", row.request_id)
    .single();
  if (!req) throw new ComposeError("request not found");
  const vendor = one<{ name: string }>(req.vendor);
  const requester = one<{ email: string }>(req.requester);
  const exec = one<{ name: string; primary_email: string }>(req.executive);
  if (!exec?.name) throw new ComposeError("executive not found");

  if (row.recipient_type === "vendor_user") {
    if (!requester?.email) throw new ComposeError("requesting vendor user has no email");
    return { to: requester.email, email: meetingCancelledVendorEmail({ execName: exec.name }) };
  }
  if (row.recipient_type === "executive") {
    if (!exec.primary_email) throw new ComposeError("executive has no primary email");
    const { data: meeting } = await supabase
      .from("meeting")
      .select("scheduled_at")
      .eq("request_id", req.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const meetingDateLabel = meeting?.scheduled_at
      ? formatMeetingDate(meeting.scheduled_at as string)
      : null;
    return {
      to: exec.primary_email,
      email: meetingCancelledExecEmail({
        execFirstName: exec.name.split(" ")[0] || "there",
        vendorName: vendor?.name ?? "a member vendor",
        meetingDateLabel,
      }),
    };
  }
  throw new ComposeError(`unexpected recipient_type "${row.recipient_type}" for C3`);
}

/**
 * E1: a held meeting manually reversed (the vendor could not attend), credit
 * returned and a rebook arranged (queued best-effort by lib/meetings.ts after the
 * reverse_held flip). ONE event, two recipient types — the requesting vendor user
 * (reassuring brand note) and the executive (from-Issy note). We branch on
 * recipient_type to resolve the address + copy. No gift figure is needed (E1 is
 * about the credit + a new time), so exec name + vendor name resolve straight from
 * the request; no meeting/gift lookup. The separate staff dashboard task is the
 * E1_reversal_admin in_app row (carrying the gift-paid-goodwill flag), which the
 * email drain's channel filter never reaches. No EA recipient (the E1 template
 * lists vendor + executive + Issy only).
 */
async function composeReversalRebook(
  supabase: SupabaseClient,
  row: NotificationRow,
): Promise<{ email: ComposedEmail; to: string }> {
  if (!row.request_id) throw new ComposeError("notification has no request_id");
  const { data: req } = await supabase
    .from("request")
    .select(
      `id, vendor:vendor_id(name), requester:requested_by_user_id(email), executive:executive_id(name, primary_email)`,
    )
    .eq("id", row.request_id)
    .single();
  if (!req) throw new ComposeError("request not found");
  const vendor = one<{ name: string }>(req.vendor);
  const requester = one<{ email: string }>(req.requester);
  const exec = one<{ name: string; primary_email: string }>(req.executive);
  if (!exec?.name) throw new ComposeError("executive not found");

  if (row.recipient_type === "vendor_user") {
    if (!requester?.email) throw new ComposeError("requesting vendor user has no email");
    return { to: requester.email, email: reversalRebookVendorEmail({ execName: exec.name }) };
  }
  if (row.recipient_type === "executive") {
    if (!exec.primary_email) throw new ComposeError("executive has no primary email");
    return {
      to: exec.primary_email,
      email: reversalRebookExecEmail({
        execFirstName: exec.name.split(" ")[0] || "there",
        vendorName: vendor?.name ?? "a member vendor",
      }),
    };
  }
  throw new ComposeError(`unexpected recipient_type "${row.recipient_type}" for E1`);
}

async function compose(
  supabase: SupabaseClient,
  row: NotificationRow,
): Promise<{ email: ComposedEmail; to: string }> {
  switch (row.event) {
    case "B1_request_submitted":
      return composeExecRequest(supabase, row);
    case "B_forward_to_ea":
      return composeForwardToEa(supabase, row);
    case "C1_exec_accepted":
      return composeExecAcceptedVendor(supabase, row);
    case "C2_time_confirmed":
      return composeTimeConfirmedVendor(supabase, row);
    case "C3_meeting_cancelled":
      return composeMeetingCancelled(supabase, row);
    case "C6_meeting_completed":
      // One event, two recipients (the D3/C3 convention): the exec note (from
      // Issy, resolved from the gift) and the vendor note (from the brand, read
      // from the payload snapshotted at the held transition).
      return row.recipient_type === "vendor_user"
        ? composeMeetingCompletedVendor(supabase, row)
        : composeMeetingCompletedExec(supabase, row);
    case "C7_gift_confirmed":
      return composeGiftPaid(supabase, row);
    case "D1_uncredited_booked":
      return composeUncreditedBooked(supabase, row);
    case "D2_payment_reminder":
      return composePaymentReminder(supabase, row);
    case "D3_unpaid_cancelled":
      return composeUnpaidCancelled(supabase, row);
    case "E1_reversal_rebook":
      return composeReversalRebook(supabase, row);
    case "A1_vendor_signed_up":
      return composeSignupAlert(supabase, row);
    case "A1_vendor_welcome":
      return composeVendorWelcome(supabase, row);
    case "A4_invoice_paid":
      return composeVendorReceipt(supabase, row);
    default:
      throw new ComposeError(`no template for event ${row.event}`);
  }
}

/**
 * Drain eligible queued email notifications through the transport. Returns a
 * summary for the audit log. Safe to re-run any time.
 */
export async function drainEmailQueue(
  supabase: SupabaseClient,
  transport: EmailTransport,
  opts: { limit?: number; now?: Date } = {},
): Promise<DrainSummary> {
  const limit = opts.limit ?? 25;
  const now = opts.now ?? new Date();
  const staleIso = new Date(now.getTime() - STALE_SENDING_MINUTES * 60_000).toISOString();

  const { data: rows } = await supabase
    .from("notification")
    .select("id, event, status, attempts, recipient_type, recipient_id, request_id, payload")
    .eq("channel", "email")
    .in("event", SUPPORTED_EMAIL_EVENTS as unknown as string[])
    .or(
      `status.eq.queued,and(status.eq.failed,attempts.lt.${MAX_ATTEMPTS}),and(status.eq.sending,attempts.lte.${MAX_ATTEMPTS},updated_at.lt."${staleIso}")`,
    )
    .order("created_at", { ascending: true })
    .limit(limit);

  const summary: DrainSummary = { picked: rows?.length ?? 0, sent: 0, failed: 0, skipped: 0 };

  for (const row of (rows ?? []) as NotificationRow[]) {
    // Claim: conditional on the exact status+attempts we read, so a concurrent
    // drain (or a race with the webhook) cannot double-claim the row.
    const { data: claimed } = await supabase
      .from("notification")
      .update({ status: "sending", attempts: row.attempts + 1 })
      .eq("id", row.id)
      .eq("status", row.status)
      .eq("attempts", row.attempts)
      .select("id");
    if (!claimed?.length) {
      summary.skipped += 1;
      continue;
    }

    try {
      const { email, to } = await compose(supabase, row);
      // The hard test-mode guard: no real external recipient until EMAIL_MODE=live.
      const finalTo = isLiveMode() ? to : (process.env.EMAIL_TEST_RECIPIENT ?? TEST_TO_FALLBACK);
      const result = await transport({
        to: finalTo,
        from: fromAddress(email.fromKind),
        replyTo: process.env.EMAIL_REPLY_TO || undefined,
        subject: email.subject,
        html: email.html,
        text: email.text,
        attachments: email.attachments,
        idempotencyKey: row.id,
      });
      if (result.ok) {
        await supabase
          .from("notification")
          .update({
            status: "sent",
            provider_message_id: result.providerId,
            sent_at: new Date().toISOString(),
            sent_to: finalTo,
            last_error: null,
          })
          .eq("id", row.id)
          .eq("status", "sending");
        summary.sent += 1;
      } else {
        await supabase
          .from("notification")
          .update({ status: "failed", last_error: result.error })
          .eq("id", row.id)
          .eq("status", "sending");
        summary.failed += 1;
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      await supabase
        .from("notification")
        .update({ status: "failed", last_error: message })
        .eq("id", row.id)
        .eq("status", "sending");
      summary.failed += 1;
    }
  }

  return summary;
}
