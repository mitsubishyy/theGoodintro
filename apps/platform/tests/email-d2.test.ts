import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { drainEmailQueue } from "../lib/email/sender";
import type { EmailMessage, EmailTransport } from "../lib/email/transport";

/**
 * D2 payment-reminder email composer (the queued-but-never-sent gap: the queue
 * RPC queues D2_payment_reminder to the vendor, but the event needs a composer +
 * a SUPPORTED_EMAIL_EVENTS entry for the drain to pick it). Proves the drain now
 * picks D2 and composes the vendor reminder with the exec name, a live
 * days-remaining count, and a Pay now link; that a re-drain does not re-send; and
 * that a D2 row with no payable meeting fails to compose rather than sending
 * garbage. Runs against the seed (Alpha vendor + Riley/ec02).
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PASSWORD = "Passw0rd!test";

const ALPHA = "00000000-0000-0000-0000-00000000ad01";
const ALPHA_USER = "00000000-0000-0000-0000-00000000a5a1";
const RILEY = "00000000-0000-0000-0000-00000000ec02";

// Deterministic test mode (mirrors email-d3.test.ts): no real external recipient.
process.env.EMAIL_MODE = "test";
delete process.env.EMAIL_TEST_RECIPIENT;

// A meeting ~5 days out, due ~5 days from now (real clock, so the composer's live
// days-left count is exercised). 35 days ahead, payment due 30 days before = 5.
const SCHEDULED_AT = new Date(Date.now() + 35 * 86_400_000).toISOString();
const DUE_AT = new Date(Date.now() + 5 * 86_400_000).toISOString();

function fakeTransport(calls: EmailMessage[], fail = false): EmailTransport {
  return async (msg) => {
    calls.push(msg);
    return fail ? { ok: false, error: "boom" } : { ok: true, providerId: `fake-${calls.length}` };
  };
}

async function signIn(email: string): Promise<SupabaseClient> {
  const c = createClient(URL, KEY, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) throw new Error(error.message);
  return c;
}

let admin: SupabaseClient;
let service: SupabaseClient;
const createdRequestIds: string[] = [];

/** Park any other suite's eligible email rows so the D2 counts are exact. */
async function preclear() {
  await admin
    .from("notification")
    .update({ status: "sent", last_error: "test-preclear" })
    .eq("channel", "email")
    .in("status", ["queued", "failed", "sending"]);
}

/** An accepted request + a confirmed overcommit meeting awaiting payment. */
async function seedOvercommit(opts: { dueAt: string | null; scheduledAt?: string | null }): Promise<string> {
  const { data: req } = await service
    .from("request")
    .insert({ vendor_id: ALPHA, requested_by_user_id: ALPHA_USER, executive_id: RILEY, q1_what: "x", q2_why: "y", status: "accepted" })
    .select("id")
    .single();
  const reqId = req!.id as string;
  createdRequestIds.push(reqId);
  await service.from("meeting").insert({
    request_id: reqId,
    status: "confirmed",
    scheduled_at: opts.scheduledAt === undefined ? SCHEDULED_AT : opts.scheduledAt,
    payment_due_at: opts.dueAt,
    credit_lot_id: null,
  });
  return reqId;
}

function d2(reqId: string) {
  return { recipient_type: "vendor_user", recipient_id: ALPHA_USER, channel: "email", event: "D2_payment_reminder", status: "queued", request_id: reqId };
}

beforeAll(async () => {
  admin = await signIn("admin@thegoodintro.test");
  service = createClient(URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
});

afterEach(async () => {
  for (const id of createdRequestIds) {
    await service.from("notification").delete().eq("request_id", id);
    await service.from("request").delete().eq("id", id);
  }
  createdRequestIds.length = 0;
});

describe("D2 payment-reminder email composer", () => {
  it("sends the vendor reminder with the exec name, days left, and a Pay now link", async () => {
    await preclear();
    const reqId = await seedOvercommit({ dueAt: DUE_AT });
    await service.from("notification").insert([d2(reqId)]);

    const calls: EmailMessage[] = [];
    const summary = await drainEmailQueue(service, fakeTransport(calls));
    expect(summary).toMatchObject({ sent: 1, failed: 0 });
    expect(calls.length).toBe(1);

    const msg = calls[0];
    expect(msg.subject).toBe("Payment reminder for your meeting with Riley Chen");
    expect(msg.text).toMatch(/will be cancelled unless payment clears by/i);
    expect(msg.text).toMatch(/\b\d+ days? away/i); // live days-remaining count
    expect(msg.text).toMatch(/Pay now:/i);
  });

  it("re-running the drain does not re-send D2 (idempotent)", async () => {
    await preclear();
    const reqId = await seedOvercommit({ dueAt: DUE_AT });
    await service.from("notification").insert([d2(reqId)]);

    const first = await drainEmailQueue(service, fakeTransport([]));
    expect(first).toMatchObject({ sent: 1 });
    const again = await drainEmailQueue(service, fakeTransport([]));
    expect(again).toMatchObject({ picked: 0, sent: 0 });
  });

  it("a D2 row whose meeting has no payment deadline fails to compose, not send", async () => {
    await preclear();
    const reqId = await seedOvercommit({ dueAt: null });
    await service.from("notification").insert([d2(reqId)]);

    const calls: EmailMessage[] = [];
    const summary = await drainEmailQueue(service, fakeTransport(calls));
    expect(summary).toMatchObject({ sent: 0, failed: 1 });
    expect(calls.length).toBe(0);
    const { data: row } = await service
      .from("notification")
      .select("status, last_error")
      .eq("request_id", reqId)
      .single();
    expect(row?.status).toBe("failed");
    expect(row?.last_error).toMatch(/no payment deadline/i);
  });
});
