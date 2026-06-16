import type { SupabaseClient } from "@supabase/supabase-js";
import { encryptSecret } from "../crypto";

/**
 * Xero OAuth 2.0 client (XERO_INTEGRATION_CONTRACT.md §2). Stage 1: the connect
 * flow only — build the authorize URL, exchange the code, read the tenant, and
 * store the encrypted tokens. Invoice creation (§3) and the paid webhook (§5)
 * are later stages and are NOT implemented here.
 *
 * Server only (reads client secret + encryption key). The connection row is
 * written with the service-role client (xero_connection is RLS-locked to
 * service role; see migration 0020).
 */
export const AUTHORIZE_URL = "https://login.xero.com/identity/connect/authorize";
export const TOKEN_URL = "https://identity.xero.com/connect/token";
export const CONNECTIONS_URL = "https://api.xero.com/connections";

// Granular Accounting scopes. Xero retired the broad `accounting.transactions`
// for apps created after 2026-03-02 (this app is post-cutoff), so we request the
// granular replacements (verified valid against this app, 2026-06-16):
//   offline_access          => refresh token (without it the link dies in 30 min)
//   accounting.contacts     => vendor as a Xero contact (find/create)
//   accounting.invoices     => create + read ACCREC invoices, detect paid via status
//   accounting.settings.read=> read the income account code + GST tax rate for invoicing
export const SCOPES =
  "openid profile email offline_access accounting.contacts accounting.invoices accounting.settings.read";

/** Name of the short-lived CSRF cookie set before redirecting to Xero. */
export const STATE_COOKIE = "xero_oauth_state";

type XeroConfig = { clientId: string; clientSecret: string; redirectUri: string };

/** Returns the configured creds, or null if any are missing (keeps the UI graceful). */
export function getXeroConfig(): XeroConfig | null {
  const clientId = process.env.XERO_CLIENT_ID;
  const clientSecret = process.env.XERO_CLIENT_SECRET;
  const redirectUri = process.env.XERO_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) return null;
  return { clientId, clientSecret, redirectUri };
}

export function isXeroConfigured(): boolean {
  return getXeroConfig() !== null;
}

/** Step 1: the URL we send the admin to. `state` is the CSRF token we re-check on return. */
export function buildAuthorizeUrl(config: XeroConfig, state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: SCOPES,
    state,
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number; // seconds (Xero: 1800 = 30 min)
  scope?: string;
};

function basicAuth(config: XeroConfig): string {
  return Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
}

/** Step 2: exchange the authorization code for tokens. */
export async function exchangeCodeForTokens(
  config: XeroConfig,
  code: string,
): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth(config)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: config.redirectUri,
    }).toString(),
  });
  if (!res.ok) {
    throw new Error(`Xero token exchange failed (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as TokenResponse;
}

/**
 * Refresh path (contract §2: refresh tokens are single-use and rotate). Not on
 * the stage-1 connect path, but the persistence side rotates correctly so the
 * stage-2/3 poller/caller can reuse it.
 */
export async function refreshTokens(
  config: XeroConfig,
  refreshToken: string,
): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth(config)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
  });
  if (!res.ok) {
    throw new Error(`Xero token refresh failed (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as TokenResponse;
}

type XeroTenant = { tenantId: string; tenantName: string; tenantType: string };

/** Step 3: which Xero org(s) the user connected. We use the first tenant. */
export async function fetchConnections(accessToken: string): Promise<XeroTenant[]> {
  const res = await fetch(CONNECTIONS_URL, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Xero connections fetch failed (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as XeroTenant[];
}

/**
 * Persist (upsert) the connection with both tokens encrypted. Keyed on
 * tenant_id so re-connecting the same org rotates its tokens in place. Must be
 * called with the service-role client (RLS-locked table).
 */
export async function storeConnection(
  admin: SupabaseClient,
  input: {
    tenantId: string;
    tenantName: string | null;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    scope?: string;
    connectedBy: string | null;
  },
): Promise<void> {
  const expiresAt = new Date(Date.now() + input.expiresIn * 1000).toISOString();
  const { error } = await admin.from("xero_connection").upsert(
    {
      tenant_id: input.tenantId,
      tenant_name: input.tenantName,
      access_token_enc: encryptSecret(input.accessToken),
      refresh_token_enc: encryptSecret(input.refreshToken),
      expires_at: expiresAt,
      scope: input.scope ?? null,
      connected_by: input.connectedBy,
      connected_at: new Date().toISOString(),
    },
    { onConflict: "tenant_id" },
  );
  if (error) throw new Error(`storing Xero connection failed: ${error.message}`);
}

export type XeroConnectionStatus = {
  connected: boolean;
  tenantName: string | null;
  connectedAt: string | null;
  expiresAt: string | null;
};

/**
 * Read connection status for the admin UI. Selects only non-secret columns and
 * never decrypts tokens. Service-role client (RLS-locked table).
 */
export async function getConnectionStatus(
  admin: SupabaseClient,
): Promise<XeroConnectionStatus> {
  const { data } = await admin
    .from("xero_connection")
    .select("tenant_name, connected_at, expires_at")
    .order("connected_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) {
    return { connected: false, tenantName: null, connectedAt: null, expiresAt: null };
  }
  return {
    connected: true,
    tenantName: (data.tenant_name as string) ?? null,
    connectedAt: (data.connected_at as string) ?? null,
    expiresAt: (data.expires_at as string) ?? null,
  };
}
