import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { drainEmailQueue } from "../lib/email/sender";
import type { EmailMessage, EmailTransport } from "../lib/email/transport";

/**
 * E1 reversal/rebook email composer. Proves the drain composes the vendor note
 * (brand, "returned your credit") and the exec note (from Issy, "let's find a new
 * time") for the shared E1_reversal_rebook event, that the in_app vendor row is
 * NOT drained (channel filter), that a re-drain does not re-send, and that an
 * unexpected recipient_type fails to compose. The staff E1_reversal_admin task is
 * a separate in_app event and is never drained. Runs against the seed (Alpha
 * vendor + Riley/ec02).
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PASSWORD = "Passw0rd!test";

const ALPHA = "00000000-0000-0000-0000-00000000ad01";
const ALPHA_USER = "00000000-0000-0000-0000-00000000a5a1";
const RILEY = "00000000-0000-0000-0000-00000000ec02";

process.env.EMAIL_MODE = "test";
delete process.env.EMAIL_TEST_RECIPIENT;

function fakeTransport(calls: EmailMessage[]): EmailTransport {
  return async (msg) => {
    calls.push(msg);
    return { ok: true, providerId: `fake-${calls.length}` };
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

async function preclear() {
  await admin
    .from("notification")
    .update({ status: "sent", last_error: "test-preclear" })
    .eq("channel", "email")
    .in("status", ["queued", "failed", "sending"]);
}

async function seedRequest(): Promise<string> {
  const { data: req } = await service
    .from("request")
    .insert({ vendor_id: ALPHA, requested_by_user_id: ALPHA_USER, executive_id: RILEY, q1_what: "x", q2_why: "y", status: "accepted" })
    .select("id")
    .single();
  const reqId = req!.id as string;
  createdRequestIds.push(reqId);
  return reqId;
}

function e1(reqId: string, recipientType: string, recipientId: string | null, channel = "email") {
  return { recipient_type: recipientType, recipient_id: recipientId, channel, event: "E1_reversal_rebook", status: "queued", request_id: reqId };
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

describe("E1 reversal/rebook email composer", () => {
  it("sends the vendor + exec notes; the in-app vendor row is not drained", async () => {
    await preclear();
    const reqId = await seedRequest();
    await service.from("notification").insert([
      e1(reqId, "vendor_user", ALPHA_USER, "email"),
      e1(reqId, "vendor_user", ALPHA_USER, "in_app"),
      e1(reqId, "executive", null, "email"),
    ]);

    const calls: EmailMessage[] = [];
    const summary = await drainEmailQueue(service, fakeTransport(calls));
    expect(summary).toMatchObject({ sent: 2, failed: 0 });
    expect(calls.length).toBe(2);

    // Vendor note (brand): credit returned, no gift figure.
    const vendorCall = calls.find((c) => c.subject === "We are arranging a new time with Riley Chen");
    expect(vendorCall).toBeTruthy();
    expect(vendorCall!.text).toMatch(/returned your credit and are arranging a new time with Riley Chen/i);
    expect(vendorCall!.text).toMatch(/did not go ahead/i);

    // Exec note (from Issy): greeted by name, names the vendor.
    const execCall = calls.find((c) => c.subject === "Let's find a new time");
    expect(execCall).toBeTruthy();
    expect(execCall!.text.startsWith("Hi Riley,")).toBe(true);
    expect(execCall!.text).toMatch(/let's find a new time for your meeting with Alpha Pty Ltd/i);
    expect(execCall!.text.trim().endsWith("Issy")).toBe(true);

    // The in-app row stays queued (forward-compatible, no email).
    const { data: inApp } = await service
      .from("notification")
      .select("status")
      .eq("request_id", reqId)
      .eq("channel", "in_app")
      .single();
    expect(inApp?.status).toBe("queued");
  });

  it("re-running the drain does not re-send E1 (idempotent)", async () => {
    await preclear();
    const reqId = await seedRequest();
    await service.from("notification").insert([e1(reqId, "vendor_user", ALPHA_USER, "email")]);

    const first = await drainEmailQueue(service, fakeTransport([]));
    expect(first).toMatchObject({ sent: 1 });
    const again = await drainEmailQueue(service, fakeTransport([]));
    expect(again).toMatchObject({ picked: 0, sent: 0 });
  });

  it("an unexpected recipient_type fails to compose, not send", async () => {
    await preclear();
    const reqId = await seedRequest();
    await service.from("notification").insert([e1(reqId, "ea", null, "email")]);

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
    expect(row?.last_error).toMatch(/recipient_type/i);
  });
});
