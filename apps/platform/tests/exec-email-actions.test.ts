import { describe, it, expect } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const PASSWORD = "Passw0rd!test";
const JORDAN = "00000000-0000-0000-0000-00000000ec01"; // exec with the seeded EA (Sam EA)

async function signIn(email: string): Promise<SupabaseClient> {
  const c = createClient(URL, KEY, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) throw new Error(error.message);
  return c;
}

const anonClient = () => createClient(URL, KEY, { auth: { persistSession: false } });

/**
 * The act-instantly email action flow (exec-request-email lock 2026-06-12):
 * decline and send-to-EA execute immediately; reasons and notes are optional
 * follow-ups on the already-consumed token, never gates. Consent gating for
 * the confirmation-page footnote comes from get_request_for_token.has_consent
 * read BEFORE the action.
 */
describe("exec email action pages (lock 2026-06-12)", () => {
  it("decline acts instantly; the reason follow-up lands on the consumed token", async () => {
    const alex = await signIn("alex@alpha.test");
    const admin = await signIn("admin@thegoodintro.test");
    const anon = anonClient();

    // A fresh executive so the consent state is deterministic regardless of
    // which other test files have already actioned the seeded execs.
    const { data: exec, error: execErr } = await admin
      .from("executive")
      .insert({
        name: "Probe Decliner",
        title: "CFO",
        company: "Probe Co",
        status: "active",
        primary_email: `probe-decline-${Math.random().toString(36).slice(2)}@exec.test`,
      })
      .select("id")
      .single();
    expect(execErr).toBeNull();

    const { data: reqId } = await alex.rpc("submit_request", {
      p_executive_id: exec!.id,
      p_q1: "Decline-flow probe.",
      p_q2: "Decline-flow probe.",
      p_attendee: null,
    });
    const { data: tok } = await admin
      .from("email_action_token")
      .select("token")
      .eq("request_id", reqId)
      .single();

    try {
      // Inert pre-action read: first-ever action -> no consent record yet
      // (this is what gates the confirmation page's consent footnote).
      const { data: pre } = await anon.rpc("get_request_for_token", { p_token: tok!.token });
      expect(pre![0]).toMatchObject({ request_status: "submitted", has_consent: false });

      // The reason follow-up is rejected BEFORE the decline exists.
      const early = await anon.rpc("set_decline_reason_for_token", {
        p_token: tok!.token,
        p_reason: "No capacity",
      });
      expect(early.error?.message).toContain("request_not_declined");

      // The decline itself: one tap, no reason attached.
      const { data: acted, error: actErr } = await anon.rpc("act_on_request_token", {
        p_token: tok!.token,
        p_actor: "executive",
        p_action: "decline",
        p_decline_reason: null,
        p_ip: "",
        p_user_agent: "vitest",
        p_terms_version: "v1",
      });
      expect(actErr).toBeNull();
      expect(acted).toBe("declined");

      // The optional follow-up works on the now-consumed token (chip label).
      const followUp = await anon.rpc("set_decline_reason_for_token", {
        p_token: tok!.token,
        p_reason: "No capacity",
      });
      expect(followUp.error).toBeNull();

      const { data: reqRow } = await admin
        .from("request")
        .select("status, decline_reason")
        .eq("id", reqId)
        .single();
      expect(reqRow).toMatchObject({ status: "declined", decline_reason: "No capacity" });

      // The action wrote the consent record: a re-read now reports consent.
      const { data: post } = await anon.rpc("get_request_for_token", { p_token: tok!.token });
      expect(post![0].has_consent).toBe(true);
    } finally {
      await admin.from("request").delete().eq("id", reqId);
      await admin.from("executive").delete().eq("id", exec!.id);
    }
  });

  it("send-to-EA forwards instantly; the EA note follow-up is gated on the forward", async () => {
    const alex = await signIn("alex@alpha.test");
    const admin = await signIn("admin@thegoodintro.test");
    const anon = anonClient();

    const { data: reqId } = await alex.rpc("submit_request", {
      p_executive_id: JORDAN,
      p_q1: "EA-flow probe.",
      p_q2: "EA-flow probe.",
      p_attendee: null,
    });
    const { data: tok } = await admin
      .from("email_action_token")
      .select("token")
      .eq("request_id", reqId)
      .single();

    try {
      // The named EA renders from the inert read ("Sent to Sam EA.").
      const { data: pre } = await anon.rpc("get_request_for_token", { p_token: tok!.token });
      expect(pre![0].ea_name).toBe("Sam EA");

      // The note follow-up is rejected BEFORE any forward happened.
      const early = await anon.rpc("set_ea_note_for_token", {
        p_token: tok!.token,
        p_note: "Too early.",
      });
      expect(early.error?.message).toContain("not_forwarded");

      const { data: acted, error: actErr } = await anon.rpc("act_on_request_token", {
        p_token: tok!.token,
        p_actor: "executive",
        p_action: "send_to_ea",
        p_decline_reason: null,
        p_ip: "",
        p_user_agent: "vitest",
        p_terms_version: "v1",
      });
      expect(actErr).toBeNull();
      expect(acted).toBe("forwarded");

      const note = await anon.rpc("set_ea_note_for_token", {
        p_token: tok!.token,
        p_note: "Anything in July works; mornings preferred.",
      });
      expect(note.error).toBeNull();

      const { data: reqRow } = await admin
        .from("request")
        .select("ea_forward_note")
        .eq("id", reqId)
        .single();
      expect(reqRow?.ea_forward_note).toBe("Anything in July works; mornings preferred.");
    } finally {
      await admin.from("request").delete().eq("id", reqId);
    }
  });
});
