import type { SupabaseClient } from "@supabase/supabase-js";
import { indicativeGiftAud } from "../gift-amount";
import {
  adminSignupAlertEmail,
  execRequestEmail,
  vendorReceiptEmail,
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
  "A1_vendor_signed_up",
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
       executive:executive_id(name, primary_email, charity:default_charity_id(name), ea:ea_id(name)),
       tokens:email_action_token(token, status)`,
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
  const token = (req.tokens as { token: string; status: string }[]).find((t) => t.status === "active");
  if (!exec?.primary_email) throw new ComposeError("executive has no primary email");
  if (!token) throw new ComposeError("no active action token for request");

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
      confirmUrl: `${appBaseUrl()}/e/${token.token}`,
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

async function compose(
  supabase: SupabaseClient,
  row: NotificationRow,
): Promise<{ email: ComposedEmail; to: string }> {
  switch (row.event) {
    case "B1_request_submitted":
      return composeExecRequest(supabase, row);
    case "A1_vendor_signed_up":
      return composeSignupAlert(supabase, row);
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
