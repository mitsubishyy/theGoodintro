import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFlag } from "@/lib/flags";
import { drainEmailQueue } from "@/lib/email/sender";
import { resendTransport } from "@/lib/email/transport";

/**
 * Email queue drain job — the automated dispatcher (PRODUCTION_READINESS S6;
 * DEC-7 pg_cron). Supabase pg_cron -> pg_net POSTs here on a schedule with the
 * CRON_SECRET bearer, the same server-to-server pattern as
 * /api/jobs/xero-reconcile. This replaces the manual admin "Send queued emails"
 * stopgap: nothing was draining the queue without a human click.
 *
 * `drainEmailQueue` is the same idempotent logic the admin action and
 * tests/email.test.ts already cover (claim -> compose -> send -> write back,
 * keyed by notification id so a re-fire never double-sends), so this route is
 * thin live wiring. Localhost can't be reached by pg_cron, so the live SCHEDULE
 * is a staging/prod runbook step; the drain LOGIC is DB-tested directly.
 *
 * Layered guards (no real external mail until Issy is ready):
 *  - a shared CRON_SECRET bearer gates the route; inert (503) until it is set,
 *    mirroring the Xero job + webhook,
 *  - behind the email_sending flag (off => no-op),
 *  - RESEND_API_KEY required (skips cleanly if absent),
 *  - drainEmailQueue keeps the EMAIL_MODE=test redirect (every recipient ->
 *    EMAIL_TEST_RECIPIENT) until Issy flips EMAIL_MODE=live after DNS is verified.
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

  if (!(await getFlag("email_sending"))) {
    return NextResponse.json({ skipped: "email_sending_off" }, { status: 200 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return NextResponse.json({ skipped: "resend_not_configured" }, { status: 200 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return new NextResponse("no_admin_client", { status: 503 });
  }

  const summary = await drainEmailQueue(admin, resendTransport(key));
  return NextResponse.json({ ok: true, summary }, { status: 200 });
}
