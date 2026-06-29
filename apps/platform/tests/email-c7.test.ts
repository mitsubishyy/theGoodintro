import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { drainEmailQueue } from "../lib/email/sender";
import type { EmailMessage, EmailTransport } from "../lib/email/transport";

/**
 * C7 gift-paid email composer (the queued-but-never-sent gap: marking a gift paid
 * queues C7_gift_confirmed to the exec (email) + vendor (in-app), but the event
 * needs a composer + a SUPPORTED_EMAIL_EVENTS entry for the drain to pick the
 * exec email). Proves the drain composes the exec confirmation from the payload
 * snapshot (exact frozen amount + charity name), that the in-app vendor row is
 * NOT drained (channel filter), that a re-drain does not re-send, and that a row
 * with no amount/charity payload fails to compose rather than sending garbage.
 * Runs against the seed (Riley/ec02).
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

/** Park any other suite's eligible email rows so the C7 counts are exact. */
async function preclear() {
  await admin
    .from("notification")
    .update({ status: "sent", last_error: "test-preclear" })
    .eq("channel", "email")
    .in("status", ["queued", "failed", "sending"]);
}

/** An accepted request (no meeting needed — C7 reads exec from the request). */
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

function c7(reqId: string, recipientType: string, channel: string, payload: Record<string, unknown>) {
  return { recipient_type: recipientType, recipient_id: null, channel, event: "C7_gift_confirmed", status: "queued", request_id: reqId, payload };
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

describe("C7 gift-paid email composer", () => {
  it("composes the exec confirmation from the payload; does not drain the in-app vendor row", async () => {
    await preclear();
    const reqId = await seedRequest();
    await service.from("notification").insert([
      c7(reqId, "executive", "email", { charity_amount_cents: 90000, charity_name: "Beyond Blue" }),
      c7(reqId, "vendor_user", "in_app", { charity_amount_cents: 90000, charity_name: "Beyond Blue" }),
    ]);

    const calls: EmailMessage[] = [];
    const summary = await drainEmailQueue(service, fakeTransport(calls));
    // Only the email row is drained; the in_app row is left untouched.
    expect(summary).toMatchObject({ sent: 1, failed: 0 });
    expect(calls.length).toBe(1);

    const msg = calls[0];
    expect(msg.subject).toBe("Confirmed: your gift has reached Beyond Blue");
    expect(msg.text).toMatch(/confirmed: \$900 has reached Beyond Blue/i);
    expect(msg.text).toMatch(/Thank you for making it happen/i);
    expect(msg.text.trim().endsWith("Issy")).toBe(true);

    // The in-app vendor row is still queued (forward-compatible, no email).
    const { data: inApp } = await service
      .from("notification")
      .select("status")
      .eq("request_id", reqId)
      .eq("channel", "in_app")
      .single();
    expect(inApp?.status).toBe("queued");
  });

  it("re-running the drain does not re-send C7 (idempotent)", async () => {
    await preclear();
    const reqId = await seedRequest();
    await service.from("notification").insert([
      c7(reqId, "executive", "email", { charity_amount_cents: 120000, charity_name: "OzHarvest" }),
    ]);

    const first = await drainEmailQueue(service, fakeTransport([]));
    expect(first).toMatchObject({ sent: 1 });
    const again = await drainEmailQueue(service, fakeTransport([]));
    expect(again).toMatchObject({ picked: 0, sent: 0 });
  });

  it("a C7 row with no amount/charity payload fails to compose, not send", async () => {
    await preclear();
    const reqId = await seedRequest();
    await service.from("notification").insert([c7(reqId, "executive", "email", {})]);

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
    expect(row?.last_error).toMatch(/charity amount/i);
  });
});
