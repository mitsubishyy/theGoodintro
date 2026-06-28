import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFlagAuthoritative } from "@/lib/flags";
import { queueOverduePaymentReminders } from "@/lib/meetings";
import { logSecurityEvent } from "@/lib/security-log";

/**
 * Daily D2 payment reminder for unpaid overcommit meetings ~7 days before their
 * payment_due_at (STATE_MACHINES.md uncredited-payment sub-flow step 3;
 * NOTIFICATION_TEMPLATES "D2 · Payment reminder"). Supabase pg_cron -> pg_net
 * POSTs here once a day with the CRON_SECRET bearer (the same server-to-server
 * pattern as the reconcile + auto-cancel + email-drain jobs). It hands off to the
 * atomic, once-only public.queue_overdue_payment_reminders RPC, which only ever
 * queues a single vendor D2 email per confirmed, uncredited, not-yet-due meeting
 * inside the 7-day window and stamps each so a re-run never re-reminds.
 *
 * The queue LOGIC is DB-tested directly (payment-reminder.test.ts); the live
 * SCHEDULE is a staging/prod runbook step (localhost is unreachable by pg_cron),
 * so this route stays thin live wiring, like the auto-cancel + reconcile jobs.
 *
 * Gating:
 *  - a shared CRON_SECRET bearer (inert 503 until set, mirroring the other jobs),
 *  - the payment_reminder flag, read AUTHORITATIVELY: a cron POST has no user
 *    session, so a session-scoped flag read would always be OFF (feature_flag RLS
 *    is authenticated-only). Off by default (CHANGE_SAFETY); Issy enables on
 *    staging.
 *
 * On a non-zero run it emits a structured `payment_reminders_queued` security-log
 * line so the queued reminders are visible even before the email surface drains.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return new NextResponse("cron_not_configured", { status: 503 });
  }
  // Server-to-server shared secret (high entropy); exact bearer match.
  if ((req.headers.get("authorization") ?? "") !== `Bearer ${secret}`) {
    return new NextResponse(null, { status: 401 });
  }

  if (!(await getFlagAuthoritative("payment_reminder"))) {
    return NextResponse.json({ skipped: "payment_reminder_off" }, { status: 200 });
  }
  const admin = createAdminClient();
  if (!admin) {
    return new NextResponse("no_admin_client", { status: 503 });
  }

  const result = await queueOverduePaymentReminders(admin);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }
  if (result.queued > 0) {
    logSecurityEvent("payment_reminders_queued", { queued: result.queued });
  }
  return NextResponse.json({ ok: true, queued: result.queued }, { status: 200 });
}
