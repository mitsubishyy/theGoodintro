import { describe, it, expect, beforeAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Email-action token hardening (slice 2c, Parts 3-4) against the LOCAL stack.
 * Proves the replay / duplicate-side-effect guarantees on the public signed-link
 * RPC act_on_request_token:
 *   - Send to EA forwards EXACTLY once however many times the link is POSTed.
 *   - Send to EA is refused once the request is no longer open.
 *   - Accept is single-use: a replay cannot create a second meeting.
 *   - The 90-day backstop expires a token; the inert read then leaks no details.
 *   - ensure_request_action_token reuses a valid link or mints a fresh one.
 *   - A single link cannot be hammered without tripping the per-token rate limit.
 */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PASSWORD = "Passw0rd!test";

const anon = () => createClient(URL, KEY, { auth: { persistSession: false } });
const rand = () => Math.random().toString(36).slice(2);

const act = (
  client: SupabaseClient,
  token: string,
  action: "accept" | "decline" | "send_to_ea",
) =>
  client.rpc("act_on_request_token", {
    p_token: token,
    p_actor: "executive",
    p_action: action,
    p_decline_reason: null,
    p_ip: "",
    p_user_agent: "vitest",
    p_terms_version: "v1",
  });

describe("email-action token hardening (2c)", () => {
  let admin: SupabaseClient; // service role: setup + inspection
  let alex: SupabaseClient; // vendor: submits requests

  beforeAll(async () => {
    if (!URL || !KEY || !SERVICE_KEY) throw new Error("Supabase env vars are not set");
    admin = createClient(URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    alex = createClient(URL, KEY, { auth: { persistSession: false } });
    const { error: signInErr } = await alex.auth.signInWithPassword({
      email: "alex@alpha.test",
      password: PASSWORD,
    });
    if (signInErr) throw new Error(`alex sign-in failed: ${signInErr.message}`);
  });

  /** A fresh active executive (with a linked EA) + a submitted request + its token. */
  async function freshRequest(): Promise<{ reqId: string; token: string; execId: string }> {
    const seed = rand();
    const { data: ea, error: eaErr } = await admin
      .from("ea")
      .insert({ name: "Forward Target EA", email: `ea-${seed}@ea.test` })
      .select("id")
      .single();
    if (eaErr) throw new Error(`ea insert failed: ${eaErr.message}`);
    const { data: exec, error: execErr } = await admin
      .from("executive")
      .insert({
        // No default_charity_id on purpose: an exec WITH a standing charity must
        // also carry an open nomination_history row (exec-portal-schema invariant),
        // and the accept path tolerates a null meeting charity (charity_id is
        // nullable). This keeps the throwaway execs from tripping that invariant.
        name: "Hardening Exec",
        title: "CFO",
        company: "Hardening Co",
        status: "active",
        primary_email: `exec-${seed}@exec.test`,
        ea_id: ea!.id,
      })
      .select("id")
      .single();
    if (execErr) throw new Error(`exec insert failed: ${execErr.message}`);
    const { data: reqId, error: reqErr } = await alex.rpc("submit_request", {
      p_executive_id: exec!.id,
      p_q1: "Hardening probe.",
      p_q2: "Hardening probe.",
      p_attendee: null,
    });
    if (reqErr) throw new Error(`submit_request failed: ${reqErr.message}`);
    const { data: tok } = await admin
      .from("email_action_token")
      .select("token")
      .eq("request_id", reqId)
      .single();
    return { reqId: reqId as string, token: tok!.token as string, execId: exec!.id };
  }

  it("send_to_ea forwards exactly once across replays, and keeps the token active", async () => {
    const { reqId, token } = await freshRequest();
    const c = anon();

    const first = await act(c, token, "send_to_ea");
    const second = await act(c, token, "send_to_ea");
    const third = await act(c, token, "send_to_ea");
    expect([first.data, second.data, third.data]).toEqual(["forwarded", "forwarded", "forwarded"]);
    expect([first.error, second.error, third.error]).toEqual([null, null, null]);

    // Exactly one EA email and one forward audit entry, no matter the replays.
    const { count: notifCount } = await admin
      .from("notification")
      .select("id", { count: "exact", head: true })
      .eq("request_id", reqId)
      .eq("event", "B_forward_to_ea");
    expect(notifCount).toBe(1);
    const { count: auditCount } = await admin
      .from("audit_entry")
      .select("id", { count: "exact", head: true })
      .eq("target_id", reqId)
      .eq("action", "request.forwarded_to_ea");
    expect(auditCount).toBe(1);

    // Marker set; token still active (forward is not terminal); request still open.
    const { data: reqRow } = await admin
      .from("request")
      .select("status, forwarded_to_ea_at")
      .eq("id", reqId)
      .single();
    expect(reqRow!.forwarded_to_ea_at).not.toBeNull();
    expect(reqRow!.status).toBe("submitted");
    const { data: tokRow } = await admin
      .from("email_action_token")
      .select("status")
      .eq("token", token)
      .single();
    expect(tokRow!.status).toBe("active");
  });

  it("send_to_ea is refused once the request is no longer open", async () => {
    const { reqId, token } = await freshRequest();
    await admin.from("request").update({ status: "closed" }).eq("id", reqId);
    const { error } = await act(anon(), token, "send_to_ea");
    expect(error?.message).toMatch(/request_not_open/);
  });

  it("accept is single-use under concurrency: one meeting, the replay is rejected", async () => {
    const { reqId, token } = await freshRequest();

    const [a, b] = await Promise.all([
      act(anon(), token, "accept"),
      act(anon(), token, "accept"),
    ]);
    const accepted = [a, b].filter((r) => r.data === "accepted");
    const failed = [a, b].filter((r) => r.error);
    expect(accepted).toHaveLength(1);
    expect(failed).toHaveLength(1);
    expect(failed[0].error?.message).toMatch(/token_not_active/);

    const { count: meetingCount } = await admin
      .from("meeting")
      .select("id", { count: "exact", head: true })
      .eq("request_id", reqId);
    expect(meetingCount).toBe(1);
  });

  it("an expired token is rejected and the inert read leaks no request details", async () => {
    const { reqId, token } = await freshRequest();
    await admin
      .from("email_action_token")
      .update({ expires_at: new Date(Date.now() - 86_400_000).toISOString() })
      .eq("token", token);

    const { data: read } = await anon().rpc("get_request_for_token", { p_token: token });
    const row = Array.isArray(read) ? read[0] : null;
    expect(row?.is_expired).toBe(true);
    expect(row?.request_id).toBeNull(); // no details exposed to a stale link
    expect(row?.q1).toBeNull();
    expect(row?.vendor_name).toBeNull();

    const { error } = await act(anon(), token, "accept");
    expect(error?.message).toMatch(/token_expired/);

    // Sanity: the request itself is untouched (still open, no meeting).
    const { data: reqRow } = await admin.from("request").select("status").eq("id", reqId).single();
    expect(reqRow!.status).toBe("submitted");
  });

  it("ensure_request_action_token reuses a valid token then mints a fresh one when expired", async () => {
    const { reqId, token } = await freshRequest();

    const { data: reused } = await admin.rpc("ensure_request_action_token", { p_request_id: reqId });
    expect(reused).toBe(token); // still valid -> reuse the same link

    await admin
      .from("email_action_token")
      .update({ expires_at: new Date(Date.now() - 86_400_000).toISOString() })
      .eq("token", token);

    const { data: minted } = await admin.rpc("ensure_request_action_token", { p_request_id: reqId });
    expect(typeof minted).toBe("string");
    expect(minted).not.toBe(token); // fresh link issued

    const { data: oldTok } = await admin
      .from("email_action_token")
      .select("status")
      .eq("token", token)
      .single();
    expect(oldTok!.status).toBe("revoked"); // the expired link is retired
    const { data: newTok } = await admin
      .from("email_action_token")
      .select("status, expires_at")
      .eq("token", minted)
      .single();
    expect(newTok!.status).toBe("active");
    expect(new Date(newTok!.expires_at as string).getTime()).toBeGreaterThan(Date.now());
  });

  it("hammering a single link trips the per-token rate limit", async () => {
    const { token } = await freshRequest();
    const c = anon();
    // 41 calls within one window guarantee at least one tripped limit regardless
    // of a wall-clock window boundary (pigeonhole: limit 20, two windows max).
    const results = [];
    for (let i = 0; i < 41; i++) results.push(await act(c, token, "send_to_ea"));
    const forwarded = results.filter((r) => r.data === "forwarded").length;
    const limited = results.filter((r) => r.error?.message?.includes("rate_limited")).length;
    expect(forwarded).toBeGreaterThan(0);
    expect(limited).toBeGreaterThan(0);
  });

  it("an authenticated vendor (and anon) cannot mint or retrieve an action token", async () => {
    // The escalation this closes: ensure_request_action_token is service-only, so
    // a vendor cannot obtain the token that authorises actions on an exec request.
    const { reqId } = await freshRequest();
    const asVendor = await alex.rpc("ensure_request_action_token", { p_request_id: reqId });
    expect(asVendor.error?.message).toMatch(/permission denied/i);
    const asAnon = await anon().rpc("ensure_request_action_token", { p_request_id: reqId });
    expect(asAnon.error?.message).toMatch(/permission denied|not find|function/i);
  });

  it("two active tokens racing accept yield ONE meeting; both tokens are consumed", async () => {
    const { reqId, token } = await freshRequest();
    // A second active token for the same request (service role bypasses the
    // app-level single-active invariant, modelling a stray/legacy duplicate).
    const token2 = `dup-${rand()}${rand()}`;
    await admin
      .from("email_action_token")
      .insert({ request_id: reqId, token: token2, status: "active" });

    const [a, b] = await Promise.all([
      act(anon(), token, "accept"),
      act(anon(), token2, "accept"),
    ]);
    const accepted = [a, b].filter((r) => r.data === "accepted");
    const failed = [a, b].filter((r) => r.error);
    expect(accepted).toHaveLength(1); // request lock serialises across DIFFERENT tokens
    expect(failed).toHaveLength(1);
    // The loser is rejected CLEANLY (token already consumed), not via a deadlock:
    // the request-first lock order must keep the two paths deadlock-free.
    expect(failed[0].error?.message).toMatch(/token_not_active|request_not_open/);
    expect(failed[0].error?.message).not.toMatch(/deadlock/i);

    const { count: meetingCount } = await admin
      .from("meeting")
      .select("id", { count: "exact", head: true })
      .eq("request_id", reqId);
    expect(meetingCount).toBe(1);

    // Consume-all on terminal: neither link survives as active.
    const { data: toks } = await admin
      .from("email_action_token")
      .select("status")
      .eq("request_id", reqId);
    expect(toks!.every((t) => t.status !== "active")).toBe(true);
    expect(toks!.filter((t) => t.status === "consumed")).toHaveLength(2);
  });

  it("a terminal decline consumes EVERY active token, so no sibling link can be replayed", async () => {
    const { reqId, token } = await freshRequest();
    const token2 = `dup-${rand()}${rand()}`;
    await admin
      .from("email_action_token")
      .insert({ request_id: reqId, token: token2, status: "active" });

    const { error } = await act(anon(), token, "decline");
    expect(error).toBeNull();

    const { data: toks } = await admin
      .from("email_action_token")
      .select("status")
      .eq("request_id", reqId);
    expect(toks!.every((t) => t.status !== "active")).toBe(true);

    // The unused sibling link is dead.
    const replay = await act(anon(), token2, "decline");
    expect(replay.error?.message).toMatch(/token_not_active|request_not_open/);
  });

  it("ensure_request_action_token refuses to issue a link for a non-open request", async () => {
    // A closed/accepted/declined request is no longer actionable, so a follow-up
    // email must not be able to self-heal a fresh action link for it.
    for (const status of ["closed", "accepted", "declined"] as const) {
      const { reqId } = await freshRequest();
      await admin.from("request").update({ status }).eq("id", reqId);
      const { data, error } = await admin.rpc("ensure_request_action_token", {
        p_request_id: reqId,
      });
      expect(data).toBeNull();
      expect(error?.message).toMatch(/request_not_open/);
    }
  });
});
