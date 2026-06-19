import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Route-handler WIRING tests for the email-drain cron job: status-code guards
// (503 inert / 401 bad secret / 200 skipped / 200 run) without touching the DB
// or Resend. The drain LOGIC is covered by tests/email.test.ts; here we prove
// the secret + flag + key gating the staging/prod pg_cron schedule depends on.
// All deps are mocked so this is pure + deterministic.
vi.mock("@/lib/flags", () => ({ getFlag: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn() }));
vi.mock("@/lib/email/sender", () => ({ drainEmailQueue: vi.fn() }));
vi.mock("@/lib/email/transport", () => ({ resendTransport: vi.fn(() => "transport") }));

import { POST as drainPOST } from "../app/api/jobs/email-drain/route";
import { getFlag } from "@/lib/flags";
import { createAdminClient } from "@/lib/supabase/admin";
import { drainEmailQueue } from "@/lib/email/sender";

const post = (body: string, headers: Record<string, string> = {}) =>
  new NextRequest("http://localhost:3001/api/jobs/email-drain", { method: "POST", body, headers });

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllEnvs());

describe("POST /api/jobs/email-drain (guard wiring)", () => {
  it("503 when CRON_SECRET is unset (built but inert)", async () => {
    vi.stubEnv("CRON_SECRET", "");
    const res = await drainPOST(post(""));
    expect(res.status).toBe(503);
    expect(drainEmailQueue).not.toHaveBeenCalled();
  });

  it("401 on a wrong bearer", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    const res = await drainPOST(post("", { authorization: "Bearer nope" }));
    expect(res.status).toBe(401);
    expect(drainEmailQueue).not.toHaveBeenCalled();
  });

  it("200 + skipped when email_sending is off (no drain)", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    vi.mocked(getFlag).mockResolvedValue(false);
    const res = await drainPOST(post("", { authorization: "Bearer s3cret" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ skipped: "email_sending_off" });
    expect(drainEmailQueue).not.toHaveBeenCalled();
  });

  it("200 + skipped when RESEND_API_KEY is absent (no drain)", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    vi.stubEnv("RESEND_API_KEY", "");
    vi.mocked(getFlag).mockResolvedValue(true);
    const res = await drainPOST(post("", { authorization: "Bearer s3cret" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ skipped: "resend_not_configured" });
    expect(drainEmailQueue).not.toHaveBeenCalled();
  });

  it("drains and returns the summary when flagged on + key + admin client", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.mocked(getFlag).mockResolvedValue(true);
    vi.mocked(createAdminClient).mockReturnValue({} as never);
    const summary = { picked: 2, sent: 2, failed: 0, skipped: 0 };
    vi.mocked(drainEmailQueue).mockResolvedValue(summary);
    const res = await drainPOST(post("", { authorization: "Bearer s3cret" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, summary });
    expect(drainEmailQueue).toHaveBeenCalledOnce();
  });

  it("503 when the admin client cannot be created", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.mocked(getFlag).mockResolvedValue(true);
    vi.mocked(createAdminClient).mockReturnValue(null as never);
    const res = await drainPOST(post("", { authorization: "Bearer s3cret" }));
    expect(res.status).toBe(503);
    expect(drainEmailQueue).not.toHaveBeenCalled();
  });
});
