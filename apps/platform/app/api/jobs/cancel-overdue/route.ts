import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFlagAuthoritative } from "@/lib/flags";
import { cancelOverdueOvercommitMeetings } from "@/lib/meetings";
import { logSecurityEvent } from "@/lib/security-log";

/**
 * Daily auto-cancel of unpaid, overdue overcommit meetings (STATE_MACHINES.md
 * `confirmed -> cancelled`, the uncredited-payment sub-flow step 5). Supabase
 * pg_cron -> pg_net POSTs here once a day with the CRON_SECRET bearer (the same
 * server-to-server pattern as the reconcile + email-drain jobs). It hands off to
 * the atomic, money-safe public.cancel_overdue_overcommit_meetings RPC, which
 * only ever cancels confirmed, uncredited meetings past their payment_due_at and
 * queues the D3 vendor + exec + EA notices.
 *
 * The cancel LOGIC is DB-tested directly (auto-cancel-overcommit.test.ts); the
 * live SCHEDULE is a staging/prod runbook step (localhost is unreachable by
 * pg_cron), so this route stays thin live wiring, like B4's reconcile job.
 *
 * Gating:
 *  - a shared CRON_SECRET bearer (inert 503 until set, mirroring the other jobs),
 *  - the auto_cancel_overcommit flag, read AUTHORITATIVELY: a cron POST has no
 *    user session, so a session-scoped flag read would always be OFF
 *    (feature_flag RLS is authenticated-only). Off by default (CHANGE_SAFETY);
 *    Issy enables on staging.
 *
 * On a non-zero run it emits a structured `overcommit_auto_cancelled` security-
 * log line so the money-state change is visible even before the email surface
 * dispatches the queued D3 notices.
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

  if (!(await getFlagAuthoritative("auto_cancel_overcommit"))) {
    return NextResponse.json({ skipped: "auto_cancel_overcommit_off" }, { status: 200 });
  }
  const admin = createAdminClient();
  if (!admin) {
    return new NextResponse("no_admin_client", { status: 503 });
  }

  const result = await cancelOverdueOvercommitMeetings(admin);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }
  if (result.cancelled > 0) {
    logSecurityEvent("overcommit_auto_cancelled", { cancelled: result.cancelled });
  }
  return NextResponse.json({ ok: true, cancelled: result.cancelled }, { status: 200 });
}
