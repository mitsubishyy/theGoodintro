import { type NextRequest, NextResponse } from "next/server";
import { getStaff } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";
import {
  STATE_COOKIE,
  getXeroConfig,
  exchangeCodeForTokens,
  fetchConnections,
  storeConnection,
} from "@/lib/integrations/xero";

/**
 * Xero OAuth callback (XERO_INTEGRATION_CONTRACT.md §2). Completes the connect
 * flow: verifies the CSRF state, exchanges the code for tokens, reads the
 * tenant, and stores the tokens encrypted via the service-role client. Always
 * lands back on /admin/settings with a ?xero=<status> banner.
 *
 * Security: flag-gated, requires a signed-in staff session, and rejects on
 * state mismatch before any token exchange. Tokens are encrypted at rest
 * (lib/crypto.ts) and never logged.
 */
const SETTINGS = "/admin/settings";

function back(req: NextRequest, status: string): NextResponse {
  const res = NextResponse.redirect(new URL(`${SETTINGS}?xero=${status}`, req.url));
  res.cookies.delete(STATE_COOKIE); // single-use state, clear it on the way out
  return res;
}

export async function GET(req: NextRequest) {
  if (!(await getFlag("integrations_xero"))) return back(req, "disabled");

  const staffCtx = await getStaff();
  if (!staffCtx?.staff) {
    return NextResponse.redirect(new URL("/login?error=not_staff", req.url));
  }

  const url = new URL(req.url);
  if (url.searchParams.get("error")) return back(req, "error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return back(req, "error");

  // CSRF: the state must match the cookie we set in the start action.
  const expected = req.cookies.get(STATE_COOKIE)?.value;
  if (!expected || expected !== state) return back(req, "state_mismatch");

  const config = getXeroConfig();
  if (!config) return back(req, "not_configured");
  const admin = createAdminClient();
  if (!admin) return back(req, "error");

  try {
    const tokens = await exchangeCodeForTokens(config, code);
    const tenants = await fetchConnections(tokens.access_token);
    const tenant = tenants[0];
    if (!tenant) return back(req, "no_tenant");

    await storeConnection(admin, {
      tenantId: tenant.tenantId,
      tenantName: tenant.tenantName ?? null,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      scope: tokens.scope,
      connectedBy: (staffCtx.staff.id as string) ?? null,
    });

    await logAudit(admin, staffCtx.staff.id as string, {
      action: "integration.xero.connected",
      targetType: "xero_connection",
      targetId: tenant.tenantId,
      metadata: { tenant_name: tenant.tenantName ?? null },
    });
  } catch {
    // Never leak token/exchange details to the client.
    return back(req, "error");
  }

  return back(req, "connected");
}
