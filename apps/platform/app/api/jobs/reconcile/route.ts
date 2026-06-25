import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFlagAuthoritative } from "@/lib/flags";
import { reconcileAll, summarizeReconciliation } from "@/lib/reporting";
import { logSecurityEvent } from "@/lib/security-log";

/**
 * Daily money-invariants reconciliation safety net (PRODUCTION_READINESS B4).
 * Supabase pg_cron -> pg_net POSTs here once a day with the CRON_SECRET bearer
 * (the same server-to-server pattern as the Xero reconcile job). It runs the
 * CALCULATIONS section 4 invariants over ALL live ledgers — invariant 1 (the same
 * gifts summed by charity / vendor / executive each equal the total) and invariant
 * 9 (the master identity: ex-GST fees = donated + owed + retained + deferred) —
 * via reconcileAll, and records any drift.
 *
 * READ-ONLY: it never writes ledger data; it only reads and reports, so a misfire
 * cannot corrupt money state. The reconcileAll + summarize logic is unit/DB-tested
 * (reporting.test.ts ties out on the seed; reconcile-job.test.ts covers the
 * gating + drift-alert branch), so this route stays thin live wiring.
 *
 * Gating:
 *  - a shared CRON_SECRET bearer (inert 503 until set, mirroring the Xero job),
 *  - the reconcile_job flag, read AUTHORITATIVELY: a cron POST has no user
 *    session, so a session-scoped flag read would always be OFF (feature_flag RLS
 *    is authenticated-only). Off by default (CHANGE_SAFETY); Issy enables.
 *
 * Alerting: on drift it emits a structured `reconcile_drift` security-log line
 * (the interim B2 sink) naming the failed invariants, and returns the full report
 * with `alerted: true` so the cron caller / a monitor sees a non-balanced run. The
 * louder push escalation (email / Sentry) rides on B1/B2's dedicated alerter.
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

  if (!(await getFlagAuthoritative("reconcile_job"))) {
    return NextResponse.json({ skipped: "reconcile_job_off" }, { status: 200 });
  }
  const admin = createAdminClient();
  if (!admin) {
    return new NextResponse("no_admin_client", { status: 503 });
  }

  const report = summarizeReconciliation(await reconcileAll(admin));
  if (!report.balances) {
    logSecurityEvent("reconcile_drift", {
      drift: report.drift,
      threeWays: report.threeWays,
      fees: report.fees,
    });
  }
  return NextResponse.json({ ok: true, ...report, alerted: !report.balances }, { status: 200 });
}
