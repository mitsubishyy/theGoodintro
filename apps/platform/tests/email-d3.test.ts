import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { drainEmailQueue } from "../lib/email/sender";
import type { EmailMessage, EmailTransport } from "../lib/email/transport";

/**
 * D3 auto-cancel email composer (the queued-but-never-sent gap: the auto-cancel
 * RPC queues D3_unpaid_cancelled to the vendor + executive + EA, but until now
 * the event was absent from SUPPORTED_EMAIL_EVENTS and had no composer, so the
 * drain never picked it). Proves the drain now picks D3 and composes the right
 * note for each of the three recipient types, and that a malformed D3 row fails
 * to compose rather than sending garbage. Runs against the seed (Alpha vendor +
 * Jordan/ec01 who has a linked EA).
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PASSWORD = "Passw0rd!test";

const ALPHA = "00000000-0000-0000-0000-00000000ad01";
const ALPHA_USER = "00000000-0000-0000-0000-00000000a5a1";
const JORDAN = "00000000-0000-0000-0000-00000000ec01"; // exec WITH a linked EA
const SAM_EA = "00000000-0000-0000-0000-0000000000ea";

// Deterministic test mode (mirrors email.test.ts): no real external recipient.
process.env.EMAIL_MODE = "test";
delete process.env.EMAIL_TEST_RECIPIENT;

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

/** Park any other suite's eligible email rows so the D3 counts are exact. */
async function preclear() {
  await admin
    .from("notification")
    .update({ status: "sent", last_error: "test-preclear" })
    .eq("channel", "email")
    .in("status", ["queued", "failed", "sending"]);
}

/** An accepted request + a cancelled overcommit meeting (the auto-cancel result). */
async function seedCancelled(execId: string): Promise<string> {
  const { data: req } = await service
    .from("request")
    .insert({ vendor_id: ALPHA, requested_by_user_id: ALPHA_USER, executive_id: execId, q1_what: "x", q2_why: "y", status: "accepted" })
    .select("id")
    .single();
  const reqId = req!.id as string;
  createdRequestIds.push(reqId);
  await service.from("meeting").insert({
    request_id: reqId,
    status: "cancelled",
    scheduled_at: "2099-03-01T03:00:00Z",
    payment_due_at: "2099-01-30T00:00:00Z",
    credit_lot_id: null,
  });
  return reqId;
}

function d3(reqId: string, recipientType: string, recipientId: string | null) {
  return { recipient_type: recipientType, recipient_id: recipientId, channel: "email", event: "D3_unpaid_cancelled", status: "queued", request_id: reqId };
}

beforeAll(async () => {
  admin = await signIn("admin@thegoodintro.test");
  service = createClient(URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
});

afterEach(async () => {
  // Notifications reference the request; clear them, then the request (cascades the meeting).
  for (const id of createdRequestIds) {
    await service.from("notification").delete().eq("request_id", id);
    await service.from("request").delete().eq("id", id);
  }
  createdRequestIds.length = 0;
});

describe("D3 auto-cancel email composer", () => {
  it("sends the vendor + executive + EA notes, each with the right copy", async () => {
    await preclear();
    const reqId = await seedCancelled(JORDAN);
    await service.from("notification").insert([
      d3(reqId, "vendor_user", ALPHA_USER),
      d3(reqId, "executive", null),
      d3(reqId, "ea", SAM_EA),
    ]);

    const calls: EmailMessage[] = [];
    const summary = await drainEmailQueue(service, fakeTransport(calls));
    expect(summary).toMatchObject({ sent: 3, failed: 0 });
    expect(calls.length).toBe(3);

    // Vendor note: brand subject names the exec; reassures (no credit used).
    const vendorCall = calls.find((c) => c.subject === "Your meeting with Jordan Smith was cancelled");
    expect(vendorCall).toBeTruthy();
    expect(vendorCall!.text).toMatch(/no credit was used/i);

    // Exec + EA notes share the "A meeting has been cancelled" subject, but the
    // exec is greeted by their name and the EA by theirs.
    const cancelNotes = calls.filter((c) => c.subject === "A meeting has been cancelled");
    expect(cancelNotes.length).toBe(2);
    expect(cancelNotes.some((c) => c.text.startsWith("Hi Jordan,"))).toBe(true); // executive
    expect(cancelNotes.some((c) => c.text.startsWith("Hi Sam,"))).toBe(true); // EA
    // Both reference the cancelled meeting date.
    for (const c of cancelNotes) expect(c.text).toMatch(/will no longer go ahead/i);
  });

  it("re-running the drain does not re-send D3 (idempotent)", async () => {
    await preclear();
    const reqId = await seedCancelled(JORDAN);
    await service.from("notification").insert([d3(reqId, "vendor_user", ALPHA_USER)]);

    const first = await drainEmailQueue(service, fakeTransport([]));
    expect(first).toMatchObject({ sent: 1 });
    const again = await drainEmailQueue(service, fakeTransport([]));
    expect(again).toMatchObject({ picked: 0, sent: 0 });
  });

  it("a malformed D3 row (EA recipient with no ea id) fails to compose, not send", async () => {
    await preclear();
    const reqId = await seedCancelled(JORDAN);
    await service.from("notification").insert([d3(reqId, "ea", null)]);

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
    expect(row?.last_error).toMatch(/no recipient ea/i);
  });
});
