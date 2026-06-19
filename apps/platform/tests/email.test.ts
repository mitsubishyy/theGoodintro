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

  it("the forward-to-EA email is EA-framed with two actions (no send-to-ea)", async () => {
    const { forwardToEaEmail } = await import("../lib/email/templates");
    const email = forwardToEaEmail({
      eaFirstName: "Lena",
      execFirstName: "Jordan",
      requesterName: "Alex Alpha",
      requesterTitle: "Head of RevOps",
      vendorCompany: "Alpha Pty Ltd",
      q1: "x",
      q2: "y",
      durationMinutes: 30,
      indicativeAmount: "$900",
      charityName: "OzHarvest",
      confirmUrl: "http://localhost:3001/e/t",
    });
    expect(email.subject).toBe("Alex Alpha (Alpha Pty Ltd) has requested 30 minutes with Jordan");
    expect(email.html).toContain("Hi Lena,"); // the EA, not the exec
    expect(email.html).toContain("acting for Jordan");
    expect(email.html).toContain("?intent=accept");
    expect(email.html).toContain("?intent=decline");
    // The EA IS the forward target, so there is no "Send to EA" action.
    expect(email.html).not.toContain("?intent=send_to_ea");
    expect(email.html).toContain("AA"); // requester initials monogram
    expect(email.html).toContain("approximately $900");
    expect(email.html).toContain("OzHarvest");
    expect(email.html).toMatch(/background:#06623f[^>]*>Accept<\/a>/); // emerald Accept
    // Same email-client + brand constraints as B1.
    expect(email.html).not.toContain("var(--");
    expect(email.html).not.toContain("<img");
    expect(email.html).toContain("TheGoodIntro");
    expect(email.html).not.toContain("theGoodintro");
    expect(email.html).not.toMatch(/[–—]/);
    expect(email.text).not.toMatch(/[–—]/);
    expect(email.fromKind).toBe("personal");
  });

  it("drains a queued B_forward_to_ea to the linked EA, acting for the exec", async () => {
    await preclear(admin);
    const SAM_EA = "00000000-0000-0000-0000-0000000000ea"; // seeded EA (Sam EA)
    const { data: reqId } = await alex.rpc("submit_request", {
      p_executive_id: RILEY,
      p_q1: "EA forward path probe.",
      p_q2: "EA forward path probe.",
      p_attendee: null,
    });
    const { data: tok } = await admin
      .from("email_action_token")
      .select("token")
      .eq("request_id", reqId)
      .single();
    await preclear(admin); // park the B1 row submit_request queued
    const { data: fwd } = await admin
      .from("notification")
      .insert({
        recipient_type: "ea",
        recipient_id: SAM_EA,
        channel: "email",
        event: "B_forward_to_ea",
        status: "queued",
        request_id: reqId,
      })
      .select("id")
      .single();

    const calls: EmailMessage[] = [];
    const summary = await drainEmailQueue(admin, fakeTransport(calls));
    expect(summary).toMatchObject({ sent: 1, failed: 0 });
    expect(calls.length).toBe(1);

    const msg = calls[0];
    expect(msg.to).toBe(TEST_INBOX); // test-mode guard: never the EA's real address
    expect(msg.subject).toBe("Alex Alpha (Alpha Pty Ltd) has requested 45 minutes with Riley");
    expect(msg.html).toContain("Hi Sam,"); // the seeded EA's first name
    expect(msg.html).toContain("acting for Riley");
    expect(msg.html).toContain(`/e/${tok!.token}?intent=accept`);
    expect(msg.html).toContain("?intent=decline");
    expect(msg.html).not.toContain("?intent=send_to_ea");
    expect(msg.html).toContain("OzHarvest"); // Riley's standing charity
    expect(msg.html).toContain("approximately $900");
    expect(msg.html).not.toMatch(/[–—]/);

    const { data: row } = await admin
      .from("notification")
      .select("status, sent_to")
      .eq("id", fwd!.id)
      .single();
    expect(row).toMatchObject({ status: "sent", sent_to: TEST_INBOX });

    await admin.from("notification").delete().eq("id", fwd!.id);
    await admin.from("request").delete().eq("id", reqId);
  });

  it("C1 exec-accepted (vendor, brand): the securing-a-time copy", async () => {
    const { execAcceptedVendorEmail } = await import("../lib/email/templates");
    const e = execAcceptedVendorEmail({ execName: "Riley Chen" });
    expect(e.subject).toBe("Riley Chen accepted.");
    expect(e.html).toContain("Good news, <strong>Riley Chen</strong> has accepted.");
    expect(e.html).toContain("securing a time");
    expect(e.fromKind).toBe("brand");
    expect(e.html).toContain('The<span style="color:#06623f">Good</span>Intro');
    expect(e.html).not.toContain("var(--");
    expect(e.html).not.toContain("<img");
    expect(e.html).not.toContain("theGoodintro");
    expect(e.html).not.toMatch(/[–—]/);
    expect(e.text).not.toMatch(/[–—]/);
  });

  it("C2 time-confirmed (vendor, brand): datetime, join button only when present", async () => {
    const { timeConfirmedVendorEmail } = await import("../lib/email/templates");
    const withJoin = timeConfirmedVendorEmail({
      execName: "Riley Chen",
      meetingDatetimeLabel: "Wednesday, 24 June 2026 at 11:30 am AEST",
      joinUrl: "https://zoom.us/j/123",
    });
    expect(withJoin.subject).toBe("You are confirmed with Riley Chen");
    expect(withJoin.html).toContain("24 June 2026");
    expect(withJoin.html).toContain("Join the meeting");
    expect(withJoin.html).toContain("https://zoom.us/j/123");
    expect(withJoin.fromKind).toBe("brand");
    expect(withJoin.html).not.toMatch(/[–—]/);
    const noJoin = timeConfirmedVendorEmail({ execName: "Riley Chen", meetingDatetimeLabel: "soon", joinUrl: null });
    expect(noJoin.html).not.toContain("Join the meeting");
    expect(noJoin.html).toContain("on the way");
  });

  it("C6 meeting-completed (exec, from Issy): the EXACT gift, never approximately", async () => {
    const { meetingCompletedExecEmail } = await import("../lib/email/templates");
    const e = meetingCompletedExecEmail({
      execFirstName: "Riley",
      vendorName: "Alpha Pty Ltd",
      charityAmount: "$900",
      charityName: "OzHarvest",
    });
    expect(e.subject).toBe("Thank you for meeting Alpha Pty Ltd");
    expect(e.html).toContain("Hi Riley,");
    expect(e.html).toContain("<strong>$900</strong>");
    expect(e.html).toContain("OzHarvest");
    expect(e.html).not.toContain("approximately"); // post-Held: the frozen figure, not the indicative one
    expect(e.html).toContain("Issy");
    expect(e.fromKind).toBe("personal");
    expect(e.text).not.toMatch(/[–—]/);
  });

  it("drains C1_exec_accepted to the requesting vendor", async () => {
    await preclear(admin);
    const { data: reqId } = await alex.rpc("submit_request", {
      p_executive_id: RILEY,
      p_q1: "C1 path probe.",
      p_q2: "C1 path probe.",
      p_attendee: null,
    });
    await preclear(admin); // park the B1 row submit_request queued
    const { data: n } = await admin
      .from("notification")
      .insert({
        recipient_type: "vendor_user",
        recipient_id: ALPHA_USER,
        channel: "email",
        event: "C1_exec_accepted",
        status: "queued",
        request_id: reqId,
      })
      .select("id")
      .single();

    const calls: EmailMessage[] = [];
    const summary = await drainEmailQueue(admin, fakeTransport(calls));
    expect(summary).toMatchObject({ sent: 1, failed: 0 });
    expect(calls[0].to).toBe(TEST_INBOX);
    expect(calls[0].subject).toBe("Riley Chen accepted."); // RILEY = Riley Chen
    expect(calls[0].html).toContain("Riley Chen");

    await admin.from("notification").delete().eq("id", n!.id);
    await admin.from("request").delete().eq("id", reqId);
  });

  it("drains C2_time_confirmed with the seeded confirmed meeting time", async () => {
    await preclear(admin);
    const REQ_CONFIRMED = "00000000-0000-0000-0000-0000000004a4"; // seeded confirmed meeting
    const { data: r } = await admin.from("request").select("executive_id").eq("id", REQ_CONFIRMED).single();
    const { data: ex } = await admin.from("executive").select("name").eq("id", r!.executive_id).single();
    const { data: n } = await admin
      .from("notification")
      .insert({
        recipient_type: "vendor_user",
        recipient_id: null, // confirmMeeting queues C2 with request_id only
        channel: "email",
        event: "C2_time_confirmed",
        status: "queued",
        request_id: REQ_CONFIRMED,
      })
      .select("id")
      .single();

    const calls: EmailMessage[] = [];
    const summary = await drainEmailQueue(admin, fakeTransport(calls));
    expect(summary).toMatchObject({ sent: 1, failed: 0 });
    expect(calls[0].to).toBe(TEST_INBOX);
    expect(calls[0].subject).toBe(`You are confirmed with ${ex!.name}`);
    expect(calls[0].html).toContain("24 June 2026"); // scheduled_at 2026-06-24, Sydney
    expect(calls[0].html).not.toMatch(/[–—]/);

    await admin.from("notification").delete().eq("id", n!.id); // seeded request left intact
  });

  it("drains C6_meeting_completed to the exec with the EXACT frozen gift", async () => {
    await preclear(admin);
    const REQ_HELD = "00000000-0000-0000-0000-0000000004a1"; // seeded held meeting + gift ($900)
    const { data: n } = await admin
      .from("notification")
      .insert({
        recipient_type: "executive",
        recipient_id: null, // markHeld queues C6 with request_id only
        channel: "email",
        event: "C6_meeting_completed",
        status: "queued",
        request_id: REQ_HELD,
      })
      .select("id")
      .single();

    const calls: EmailMessage[] = [];
    const summary = await drainEmailQueue(admin, fakeTransport(calls));
    expect(summary).toMatchObject({ sent: 1, failed: 0 });
    expect(calls[0].to).toBe(TEST_INBOX);
    expect(calls[0].html).toContain("$900"); // seeded gift charity_amount_cents 90000, exact
    expect(calls[0].html).toContain("is on its way to");
    expect(calls[0].html).not.toContain("approximately");
    expect(calls[0].html).toContain("Issy");

    await admin.from("notification").delete().eq("id", n!.id); // seeded request left intact
  });
});
