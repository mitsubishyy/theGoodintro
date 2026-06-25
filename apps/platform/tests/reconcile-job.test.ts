import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

/**
 * The money-invariants reconciliation job (PRODUCTION_READINESS B4). The
 * reconcileAll tie-out on real data is proven in reporting.test.ts; here we prove
 * the ROUTE wiring the staging cron depends on — the CRON_SECRET + flag gating and
 * the drift-alert branch — with reconcileAll mocked so it is pure + deterministic.
 * summarizeReconciliation is kept REAL (the drift classification is the logic
 * under test), and its purity is checked directly at the bottom.
 */
vi.mock("@/lib/flags", () => ({ getFlagAuthoritative: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn() }));
vi.mock("@/lib/security-log", () => ({ logSecurityEvent: vi.fn() }));
vi.mock("@/lib/reporting", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/reporting")>();
  return { ...actual, reconcileAll: vi.fn() };
});

import { POST } from "../app/api/jobs/reconcile/route";
import { getFlagAuthoritative } from "@/lib/flags";
import { createAdminClient } from "@/lib/supabase/admin";
import { logSecurityEvent } from "@/lib/security-log";
import { reconcileAll, summarizeReconciliation, type ReconcileResult } from "@/lib/reporting";

const URL = "http://localhost:3001/api/jobs/reconcile";
const post = (headers: Record<string, string> = {}) => new NextRequest(URL, { method: "POST", headers });

const balanced: ReconcileResult = {
  threeWays: { byCharity: 100, byVendor: 100, byExecutive: 100, total: 100, balances: true },
  fees: { feesCollectedCents: 0, donatedCents: 0, owedCents: 0, retainedCents: 0, deferredCents: 0, balances: true },
  balances: true,
};
const driftThreeWay: ReconcileResult = {
  threeWays: { byCharity: 90, byVendor: 100, byExecutive: 100, total: 100, balances: false },
  fees: { feesCollectedCents: 0, donatedCents: 0, owedCents: 0, retainedCents: 0, deferredCents: 0, balances: true },
  balances: false,
};

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllEnvs());

describe("POST /api/jobs/reconcile (guard wiring)", () => {
  it("503 when CRON_SECRET is unset (built but inert)", async () => {
    vi.stubEnv("CRON_SECRET", "");
    expect((await POST(post())).status).toBe(503);
    expect(reconcileAll).not.toHaveBeenCalled();
  });

  it("401 on a missing or wrong bearer", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    expect((await POST(post())).status).toBe(401);
    expect((await POST(post({ authorization: "Bearer wrong" }))).status).toBe(401);
    expect(reconcileAll).not.toHaveBeenCalled();
  });

  it("200 skipped when the reconcile_job flag is off (no reconcile run)", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    vi.mocked(getFlagAuthoritative).mockResolvedValue(false);
    const res = await POST(post({ authorization: "Bearer s3cret" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ skipped: "reconcile_job_off" });
    expect(reconcileAll).not.toHaveBeenCalled();
  });

  it("503 when the admin client is unavailable", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    vi.mocked(getFlagAuthoritative).mockResolvedValue(true);
    vi.mocked(createAdminClient).mockReturnValue(null as never);
    expect((await POST(post({ authorization: "Bearer s3cret" }))).status).toBe(503);
    expect(reconcileAll).not.toHaveBeenCalled();
  });
});

describe("POST /api/jobs/reconcile (reconciliation)", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    vi.mocked(getFlagAuthoritative).mockResolvedValue(true);
    vi.mocked(createAdminClient).mockReturnValue({} as never);
  });

  it("200 balanced and does NOT alert when every invariant ties out", async () => {
    vi.mocked(reconcileAll).mockResolvedValue(balanced);
    const res = await POST(post({ authorization: "Bearer s3cret" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, balances: true, drift: [], alerted: false });
    expect(logSecurityEvent).not.toHaveBeenCalled();
  });

  it("200 and alerts (security-log) naming the drifted invariant", async () => {
    vi.mocked(reconcileAll).mockResolvedValue(driftThreeWay);
    const res = await POST(post({ authorization: "Bearer s3cret" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ ok: true, balances: false, alerted: true });
    expect(body.drift).toContain("three_way_split");
    expect(logSecurityEvent).toHaveBeenCalledTimes(1);
    expect(logSecurityEvent).toHaveBeenCalledWith(
      "reconcile_drift",
      expect.objectContaining({ drift: ["three_way_split"] }),
    );
  });
});

describe("summarizeReconciliation (pure)", () => {
  it("no drift when balanced", () => {
    expect(summarizeReconciliation(balanced).drift).toEqual([]);
  });

  it("flags the three-way split and the fee identity independently", () => {
    expect(summarizeReconciliation(driftThreeWay).drift).toEqual(["three_way_split"]);
    const feeDrift: ReconcileResult = {
      threeWays: { byCharity: 100, byVendor: 100, byExecutive: 100, total: 100, balances: true },
      fees: { feesCollectedCents: 150000, donatedCents: 0, owedCents: 0, retainedCents: 0, deferredCents: 0, balances: false },
      balances: false,
    };
    expect(summarizeReconciliation(feeDrift).drift).toEqual(["fee_master_identity"]);
  });
});
