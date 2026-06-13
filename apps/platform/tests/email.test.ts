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
process.env.EMAIL_SIGNATURE_PHONE = "+61 414 442 687";

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
    // Subject per the locked README's recommendation (final wording is an
    // open item for Issy at go-live).
    expect(msg.subject).toBe("Alex Alpha (Alpha Pty Ltd) has requested 45 minutes");
    expect(msg.html).toContain(`/e/${tok!.token}?intent=accept`);
    expect(msg.html).toContain("?intent=decline");
    // Riley has NO linked EA: the third action is omitted entirely (locked
    // rule: named EA or nothing, never "my EA", never a placeholder button).
    expect(msg.html).not.toContain("?intent=send_to_ea");
    expect(msg.html).not.toContain("my EA");
    expect(msg.text).toContain(`/e/${tok!.token}`);
    expect(msg.html).toContain("Budget pacing tools");
    // The locked surface (design/locked/exec-request-email, 2026-06-12):
    // italic eyebrow, locked section eyebrows, italic verification line, NO
    // badge or pill ("Verified"), no mono uppercase.
    expect(msg.html).toContain("A request for your time");
    expect(msg.html).toContain("What they want to discuss");
    expect(msg.html).toContain("Why you, specifically");
    expect(msg.html).not.toContain("Verified");
    expect(msg.html).toContain("Founder reviewed");
    expect(msg.html).not.toContain("text-transform:uppercase");
    expect(msg.html).toContain("AA"); // initials monogram for Alex Alpha
    expect(msg.html).toContain("OzHarvest"); // Riley's chosen charity
    // Accept is the solid EMERALD button (locked), not ink.
    expect(msg.html).toMatch(/background:#06623f[^>]*>Accept<\/a>/);
    // Quiet system footer per the lock; the personal founder signature is an
    // OPEN ITEM for Issy and is deliberately absent until she adopts it.
    expect(msg.html).toContain("Accepting holds nothing yet.");
    expect(msg.html).toContain("It reaches a real person.");
    expect(msg.html).toContain("TheGoodIntro · invite-only · Australia");
    expect(msg.html).not.toContain("Best,");
    expect(msg.html).not.toContain("Isobel Hardwick");
    expect(msg.html).toContain('The<span style="color:#06623f">Good</span>Intro');
    // Email-client constraints: no CSS vars, no Tailwind classes (the single
    // sanctioned class is tg-btn, the mobile full-width stacking hook), and
    // NO images of any kind in v1 (deliverability rule).
    expect(msg.html).not.toContain("var(--");
    expect(msg.html.replaceAll('class="tg-btn"', "")).not.toContain('class="');
    expect(msg.html).not.toContain("<img");
    expect(msg.attachments).toBeUndefined();
    // FACTS.md: brand casing, no em or en dashes anywhere in either part.
    expect(msg.html).toContain("TheGoodIntro");
    expect(msg.html).not.toContain("theGoodintro");
    expect(msg.html).not.toMatch(/[–—]/);
    expect(msg.text).not.toMatch(/[–—]/);
    // Money rule (lock anti-list): the gift is ALWAYS "approximately $X",
    // never a flat figure, and the band never renders. Alpha's seeded cycle
    // has 1 held meeting, so the next is meeting 2: approximately $900.
    expect(msg.html).toContain("approximately $900");
    expect(msg.text).toContain("approximately $900");
    expect(msg.html).not.toMatch(/Band|Tier/);
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

  it("an on-behalf-of attendee takes over the subject and vendor block", async () => {
    await preclear(admin);
    const { data: reqId } = await alex.rpc("submit_request", {
      p_executive_id: RILEY,
      p_q1: "Attendee path probe.",
      p_q2: "Attendee path probe.",
      p_attendee: { name: "Casey Counsel", title: "GM Finance", email: "" },
    });

    const calls: EmailMessage[] = [];
    const summary = await drainEmailQueue(admin, fakeTransport(calls));
    expect(summary).toMatchObject({ sent: 1 });
    expect(calls[0].subject).toBe("Casey Counsel (Alpha Pty Ltd) has requested 45 minutes");
    expect(calls[0].html).toContain("GM Finance · Alpha Pty Ltd");
    expect(calls[0].html).toContain("CC"); // initials monogram for Casey Counsel

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

  it("a linked EA renders the named third action; queued modules light up when data is passed", async () => {
    const { execRequestEmail } = await import("../lib/email/templates");
    const email = execRequestEmail({
      execFirstName: "Jordan",
      requesterName: "Alex Alpha",
      requesterTitle: "Head of RevOps",
      vendorCompany: "Alpha Pty Ltd",
      credibilityLine: "8 years at Workday before joining Alpha in 2024.",
      linkedinUrl: "https://linkedin.com/in/alexalpha",
      q1Head: "Budget pacing for finance leaders",
      q1: "x",
      q2Head: "Your modernisation work",
      q2: "y",
      proposedTimeLabel: "Tuesday, 9 June · 10:00 AEST",
      durationMinutes: 30,
      conferenceLabel: "Zoom",
      indicativeAmount: "$900",
      charityName: "OzHarvest",
      eaFirstName: "Lena",
      confirmUrl: "http://localhost:3001/e/t",
    });
    // Named EA, never "my EA" (locked rule).
    expect(email.html).toContain("Send to Lena (EA)");
    expect(email.html).toContain("?intent=send_to_ea");
    expect(email.html).not.toContain("my EA");
    expect(email.subject).toBe("Alex Alpha (Alpha Pty Ltd) has requested 30 minutes");
    // Modules whose source columns are queued exec-portal schema work render
    // once their data is passed: credibility, Q1/Q2 heads, proposed time,
    // LinkedIn line.
    expect(email.html).toContain("8 years at Workday");
    expect(email.html).toContain("Budget pacing for finance leaders");
    expect(email.html).toContain("Tuesday, 9 June · 10:00 AEST");
    expect(email.html).toContain("30 min · Zoom");
    expect(email.html).toContain("View Alex on LinkedIn");
    expect(email.html).toContain("approximately $900");
    // The personal founder signature stays out until Issy adopts it (open item).
    expect(email.html).not.toContain("Isobel Hardwick");
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
