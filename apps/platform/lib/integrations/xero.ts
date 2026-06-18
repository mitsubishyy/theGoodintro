import type { SupabaseClient } from "@supabase/supabase-js";
import { encryptSecret, decryptSecret } from "../crypto";

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

// ─────────────────────────────────────────────────────────────────────────
// Stage 2 — invoice creation (XERO_INTEGRATION_CONTRACT.md §3).
// ─────────────────────────────────────────────────────────────────────────

const API_BASE = "https://api.xero.com/api.xro/2.0";

/** Xero returns money as decimal dollars; we store integer cents everywhere. */
export function dollarsToCents(n: number | string): number {
  return Math.round(Number(n) * 100);
}

/**
 * Money-safety gate (CALCULATIONS.md): refuse to record an invoice whose Xero
 * totals do not match the figures the pricing engine produced. A GST or
 * subtotal mismatch means a tax-rate / account misconfiguration and must fail
 * loudly rather than silently book a wrong amount.
 */
export function assertInvoiceTotals(
  got: { subTotalCents: number; totalTaxCents: number },
  expected: { subTotalCents: number; gstCents: number },
): void {
  if (got.subTotalCents !== expected.subTotalCents || got.totalTaxCents !== expected.gstCents) {
    throw new Error(
      `Xero invoice totals mismatch: got subtotal ${got.subTotalCents}c / GST ${got.totalTaxCents}c, ` +
        `expected ${expected.subTotalCents}c / ${expected.gstCents}c`,
    );
  }
}

async function xeroApi(
  method: "GET" | "POST",
  path: string,
  accessToken: string,
  tenantId: string,
  body?: unknown,
): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "xero-tenant-id": tenantId,
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`Xero ${method} ${path} failed (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as Record<string, unknown>;
}

/** Update only the token columns after a refresh (keeps connected_at/by intact). */
async function updateTokensAfterRefresh(
  admin: SupabaseClient,
  tenantId: string,
  t: TokenResponse,
): Promise<void> {
  const patch: Record<string, unknown> = {
    access_token_enc: encryptSecret(t.access_token),
    refresh_token_enc: encryptSecret(t.refresh_token),
    expires_at: new Date(Date.now() + t.expires_in * 1000).toISOString(),
  };
  if (t.scope) patch.scope = t.scope;
  await admin.from("xero_connection").update(patch).eq("tenant_id", tenantId);
}

/**
 * Return a usable access token + tenant for API calls, refreshing (and rotating
 * the stored refresh token) when the access token is within 60s of expiry.
 * Returns null when Xero is not configured or not connected. Service-role only.
 */
export async function getValidAccessToken(
  admin: SupabaseClient,
): Promise<{ accessToken: string; tenantId: string } | null> {
  const config = getXeroConfig();
  if (!config) return null;
  const { data: c } = await admin
    .from("xero_connection")
    .select("*")
    .order("connected_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!c) return null;

  const tenantId = c.tenant_id as string;
  const expiresAt = new Date(c.expires_at as string).getTime();
  if (expiresAt > Date.now() + 60_000) {
    return { accessToken: decryptSecret(c.access_token_enc as string), tenantId };
  }
  // Expired (or about to): refresh + rotate.
  const refreshed = await refreshTokens(config, decryptSecret(c.refresh_token_enc as string));
  await updateTokensAfterRefresh(admin, tenantId, refreshed);
  return { accessToken: refreshed.access_token, tenantId };
}

/** Pick an active REVENUE account code to book the sale against (prefer "200" Sales). */
export async function getRevenueAccountCode(accessToken: string, tenantId: string): Promise<string> {
  const data = await xeroApi("GET", "Accounts", accessToken, tenantId);
  const accounts = (data.Accounts as { Code?: string; Name?: string; Class?: string; Status?: string }[]) ?? [];
  const revenue = accounts.filter((a) => a.Class === "REVENUE" && a.Status === "ACTIVE" && a.Code);
  if (revenue.length === 0) throw new Error("no active REVENUE account in the Xero chart of accounts");
  const pick =
    revenue.find((a) => a.Code === "200") ?? revenue.find((a) => /sales/i.test(a.Name ?? "")) ?? revenue[0];
  return pick.Code as string;
}

/** Find the vendor's Xero contact by our vendor id (ContactNumber), or create it. */
export async function findOrCreateContact(
  accessToken: string,
  tenantId: string,
  input: { vendorId: string; vendorName: string; email?: string },
): Promise<string> {
  const byNumber = await xeroApi(
    "GET",
    `Contacts?where=${encodeURIComponent(`ContactNumber=="${input.vendorId}"`)}`,
    accessToken,
    tenantId,
  );
  const existing = (byNumber.Contacts as { ContactID: string }[]) ?? [];
  if (existing.length > 0) return existing[0].ContactID;

  const payload = {
    Contacts: [
      {
        Name: input.vendorName,
        ContactNumber: input.vendorId,
        ...(input.email ? { EmailAddress: input.email } : {}),
      },
    ],
  };
  try {
    const created = await xeroApi("POST", "Contacts", accessToken, tenantId, payload);
    return ((created.Contacts as { ContactID: string }[]) ?? [])[0].ContactID;
  } catch (e) {
    // Xero requires a unique contact Name; if one already exists under that name
    // (created outside our ContactNumber convention), reuse it.
    const safeName = input.vendorName.replace(/"/g, "");
    const byName = await xeroApi(
      "GET",
      `Contacts?where=${encodeURIComponent(`Name=="${safeName}"`)}`,
      accessToken,
      tenantId,
    );
    const named = (byName.Contacts as { ContactID: string }[]) ?? [];
    if (named.length > 0) return named[0].ContactID;
    throw e;
  }
}

export type CreatedInvoice = {
  invoiceId: string;
  invoiceNumber: string | null;
  status: string;
  subTotalCents: number;
  totalTaxCents: number;
  totalCents: number;
};

/**
 * Create an ACCREC invoice with one credits line. LineAmountTypes Exclusive +
 * TaxType OUTPUT (AU GST on income, 10%) so Xero computes GST itself — never
 * push GST as a separate line. Defaults to DRAFT (stage 2 test mode); stage 3
 * raises AUTHORISED so the invoice can be emailed and paid.
 */
export async function createInvoice(
  accessToken: string,
  tenantId: string,
  input: {
    contactId: string;
    quantity: number;
    unitAmountDollars: number;
    accountCode: string;
    taxType?: string;
    status?: "DRAFT" | "AUTHORISED";
    reference?: string;
  },
): Promise<CreatedInvoice> {
  const payload = {
    Invoices: [
      {
        Type: "ACCREC",
        Status: input.status ?? "DRAFT",
        Contact: { ContactID: input.contactId },
        LineAmountTypes: "Exclusive",
        ...(input.reference ? { Reference: input.reference } : {}),
        LineItems: [
          {
            Description: `Meeting credits x${input.quantity}`,
            Quantity: input.quantity,
            UnitAmount: input.unitAmountDollars,
            AccountCode: input.accountCode,
            TaxType: input.taxType ?? "OUTPUT",
          },
        ],
      },
    ],
  };
  const data = await xeroApi("POST", "Invoices", accessToken, tenantId, payload);
  const inv = ((data.Invoices as Record<string, unknown>[]) ?? [])[0];
  if (!inv) throw new Error("Xero returned no invoice");
  return {
    invoiceId: inv.InvoiceID as string,
    invoiceNumber: (inv.InvoiceNumber as string) || null,
    status: inv.Status as string,
    subTotalCents: dollarsToCents(inv.SubTotal as number),
    totalTaxCents: dollarsToCents(inv.TotalTax as number),
    totalCents: dollarsToCents(inv.Total as number),
  };
}

/**
 * Orchestrate a vendor credit-purchase invoice end to end: valid token → revenue
 * account → contact → invoice, then assert the Xero totals equal the pricing
 * engine's figures before returning. Returns null if Xero is not connected
 * (caller falls back to the stub). Throws on any API error or totals mismatch.
 */
export async function createCreditPurchaseInvoice(
  admin: SupabaseClient,
  input: {
    vendorId: string;
    vendorName: string;
    vendorEmail?: string;
    quantity: number;
    unitAmountCents: number;
    expectedSubTotalCents: number;
    expectedGstCents: number;
    status?: "DRAFT" | "AUTHORISED";
    reference?: string;
  },
): Promise<CreatedInvoice & { accountCode: string } | null> {
  const tok = await getValidAccessToken(admin);
  if (!tok) return null;
  const accountCode = await getRevenueAccountCode(tok.accessToken, tok.tenantId);
  const contactId = await findOrCreateContact(tok.accessToken, tok.tenantId, {
    vendorId: input.vendorId,
    vendorName: input.vendorName,
    email: input.vendorEmail,
  });
  const inv = await createInvoice(tok.accessToken, tok.tenantId, {
    contactId,
    quantity: input.quantity,
    unitAmountDollars: input.unitAmountCents / 100,
    accountCode,
    status: input.status ?? "DRAFT",
    reference: input.reference,
  });
  assertInvoiceTotals(inv, {
    subTotalCents: input.expectedSubTotalCents,
    gstCents: input.expectedGstCents,
  });
  return { ...inv, accountCode };
}
