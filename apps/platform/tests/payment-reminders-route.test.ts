import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

/**
 * The D2 payment-reminder cron route (STATE_MACHINES uncredited-payment sub-flow
 * step 3). The queue LOGIC tie-out on real data is proven in
 * payment-reminder.test.ts; here we prove the ROUTE wiring the staging cron
 * depends on — the CRON_SECRET + authoritative-flag gating and the
 * alert-on-queue branch — with the meetings lib mocked so it is pure and
 * deterministic.
 */
vi.mock("@/lib/flags", () => ({ getFlagAuthoritative: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn() }));
vi.mock("@/lib/security-log", () => ({ logSecurityEvent: vi.fn() }));
vi.mock("@/lib/meetings", () => ({ queueOverduePaymentReminders: vi.fn() }));

import { POST } from "../app/api/jobs/payment-reminders/route";
import { getFlagAuthoritative } from "@/lib/flags";
import { createAdminClient } from "@/lib/supabase/admin";
import { logSecurityEvent } from "@/lib/security-log";
import { queueOverduePaymentReminders } from "@/lib/meetings";

const URL = "http://localhost:3001/api/jobs/payment-reminders";
const post = (headers: Record<string, string> = {}) => new NextRequest(URL, { method: "POST", headers });

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllEnvs());

describe("POST /api/jobs/payment-reminders (guard wiring)", () => {
  it("503 when CRON_SECRET is unset (built but inert)", async () => {
    vi.stubEnv("CRON_SECRET", "");
    expect((await POST(post())).status).toBe(503);
    expect(queueOverduePaymentReminders).not.toHaveBeenCalled();
  });

  it("401 on a missing or wrong bearer", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    expect((await POST(post())).status).toBe(401);
    expect((await POST(post({ authorization: "Bearer wrong" }))).status).toBe(401);
    expect(queueOverduePaymentReminders).not.toHaveBeenCalled();
  });

  it("200 skipped when the payment_reminder flag is off (no run)", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    vi.mocked(getFlagAuthoritative).mockResolvedValue(false);
    const res = await POST(post({ authorization: "Bearer s3cret" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ skipped: "payment_reminder_off" });
    expect(queueOverduePaymentReminders).not.toHaveBeenCalled();
  });

  it("503 when the admin client is unavailable", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    vi.mocked(getFlagAuthoritative).mockResolvedValue(true);
    vi.mocked(createAdminClient).mockReturnValue(null as never);
    expect((await POST(post({ authorization: "Bearer s3cret" }))).status).toBe(503);
    expect(queueOverduePaymentReminders).not.toHaveBeenCalled();
  });
});

describe("POST /api/jobs/payment-reminders (run)", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    vi.mocked(getFlagAuthoritative).mockResolvedValue(true);
    vi.mocked(createAdminClient).mockReturnValue({} as never);
  });

  it("200 with the count and NO alert when nothing was due", async () => {
    vi.mocked(queueOverduePaymentReminders).mockResolvedValue({ ok: true, queued: 0 });
    const res = await POST(post({ authorization: "Bearer s3cret" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, queued: 0 });
    expect(logSecurityEvent).not.toHaveBeenCalled();
  });

  it("200 and alerts (security-log) when it queued one or more", async () => {
    vi.mocked(queueOverduePaymentReminders).mockResolvedValue({ ok: true, queued: 2 });
    const res = await POST(post({ authorization: "Bearer s3cret" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, queued: 2 });
    expect(logSecurityEvent).toHaveBeenCalledTimes(1);
    expect(logSecurityEvent).toHaveBeenCalledWith("payment_reminders_queued", { queued: 2 });
  });

  it("500 when the RPC wrapper reports an error", async () => {
    vi.mocked(queueOverduePaymentReminders).mockResolvedValue({ ok: false, error: "boom" });
    const res = await POST(post({ authorization: "Bearer s3cret" }));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, error: "boom" });
    expect(logSecurityEvent).not.toHaveBeenCalled();
  });
});
