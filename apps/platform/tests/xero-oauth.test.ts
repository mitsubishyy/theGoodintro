import { describe, it, expect } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { encryptSecret, decryptSecret, isSecretEncryptionConfigured } from "../lib/crypto";
import {
  buildAuthorizeUrl,
  storeConnection,
  getConnectionStatus,
} from "../lib/integrations/xero";

// Pure unit tests (no DB): token encryption + the front-channel authorize URL.
describe("crypto (token encryption at rest)", () => {
  it("round-trips and keeps ciphertext distinct from plaintext", () => {
    expect(isSecretEncryptionConfigured()).toBe(true);
    const secret = "refresh-token-abc.DEF-123_456";
    const enc = encryptSecret(secret);
    expect(enc).not.toContain(secret);
    expect(decryptSecret(enc)).toBe(secret);
  });

  it("uses a fresh IV per call (same input → different ciphertext)", () => {
    const a = encryptSecret("same");
    const b = encryptSecret("same");
    expect(a).not.toBe(b);
    expect(decryptSecret(a)).toBe("same");
    expect(decryptSecret(b)).toBe("same");
  });

  it("rejects tampered ciphertext via the GCM auth tag", () => {
    const buf = Buffer.from(encryptSecret("tamper-me"), "base64");
    buf[buf.length - 1] ^= 0xff; // flip the last ciphertext byte
    expect(() => decryptSecret(buf.toString("base64"))).toThrow();
  });
});

describe("buildAuthorizeUrl", () => {
  it("carries the required OAuth params + scopes and never the secret", () => {
    const url = new URL(
      buildAuthorizeUrl(
        {
          clientId: "CID",
          clientSecret: "SEC",
          redirectUri: "http://localhost:3001/api/integrations/xero/callback",
        },
        "state-xyz",
      ),
    );
    expect(url.origin + url.pathname).toBe(
      "https://login.xero.com/identity/connect/authorize",
    );
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("client_id")).toBe("CID");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "http://localhost:3001/api/integrations/xero/callback",
    );
    expect(url.searchParams.get("state")).toBe("state-xyz");
    const scope = url.searchParams.get("scope") ?? "";
    expect(scope).toContain("offline_access");
    expect(scope).toContain("accounting.invoices");
    expect(scope).toContain("accounting.contacts");
    // broad accounting.transactions is retired for apps created after 2026-03-02
    expect(scope).not.toContain("accounting.transactions");
    expect(url.toString()).not.toContain("SEC"); // secret stays out of the front channel
  });
});

// DB round-trip (service role; needs the local stack with migration 0020).
describe("xero_connection store (DB, service role)", () => {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const svc = (): SupabaseClient =>
    createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  it("stores encrypted tokens, reads status without decrypting, and upserts per tenant", async () => {
    const sb = svc();
    const tenantId = `test-tenant-${Date.now()}`;

    await storeConnection(sb, {
      tenantId,
      tenantName: "Demo Company (AU)",
      accessToken: "access-XYZ",
      refreshToken: "refresh-XYZ",
      expiresIn: 1800,
      scope: "openid accounting.transactions",
      connectedBy: null,
    });

    // Columns hold ciphertext, not the raw tokens — but decrypt back cleanly.
    const { data: row } = await sb
      .from("xero_connection")
      .select("access_token_enc, refresh_token_enc")
      .eq("tenant_id", tenantId)
      .single();
    expect(row?.access_token_enc).not.toContain("access-XYZ");
    expect(decryptSecret(row!.access_token_enc as string)).toBe("access-XYZ");
    expect(decryptSecret(row!.refresh_token_enc as string)).toBe("refresh-XYZ");

    const status = await getConnectionStatus(sb);
    expect(status.connected).toBe(true);
    expect(status.tenantName).toBe("Demo Company (AU)");

    // Re-connecting the same org rotates tokens in place (no duplicate row).
    await storeConnection(sb, {
      tenantId,
      tenantName: "Demo Company (AU)",
      accessToken: "access-2",
      refreshToken: "refresh-2",
      expiresIn: 1800,
      connectedBy: null,
    });
    const { count } = await sb
      .from("xero_connection")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId);
    expect(count).toBe(1);

    await sb.from("xero_connection").delete().eq("tenant_id", tenantId);
  });
});
