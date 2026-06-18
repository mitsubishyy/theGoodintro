import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFlag } from "@/lib/flags";
import {
  getValidAccessToken,
  getInvoice,
  reconcileXeroInvoices,
} from "@/lib/integrations/xero";

/**
 * Daily Xero reconcile job — the paid-webhook safety net (PRODUCTION_READINESS
 * B4; DEC-7 pg_cron). Supabase pg_cron -> pg_net POSTs here once a day with the
 * CRON_SECRET bearer (the §10 ops snippet in XERO_INTEGRATION_CONTRACT.md).
 *
 * Localhost can't be reached by pg_cron, so the live SCHEDULE is a staging/prod
 * step; the reconcile LOGIC is DB-tested directly (tests/xero-reconcile.test.ts)
 * with an injected status-fetcher, so this route stays a thin live wiring.
 *
 * Security-critical (it can unlock credits):
 *  - a shared CRON_SECRET bearer gates the route; inert (503) until it is set,
 *    mirroring the webhook's XERO_WEBHOOK_KEY,
 *  - behind integrations_xero (off => no-op),
 *  - service-role client; the idempotent applyPaidInvoice means a double-fire
 *    (cron + webhook) cannot double-credit.
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

  if (!(await getFlag("integrations_xero"))) {
    return NextResponse.json({ skipped: "integrations_xero_off" }, { status: 200 });
  }
  const admin = createAdminClient();
  if (!admin) {
    return new NextResponse("no_admin_client", { status: 503 });
  }
  const tok = await getValidAccessToken(admin);
  if (!tok) {
    return NextResponse.json({ skipped: "xero_not_connected" }, { status: 200 });
  }

  const summary = await reconcileXeroInvoices(admin, (id) =>
    getInvoice(tok.accessToken, tok.tenantId, id),
  );
  return NextResponse.json({ ok: true, summary }, { status: 200 });
}
