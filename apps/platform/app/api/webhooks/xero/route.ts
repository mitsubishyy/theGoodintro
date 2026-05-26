import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { applyPaidInvoice } from "@/lib/billing";

/**
 * Xero "invoice paid" webhook. Security-critical (SECURITY_AND_COMPLIANCE.md):
 *  - verifies the HMAC-SHA256 signature against XERO_WEBHOOK_KEY before trusting
 *    anything (a forged "paid" must never unlock access),
 *  - writes with the service-role client,
 *  - applyPaidInvoice is idempotent (Xero can resend; replay is a no-op).
 *
 * Stubbed payload contract until the real Xero mapping is wired with creds:
 *   { "events": [ { "xeroInvoiceId": "...", "status": "PAID" } ] }
 */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export async function POST(req: NextRequest) {
  const key = process.env.XERO_WEBHOOK_KEY;
  const raw = await req.text();

  if (!key) {
    // Built but inert until the signing key is provided.
    return new NextResponse("webhook_not_configured", { status: 503 });
  }

  const signature = req.headers.get("x-xero-signature") ?? "";
  const expected = crypto.createHmac("sha256", key).update(raw).digest("base64");
  if (!safeEqual(signature, expected)) {
    return new NextResponse("invalid_signature", { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) return new NextResponse("service_role_unavailable", { status: 503 });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return new NextResponse("bad_json", { status: 400 });
  }

  const events =
    body && typeof body === "object" && Array.isArray((body as { events?: unknown }).events)
      ? ((body as { events: { xeroInvoiceId?: string; status?: string }[] }).events)
      : [];

  for (const e of events) {
    if (e?.xeroInvoiceId && String(e.status).toUpperCase() === "PAID") {
      await applyPaidInvoice(admin, String(e.xeroInvoiceId));
    }
  }

  return NextResponse.json({ ok: true });
}
