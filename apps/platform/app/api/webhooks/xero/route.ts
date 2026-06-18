import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  verifyXeroSignature,
  getValidAccessToken,
  getInvoice,
  processInvoiceEvents,
  type XeroWebhookEvent,
} from "@/lib/integrations/xero";

/**
 * Xero "invoice paid" webhook (XERO_INTEGRATION_CONTRACT.md §5; DEC-13).
 * Security-critical:
 *  - verifies the base64 HMAC-SHA256 signature on the RAW body before trusting
 *    anything (a forged "paid" must never unlock access),
 *  - is also the intent-to-receive (ITR) endpoint: a valid signature returns
 *    200, an invalid one 401, fast and with no body, so the dev-portal
 *    handshake passes,
 *  - writes with the service-role client,
 *  - Xero webhooks are thin (no invoice data): for each INVOICE event we call
 *    back to Xero for the real status, and only a fully-paid invoice runs
 *    applyPaidInvoice — which is idempotent, so Xero re-sends cannot
 *    double-credit.
 *
 * Live delivery + the ITR handshake need a PUBLIC URL Xero can reach, so they
 * happen on staging/production, not localhost. XERO_WEBHOOK_KEY is the
 * dev-portal "Webhooks" tab signing key.
 */
export async function POST(req: NextRequest) {
  const key = process.env.XERO_WEBHOOK_KEY;
  const raw = await req.text();
  if (!key) {
    // Built but inert until the signing key is provided.
    return new NextResponse("webhook_not_configured", { status: 503 });
  }

  const signature = req.headers.get("x-xero-signature") ?? "";
  if (!verifyXeroSignature(raw, signature, key)) {
    return new NextResponse(null, { status: 401 }); // ITR: incorrect signature
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return new NextResponse("bad_json", { status: 400 });
  }
  const events =
    body && typeof body === "object" && Array.isArray((body as { events?: unknown }).events)
      ? (body as { events: XeroWebhookEvent[] }).events
      : [];

  // ITR pings carry a valid signature but no events; ack 200 even when there is
  // nothing to fetch back (no events / no connection) so the handshake passes.
  const admin = createAdminClient();
  if (admin && events.length > 0) {
    const tok = await getValidAccessToken(admin);
    if (tok) {
      await processInvoiceEvents(admin, events, (id) =>
        getInvoice(tok.accessToken, tok.tenantId, id),
      );
    }
  }

  return new NextResponse(null, { status: 200 }); // ITR / ack: valid signature
}
