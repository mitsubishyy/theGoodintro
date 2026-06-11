import { describe, it, expect } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { drainEmailQueue } from "../lib/email/sender";
import { resendTransport } from "../lib/email/transport";

/**
 * LIVE smoke test for A1: drives one real exec request email through Resend.
 * Skipped unless explicitly armed, so CI and normal runs never hit the network:
 *
 *   EMAIL_SMOKE=1 npx vitest run tests/email-smoke.test.ts
 *
 * Requires RESEND_API_KEY in apps/platform/.env.local. Honours the test-mode
 * guard: unless EMAIL_MODE=live, delivery goes to EMAIL_TEST_RECIPIENT
 * (default delivered@resend.dev, visible in the Resend dashboard under Emails).
 * Set EMAIL_TEST_RECIPIENT to the email address you signed up to Resend with
 * to receive it in your own inbox (Resend allows only that address before the
 * domain is verified).
 */

const ARMED = process.env.EMAIL_SMOKE === "1" && Boolean(process.env.RESEND_API_KEY);
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const PASSWORD = "Passw0rd!test";
const RILEY = "00000000-0000-0000-0000-00000000ec02";

async function signIn(email: string): Promise<SupabaseClient> {
  const c = createClient(URL, KEY, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) throw new Error(error.message);
  return c;
}

describe.skipIf(!ARMED)("live Resend smoke (EMAIL_SMOKE=1)", () => {
  it("delivers a queued exec request email through Resend and flips the row to sent", async () => {
    const admin = await signIn("admin@thegoodintro.test");
    const alex = await signIn("alex@alpha.test");

    // Park any other eligible rows so exactly one email goes out.
    await admin
      .from("notification")
      .update({ status: "sent", last_error: "smoke-preclear" })
      .eq("channel", "email")
      .in("status", ["queued", "failed", "sending"]);

    const { data: reqId } = await alex.rpc("submit_request", {
      p_executive_id: RILEY,
      p_q1: "A live smoke test of the exec request email.",
      p_q2: "Verifying delivery end to end before the email loop goes live.",
      p_attendee: null,
    });

    const summary = await drainEmailQueue(admin, resendTransport(process.env.RESEND_API_KEY!));
    expect(summary).toMatchObject({ sent: 1, failed: 0 });

    const { data: row } = await admin
      .from("notification")
      .select("status, provider_message_id, sent_to")
      .eq("request_id", reqId)
      .eq("event", "B1_request_submitted")
      .single();
    expect(row?.status).toBe("sent");
    expect(row?.provider_message_id).toBeTruthy();
    console.log(
      `SMOKE OK: Resend message ${row?.provider_message_id} delivered to ${row?.sent_to}. ` +
        `Check the Resend dashboard (Emails) or that inbox.`,
    );

    await admin.from("request").delete().eq("id", reqId);
  });
});
