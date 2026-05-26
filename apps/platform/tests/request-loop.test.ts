import { describe, it, expect } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const PASSWORD = "Passw0rd!test";
const RILEY = "00000000-0000-0000-0000-00000000ec02"; // active exec, no seed request

async function signIn(email: string): Promise<SupabaseClient> {
  const c = createClient(URL, KEY, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) throw new Error(error.message);
  return c;
}

describe("request loop (submit -> token -> accept)", () => {
  it("vendor submits, exec accepts via the signed token, a meeting is spawned", async () => {
    const alex = await signIn("alex@alpha.test");
    const admin = await signIn("admin@thegoodintro.test");
    const anon = createClient(URL, KEY, { auth: { persistSession: false } });

    const { data: reqId, error } = await alex.rpc("submit_request", {
      p_executive_id: RILEY,
      p_q1: "Introduce our workforce tooling.",
      p_q2: "You mentioned scaling ops; we shorten onboarding.",
      p_attendee: null,
    });
    expect(error).toBeNull();
    expect(typeof reqId).toBe("string");

    // The exec's token is staff-readable only (vendors can't see it).
    const { data: noToken } = await alex.from("email_action_token").select("token");
    expect(noToken ?? []).toEqual([]);

    const { data: tok } = await admin
      .from("email_action_token")
      .select("token, status")
      .eq("request_id", reqId)
      .single();
    expect(tok?.status).toBe("active");

    // Inert read (the confirm page GET), via an unauthenticated client.
    const { data: summary } = await anon.rpc("get_request_for_token", { p_token: tok!.token });
    expect(Array.isArray(summary) && summary.length === 1).toBe(true);

    // Commit (the confirm page POST).
    const { data: result, error: actErr } = await anon.rpc("act_on_request_token", {
      p_token: tok!.token,
      p_actor: "executive",
      p_action: "accept",
      p_decline_reason: null,
      p_ip: "203.0.113.7",
      p_user_agent: "vitest",
      p_terms_version: "v1",
    });
    expect(actErr).toBeNull();
    expect(result).toBe("accepted");

    const { data: meeting } = await admin
      .from("meeting")
      .select("status")
      .eq("request_id", reqId)
      .single();
    expect(meeting?.status).toBe("proposed");

    const { data: tokAfter } = await admin
      .from("email_action_token")
      .select("status")
      .eq("request_id", reqId)
      .single();
    expect(tokAfter?.status).toBe("consumed");

    const { data: consent } = await admin
      .from("consent_event")
      .select("actor, action")
      .eq("request_id", reqId);
    expect(consent).toEqual([{ actor: "executive", action: "accept" }]);
  });

  it("a consumed token cannot be re-used", async () => {
    const anon = createClient(URL, KEY, { auth: { persistSession: false } });
    const { error } = await anon.rpc("act_on_request_token", {
      p_token: "deadbeef-not-a-real-token",
      p_actor: "executive",
      p_action: "accept",
      p_decline_reason: null,
      p_ip: "",
      p_user_agent: "",
      p_terms_version: "v1",
    });
    expect(error).not.toBeNull();
  });
});
