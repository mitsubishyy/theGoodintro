import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { drainEmailQueue } from "../lib/email/sender";
import type { EmailMessage, EmailTransport } from "../lib/email/transport";

/**
 * C3 meeting-cancelled email composer. Proves the drain composes the right note
 * for each of the two recipient types (vendor = brand, exec = from Issy), that
 * the exec date line renders for a `confirmed` cancel (has a scheduled time) and
 * is omitted for a `proposed` cancel (no time set), that a re-drain does not
 * re-send, and that an unexpected recipient_type fails to compose rather than
 * sending garbage. Runs against the seed (Alpha vendor + Riley/ec02, no EA).
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

/** An accepted request + a cancelled meeting (confirmed carries a date; proposed does not). */
async function seedCancelled(scheduledAt: string | null): Promise<string> {
  const { data: req } = await service
    .from("request")
    .insert({ vendor_id: ALPHA, requested_by_user_id: ALPHA_USER, executive_id: RILEY, q1_what: "x", q2_why: "y", status: "accepted" })
    .select("id")
    .single();
  const reqId = req!.id as string;
  createdRequestIds.push(reqId);
  await service.from("meeting").insert({
    request_id: reqId,
    status: "cancelled",
    scheduled_at: scheduledAt,
    credit_lot_id: null,
  });
  return reqId;
}

function c3(reqId: string, recipientType: string, recipientId: string | null) {
  return { recipient_type: recipientType, recipient_id: recipientId, channel: "email", event: "C3_meeting_cancelled", status: "queued", request_id: reqId };
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

describe("C3 meeting-cancelled email composer", () => {
  it("sends the vendor + exec notes; the exec note names the date for a confirmed cancel", async () => {
    await preclear();
    const reqId = await seedCancelled("2026-09-01T03:00:00Z");
    await service.from("notification").insert([
      c3(reqId, "vendor_user", ALPHA_USER),
      c3(reqId, "executive", null),
    ]);

    const calls: EmailMessage[] = [];
    const summary = await drainEmailQueue(service, fakeTransport(calls));
    expect(summary).toMatchObject({ sent: 2, failed: 0 });

    // Vendor note (brand): reassures, no payment reason (that would be D3).
    const vendorCall = calls.find((c) => c.subject === "Your meeting with Riley Chen has been cancelled");
    expect(vendorCall).toBeTruthy();
    expect(vendorCall!.text).toMatch(/No credit has been used/i);
    expect(vendorCall!.text).not.toMatch(/payment/i);

    // Exec note (from Issy): greeted by name, names the vendor + the date.
    const execCall = calls.find((c) => c.subject === "A meeting has been cancelled");
    expect(execCall).toBeTruthy();
    expect(execCall!.text.startsWith("Hi Riley,")).toBe(true);
    expect(execCall!.text).toMatch(/the meeting with Alpha Pty Ltd on .+ has been cancelled/i);
    expect(execCall!.text.trim().endsWith("Issy")).toBe(true);
  });

  it("omits the date in the exec note for a proposed cancel (no time set)", async () => {
    await preclear();
    const reqId = await seedCancelled(null);
    await service.from("notification").insert([c3(reqId, "executive", null)]);

    const calls: EmailMessage[] = [];
    const summary = await drainEmailQueue(service, fakeTransport(calls));
    expect(summary).toMatchObject({ sent: 1, failed: 0 });
    expect(calls[0].text).toMatch(/the meeting with Alpha Pty Ltd has been cancelled/i);
    expect(calls[0].text).not.toMatch(/ on /i);
  });

  it("re-running the drain does not re-send C3 (idempotent)", async () => {
    await preclear();
    const reqId = await seedCancelled("2026-09-01T03:00:00Z");
    await service.from("notification").insert([c3(reqId, "vendor_user", ALPHA_USER)]);

    const first = await drainEmailQueue(service, fakeTransport([]));
    expect(first).toMatchObject({ sent: 1 });
    const again = await drainEmailQueue(service, fakeTransport([]));
    expect(again).toMatchObject({ picked: 0, sent: 0 });
  });

  it("an unexpected recipient_type fails to compose, not send", async () => {
    await preclear();
    const reqId = await seedCancelled("2026-09-01T03:00:00Z");
    await service.from("notification").insert([c3(reqId, "staff", null)]);

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
