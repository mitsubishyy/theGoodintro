import { describe, it, expect, beforeAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { drainEmailQueue } from "../lib/email/sender";
import type { EmailMessage, EmailTransport } from "../lib/email/transport";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const PASSWORD = "Passw0rd!test";
const RILEY = "00000000-0000-0000-0000-00000000ec02";
const ALPHA = "00000000-0000-0000-0000-00000000ad01";
const ALPHA_USER = "00000000-0000-0000-0000-00000000a5a1";
const TEST_INBOX = "delivered@resend.dev";

// Force deterministic test mode regardless of what .env.local says.
process.env.EMAIL_MODE = "test";
delete process.env.EMAIL_TEST_RECIPIENT;

async function signIn(email: string): Promise<SupabaseClient> {
  const c = createClient(URL, KEY, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) throw new Error(error.message);
  return c;
}

function fakeTransport(calls: EmailMessage[], fail = false): EmailTransport {
  return async (msg) => {
    calls.push(msg);
    return fail
      ? { ok: false, error: "resend 500: boom" }
      : { ok: true, providerId: `fake-${calls.length}` };
  };
}

/** Park any leftover eligible rows from other suites so counts are exact. */
async function preclear(admin: SupabaseClient) {
  await admin
    .from("notification")
    .update({ status: "sent", last_error: "test-preclear" })
    .eq("channel", "email")
    .in("status", ["queued", "failed", "sending"]);
}

describe("email queue drain (A1)", () => {
  let admin: SupabaseClient;
  let alex: SupabaseClient;

  beforeAll(async () => {
    admin = await signIn("admin@thegoodintro.test");
    alex = await signIn("alex@alpha.test");
  });

  it("sends the exec request email once, writes back sent, and a re-run does not double-send", async () => {
    await preclear(admin);
    const { data: reqId } = await alex.rpc("submit_request", {
      p_executive_id: RILEY,
      p_q1: "Budget pacing tools for finance leaders.",
      p_q2: "Your payments modernisation work is the exact phase where pacing breaks.",
      p_attendee: null,
    });
    const { data: tok } = await admin
      .from("email_action_token")
      .select("token")
      .eq("request_id", reqId)
      .single();

    const calls: EmailMessage[] = [];
    const summary = await drainEmailQueue(admin, fakeTransport(calls));
    expect(summary).toMatchObject({ sent: 1, failed: 0 });
    expect(calls.length).toBe(1);

    const msg = calls[0];
    expect(msg.to).toBe(TEST_INBOX); // test-mode guard: never the exec's real address
    expect(msg.from).toContain("onboarding@resend.dev");
    expect(msg.subject).toBe("An introduction worth your time");
    expect(msg.html).toContain(`/e/${tok!.token}?intent=accept`);
    expect(msg.html).toContain("?intent=decline");
    expect(msg.html).toContain("?intent=send_to_ea");
    expect(msg.text).toContain(`/e/${tok!.token}`);
    expect(msg.html).toContain("Budget pacing tools");
    // Alpha's seeded cycle has 1 held meeting, so the next is meeting 2: $900.
    expect(msg.html).toContain("$900");
    expect(msg.idempotencyKey).toBeTruthy();

    const { data: row } = await admin
      .from("notification")
      .select("status, attempts, provider_message_id, sent_at, sent_to")
      .eq("request_id", reqId)
      .eq("event", "B1_request_submitted")
      .single();
    expect(row).toMatchObject({
      status: "sent",
      attempts: 1,
      provider_message_id: "fake-1",
      sent_to: TEST_INBOX,
    });
    expect(row?.sent_at).toBeTruthy();

    // Idempotency: a second drain picks up nothing and sends nothing.
    const again = await drainEmailQueue(admin, fakeTransport(calls));
    expect(again).toMatchObject({ picked: 0, sent: 0 });
    expect(calls.length).toBe(1);

    // The in-app rows for the same request are not the drain's business.
    const { data: inApp } = await admin
      .from("notification")
      .select("event, status")
      .eq("request_id", reqId)
      .eq("channel", "in_app");
    expect(inApp?.every((n) => n.status === "queued")).toBe(true);

    await admin.from("request").delete().eq("id", reqId);
  });

  it("a failed send is retried by the next drain, attempts counted", async () => {
    await preclear(admin);
    const { data: reqId } = await alex.rpc("submit_request", {
      p_executive_id: RILEY,
      p_q1: "Retry path probe.",
      p_q2: "Retry path probe.",
      p_attendee: null,
    });

    const failCalls: EmailMessage[] = [];
    const s1 = await drainEmailQueue(admin, fakeTransport(failCalls, true));
    expect(s1).toMatchObject({ sent: 0, failed: 1 });

    const { data: failedRow } = await admin
      .from("notification")
      .select("status, attempts, last_error")
      .eq("request_id", reqId)
      .eq("event", "B1_request_submitted")
      .single();
    expect(failedRow).toMatchObject({ status: "failed", attempts: 1 });
    expect(failedRow?.last_error).toContain("boom");

    const okCalls: EmailMessage[] = [];
    const s2 = await drainEmailQueue(admin, fakeTransport(okCalls));
    expect(s2).toMatchObject({ sent: 1, failed: 0 });
    const { data: sentRow } = await admin
      .from("notification")
      .select("status, attempts, last_error")
      .eq("request_id", reqId)
      .eq("event", "B1_request_submitted")
      .single();
    expect(sentRow).toMatchObject({ status: "sent", attempts: 2, last_error: null });

    await admin.from("request").delete().eq("id", reqId);
  });

  it("test mode redirects every recipient to the test inbox (sign-up alert)", async () => {
    await preclear(admin);
    process.env.EMAIL_ADMIN_ALERTS = "issy@thegoodintros.com"; // looks real; must NOT be used in test mode
    const { data: inserted } = await admin
      .from("notification")
      .insert({
        recipient_type: "staff",
        recipient_id: null,
        channel: "email",
        event: "A1_vendor_signed_up",
        status: "queued",
        payload: { company: "Gamma Pty Ltd", name: "Gail Gamma", email: "gail@gamma.test" },
      })
      .select("id")
      .single();

    const calls: EmailMessage[] = [];
    const summary = await drainEmailQueue(admin, fakeTransport(calls));
    delete process.env.EMAIL_ADMIN_ALERTS;

    expect(summary).toMatchObject({ sent: 1 });
    expect(calls[0].to).toBe(TEST_INBOX);
    expect(calls[0].subject).toBe("New vendor sign-up: Gamma Pty Ltd");
    expect(calls[0].text).toContain("gail@gamma.test");

    await admin.from("notification").delete().eq("id", inserted!.id);
  });

  it("the vendor receipt composes from the payload", async () => {
    await preclear(admin);
    const { data: inserted } = await admin
      .from("notification")
      .insert({
        recipient_type: "vendor_user",
        recipient_id: ALPHA_USER,
        channel: "email",
        event: "A4_invoice_paid",
        status: "queued",
        payload: { credits: 5, amount_cents: 750000 },
      })
      .select("id")
      .single();

    const calls: EmailMessage[] = [];
    const summary = await drainEmailQueue(admin, fakeTransport(calls));
    expect(summary).toMatchObject({ sent: 1 });
    expect(calls[0].subject).toBe("Payment received, thank you");
    expect(calls[0].html).toContain("5 meeting credits");
    expect(calls[0].to).toBe(TEST_INBOX);

    await admin.from("notification").delete().eq("id", inserted!.id);
  });

  it("a request with no active token fails the row instead of sending", async () => {
    await preclear(admin);
    const { data: req } = await admin
      .from("request")
      .insert({
        vendor_id: ALPHA,
        requested_by_user_id: ALPHA_USER,
        executive_id: RILEY,
        q1_what: "x",
        q2_why: "y",
        status: "submitted",
      })
      .select("id")
      .single();
    await admin.from("notification").insert({
      recipient_type: "executive",
      recipient_id: RILEY,
      channel: "email",
      event: "B1_request_submitted",
      status: "queued",
      request_id: req!.id,
    });

    const calls: EmailMessage[] = [];
    const summary = await drainEmailQueue(admin, fakeTransport(calls));
    expect(summary).toMatchObject({ sent: 0, failed: 1 });
    expect(calls.length).toBe(0);

    const { data: row } = await admin
      .from("notification")
      .select("status, last_error")
      .eq("request_id", req!.id)
      .single();
    expect(row?.status).toBe("failed");
    expect(row?.last_error).toContain("no active action token");

    await admin.from("request").delete().eq("id", req!.id);
  });
});
