import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Route-handler WIRING tests for the two Xero job routes: status-code guards
// (503 inert / 401 bad secret / 200) without touching the DB or live Xero. The
// unlock + reconcile LOGIC is covered by the lib tests (xero-webhook /
// xero-reconcile); here we prove the secret gating + branching the staging
// deploy depends on. All deps are mocked so this is pure + deterministic.
vi.mock("@/lib/flags", () => ({ getFlag: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn() }));
vi.mock("@/lib/integrations/xero", () => ({
  verifyXeroSignature: vi.fn(),
  getValidAccessToken: vi.fn(),
  getInvoice: vi.fn(),
  processInvoiceEvents: vi.fn(),
  reconcileXeroInvoices: vi.fn(),
}));

import { POST as webhookPOST } from "../app/api/webhooks/xero/route";
import { POST as reconcilePOST } from "../app/api/jobs/xero-reconcile/route";
import { getFlag } from "@/lib/flags";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  verifyXeroSignature,
  getValidAccessToken,
  reconcileXeroInvoices,
} from "@/lib/integrations/xero";

const post = (url: string, body: string, headers: Record<string, string> = {}) =>
  new NextRequest(url, { method: "POST", body, headers });

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllEnvs());

describe("POST /api/webhooks/xero (guard wiring)", () => {
  const URL = "http://localhost:3001/api/webhooks/xero";

  it("503 when XERO_WEBHOOK_KEY is unset (built but inert)", async () => {
    vi.stubEnv("XERO_WEBHOOK_KEY", "");
    const res = await webhookPOST(post(URL, "{}"));
    expect(res.status).toBe(503);
  });

  it("401 on a bad signature (ITR reject)", async () => {
    vi.stubEnv("XERO_WEBHOOK_KEY", "k");
    vi.mocked(verifyXeroSignature).mockReturnValue(false);
    const res = await webhookPOST(post(URL, '{"events":[]}', { "x-xero-signature": "bad" }));
    expect(res.status).toBe(401);
  });

  it("200 on a valid signature with no events (ITR pass), without calling Xero", async () => {
    vi.stubEnv("XERO_WEBHOOK_KEY", "k");
    vi.mocked(verifyXeroSignature).mockReturnValue(true);
    vi.mocked(createAdminClient).mockReturnValue(null as never);
    const res = await webhookPOST(post(URL, '{"events":[]}', { "x-xero-signature": "ok" }));
    expect(res.status).toBe(200);
    expect(getValidAccessToken).not.toHaveBeenCalled();
  });
});

describe("POST /api/jobs/xero-reconcile (guard wiring)", () => {
  const URL = "http://localhost:3001/api/jobs/xero-reconcile";

  it("503 when CRON_SECRET is unset", async () => {
    vi.stubEnv("CRON_SECRET", "");
    const res = await reconcilePOST(post(URL, ""));
    expect(res.status).toBe(503);
  });

  it("401 on a wrong bearer", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    const res = await reconcilePOST(post(URL, "", { authorization: "Bearer nope" }));
    expect(res.status).toBe(401);
  });

  it("200 + skipped when integrations_xero is off (no Xero call)", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    vi.mocked(getFlag).mockResolvedValue(false);
    const res = await reconcilePOST(post(URL, "", { authorization: "Bearer s3cret" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ skipped: "integrations_xero_off" });
    expect(reconcileXeroInvoices).not.toHaveBeenCalled();
  });

  it("runs the reconcile and returns its summary when flagged on + connected", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    vi.mocked(getFlag).mockResolvedValue(true);
    vi.mocked(createAdminClient).mockReturnValue({} as never);
    vi.mocked(getValidAccessToken).mockResolvedValue({ accessToken: "t", tenantId: "x" });
    const summary = { checked: 2, driftUnlocked: 1, voidedPaid: 0, voidedUnpaid: 0, errors: 0 };
    vi.mocked(reconcileXeroInvoices).mockResolvedValue(summary);
    const res = await reconcilePOST(post(URL, "", { authorization: "Bearer s3cret" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, summary });
    expect(reconcileXeroInvoices).toHaveBeenCalledOnce();
  });
});
