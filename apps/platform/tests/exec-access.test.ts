import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import {
  resolveExecOrEaByEmail,
  resolveStaffSignInTarget,
  requestExecEaSignInLink,
  linkAuthUserToExecOrEa,
} from "@/lib/exec-access";
import { getFlagAuthoritative } from "@/lib/flags";
import { GET as signInGET } from "@/app/auth/sign-in/route";

/**
 * Exec / EA passwordless access + controlled charity change (slice 2d), against
 * the LOCAL Supabase stack. The acceptance properties:
 *   1. account safety — the self-service link request is identical for a member
 *      and an unknown email (no enumeration);
 *   2. the OTP -> session -> auth_user_id linking path works, and the linked
 *      exec/EA then reads ONLY their own scope (0029 RLS);
 *   3. the sign-in-link route binds the principal and lands in /exec; an invalid
 *      link and an authenticated non-member are bounced identically;
 *   4. request_standing_nomination — the owning exec/EA can change their charity,
 *      a non-owner is refused, staff can; the one-open-per-exec invariant holds;
 *   5. the gate's resolution logic: an exec resolves to itself, an EA to its
 *      assigned principal, a vendor to nothing.
 *
 * Throwaway execs/EAs are created WITHOUT a default_charity_id so they never trip
 * the seed's one-open-per-exec invariant.
 */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PW = "Exec-Passw0rd!1"; // throwaway users created here
const SEED_PW = "Passw0rd!test"; // seeded staff/vendor accounts
const rand = () => Math.random().toString(36).slice(2);
const anon = () => createClient(URL, KEY, { auth: { persistSession: false } });

describe("exec/EA passwordless access + controlled charity change (2d)", () => {
  let admin: SupabaseClient;
  const ids = { e1: "", e2: "", ea: "", ea2: "", charA: "", charB: "", e1email: "", eaEmail: "" };
  const cleanupUsers: string[] = [];
  const cleanupExecs: string[] = [];
  const cleanupEas: string[] = [];

  async function mkUser(email: string): Promise<string> {
    const { data, error } = await admin.auth.admin.createUser({ email, password: PW, email_confirm: true });
    if (error) throw new Error(`createUser ${email}: ${error.message}`);
    cleanupUsers.push(data.user!.id);
    return data.user!.id;
  }

  async function signedIn(email: string, password = PW): Promise<SupabaseClient> {
    const c = createClient(URL, KEY, { auth: { persistSession: false } });
    const { error } = await c.auth.signInWithPassword({ email, password });
    if (error) throw new Error(`signIn ${email}: ${error.message}`);
    return c;
  }

  /** A linked, signed-in executive: record + auth user + auth_user_id set. */
  async function linkedExec(): Promise<{ execId: string; email: string; client: SupabaseClient }> {
    const email = `e-${rand()}@exec.test`;
    const execId = await mkExec(email);
    const uid = await mkUser(email);
    await admin.from("executive").update({ auth_user_id: uid }).eq("id", execId);
    return { execId, email, client: await signedIn(email) };
  }

  async function mkExec(email: string): Promise<string> {
    // No default_charity_id (one-open invariant) -> nomination_history starts empty.
    const { data, error } = await admin
      .from("executive")
      .insert({ name: "Scoped Exec", title: "CFO", company: "Scope Co", status: "active", primary_email: email })
      .select("id")
      .single();
    if (error) throw new Error(`mkExec: ${error.message}`);
    cleanupExecs.push(data!.id as string);
    return data!.id as string;
  }

  async function mkEa(email: string): Promise<string> {
    const { data, error } = await admin.from("ea").insert({ name: "Scoped EA", email }).select("id").single();
    if (error) throw new Error(`mkEa: ${error.message}`);
    cleanupEas.push(data!.id as string);
    return data!.id as string;
  }

  async function openNomCount(execId: string): Promise<number> {
    const { data } = await admin.from("nomination_history").select("id").eq("executive_id", execId).is("ended_at", null);
    return (data ?? []).length;
  }

  /** Toggle the exec_ea_login kill switch (read authoritatively by the gates). */
  async function setExecEaLogin(enabled: boolean): Promise<void> {
    await admin.from("feature_flag").update({ enabled }).eq("key", "exec_ea_login");
  }

  beforeAll(async () => {
    if (!URL || !KEY || !SERVICE_KEY) throw new Error("Supabase env vars are not set");
    admin = createClient(URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

    const { data: chs } = await admin
      .from("charity")
      .select("id")
      .eq("dgr_status", "endorsed")
      .is("deleted_at", null)
      .limit(2);
    if (!chs || chs.length < 2) throw new Error("need two endorsed charities in the seed");
    ids.charA = chs[0].id as string;
    ids.charB = chs[1].id as string;

    ids.e1email = `acc-e1-${rand()}@exec.test`;
    ids.eaEmail = `acc-ea-${rand()}@ea.test`;
    ids.e1 = await mkExec(ids.e1email);
    ids.e2 = await mkExec(`acc-e2-${rand()}@exec.test`);
    ids.ea = await mkEa(ids.eaEmail);
    ids.ea2 = await mkEa(`acc-ea2-${rand()}@ea.test`);
    await admin.from("ea_assignment").insert({ ea_id: ids.ea, executive_id: ids.e1 });
    await admin.from("ea_assignment").insert({ ea_id: ids.ea2, executive_id: ids.e2 });

    // The exec/EA sign-in + RPC paths are gated behind exec_ea_login; enable it for
    // the suite (seeded OFF). Flag-OFF behaviour is covered by dedicated tests that
    // toggle it and restore ON; afterAll restores the seed default (OFF).
    await setExecEaLogin(true);
  });

  afterAll(async () => {
    if (!admin) return;
    await setExecEaLogin(false);
    // An exec that has been the subject of an audited charity change cannot be
    // hard-deleted: audit_entry is append-only (delete is blocked) and
    // acting_for_executive_id FK-restricts the row. So FIRST neutralize every
    // throwaway exec for the seed invariants — clear default_charity_id (the
    // "one open row per exec WITH a default charity" check) and soft-delete —
    // then best-effort hard-delete per id so the FK-pinned ones simply remain
    // harmless (a `db reset` reclaims them on the next run).
    if (cleanupExecs.length) {
      await admin.from("executive").update({ default_charity_id: null, deleted_at: new Date().toISOString() }).in("id", cleanupExecs);
      await admin.from("nomination_history").delete().in("executive_id", cleanupExecs);
    }
    if (cleanupEas.length) {
      await admin.from("ea_assignment").delete().in("ea_id", cleanupEas);
      await admin.from("ea").delete().in("id", cleanupEas);
    }
    for (const id of cleanupExecs) await admin.from("executive").delete().eq("id", id);
    for (const u of cleanupUsers) await admin.auth.admin.deleteUser(u);
  });

  // ── 1. Account safety ──────────────────────────────────────────────────────
  it("the self-service link request is identical for a member and an unknown email", async () => {
    const known = await requestExecEaSignInLink(admin, ids.e1email);
    const unknown = await requestExecEaSignInLink(admin, `nobody-${rand()}@nowhere.test`);
    expect(known).toBeUndefined();
    expect(unknown).toBeUndefined();
    expect(known).toEqual(unknown);
  });

  it("resolveExecOrEaByEmail finds a seeded exec and EA (case-insensitively), nothing for an unknown email", async () => {
    expect(await resolveExecOrEaByEmail(admin, ids.e1email)).toMatchObject({ kind: "executive", id: ids.e1 });
    expect(await resolveExecOrEaByEmail(admin, ids.eaEmail)).toMatchObject({ kind: "ea", id: ids.ea });
    expect(await resolveExecOrEaByEmail(admin, ids.e1email.toUpperCase())).toMatchObject({ kind: "executive", id: ids.e1 });
    expect(await resolveExecOrEaByEmail(admin, `ghost-${rand()}@nowhere.test`)).toBeNull();
  });

  // ── 2. OTP -> session -> auth_user_id linking + scoped read ─────────────────
  it("links an auth user to its executive on first sign-in, idempotently and takeover-safe", async () => {
    const email = `link-e-${rand()}@exec.test`;
    const execId = await mkExec(email);
    const uid = await mkUser(email);

    const linked = await linkAuthUserToExecOrEa(admin, uid, email);
    expect(linked).toMatchObject({ kind: "executive", id: execId });
    const { data: row } = await admin.from("executive").select("auth_user_id").eq("id", execId).single();
    expect(row?.auth_user_id).toBe(uid);

    // Idempotent: a second call returns the already-linked record, no error.
    expect(await linkAuthUserToExecOrEa(admin, uid, email)).toMatchObject({ kind: "executive", id: execId });

    // Takeover-safe: a DIFFERENT auth user with the same email cannot claim it.
    const otherUid = await mkUser(`other-${rand()}@exec.test`);
    expect(await linkAuthUserToExecOrEa(admin, otherUid, email)).toBeNull();
    const { data: row2 } = await admin.from("executive").select("auth_user_id").eq("id", execId).single();
    expect(row2?.auth_user_id).toBe(uid); // unchanged
  });

  it("OTP verify establishes a session, linking then scopes the exec to ONLY their own row", async () => {
    const email = `otp-e-${rand()}@exec.test`;
    const execId = await mkExec(email);
    await mkUser(email);

    const { data: link, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
    expect(error).toBeNull();
    const tokenHash = link!.properties!.hashed_token;

    const session = anon();
    const { error: vErr } = await session.auth.verifyOtp({ type: "magiclink", token_hash: tokenHash });
    expect(vErr).toBeNull();
    const { data: { user } } = await session.auth.getUser();
    expect(user?.email).toBe(email);

    const linked = await linkAuthUserToExecOrEa(admin, user!.id, user!.email!);
    expect(linked).toMatchObject({ kind: "executive", id: execId });

    const { data: visible } = await session.from("executive").select("id");
    expect(visible?.map((r) => r.id)).toEqual([execId]); // ONLY their own row
  });

  // ── 3. The /auth/sign-in route ─────────────────────────────────────────────
  it("the sign-in-link route binds the principal and lands in /exec", async () => {
    const email = `route-e-${rand()}@exec.test`;
    const execId = await mkExec(email);
    await mkUser(email);
    const { data: link } = await admin.auth.admin.generateLink({ type: "magiclink", email });
    const tokenHash = link!.properties!.hashed_token;

    const res = await signInGET(new NextRequest(`http://localhost:3001/auth/sign-in?token_hash=${tokenHash}&type=magiclink`));
    const loc = new globalThis.URL(res.headers.get("location") ?? "", "http://localhost:3001");
    expect(loc.pathname).toBe("/exec");
    expect(res.cookies.getAll().some((c) => c.name.includes("auth-token") && c.value)).toBe(true);
    const { data: row } = await admin.from("executive").select("auth_user_id").eq("id", execId).single();
    expect(row?.auth_user_id).toBeTruthy();
  });

  it("an invalid sign-in link is bounced to /login with a generic notice", async () => {
    const res = await signInGET(new NextRequest(`http://localhost:3001/auth/sign-in?token_hash=deadbeefdeadbeef&type=magiclink`));
    const loc = new globalThis.URL(res.headers.get("location") ?? "", "http://localhost:3001");
    expect(loc.pathname).toBe("/login");
    expect(loc.searchParams.get("error")).toBe("link_invalid");
  });

  it("an authenticated NON-member is signed out and bounced identically (membership never revealed)", async () => {
    const email = `route-nobody-${rand()}@nowhere.test`;
    await mkUser(email); // an auth user with NO executive/ea record
    const { data: link } = await admin.auth.admin.generateLink({ type: "magiclink", email });
    const tokenHash = link!.properties!.hashed_token;

    const res = await signInGET(new NextRequest(`http://localhost:3001/auth/sign-in?token_hash=${tokenHash}&type=magiclink`));
    const loc = new globalThis.URL(res.headers.get("location") ?? "", "http://localhost:3001");
    expect(loc.pathname).toBe("/login");
    expect(loc.searchParams.get("error")).toBe("link_invalid");
    // The session was cleared (sign-out), so no live auth-token cookie is handed back.
    const authCookie = res.cookies.getAll().find((c) => c.name.includes("auth-token"));
    expect(authCookie?.value ?? "").toBe("");
  });

  // ── 4. request_standing_nomination (the controlled charity change) ─────────
  it("the owning executive can change their standing charity, keeping one open row, self-audited", async () => {
    const { execId, client } = await linkedExec();

    const { error } = await client.rpc("request_standing_nomination", { p_executive_id: execId, p_charity_id: ids.charA });
    expect(error).toBeNull();
    const { data: e1 } = await admin.from("executive").select("default_charity_id").eq("id", execId).single();
    expect(e1?.default_charity_id).toBe(ids.charA);
    expect(await openNomCount(execId)).toBe(1);

    const { error: e2 } = await client.rpc("request_standing_nomination", { p_executive_id: execId, p_charity_id: ids.charB });
    expect(e2).toBeNull();
    const { data: e3 } = await admin.from("executive").select("default_charity_id").eq("id", execId).single();
    expect(e3?.default_charity_id).toBe(ids.charB);
    expect(await openNomCount(execId)).toBe(1);

    const { data: au } = await admin
      .from("audit_entry")
      .select("actor_type")
      .eq("acting_for_executive_id", execId)
      .eq("action", "executive.standing_nomination_changed");
    expect((au ?? []).length).toBeGreaterThanOrEqual(1);
    expect(au!.every((r) => r.actor_type === "executive")).toBe(true);
  });

  it("a NON-owner executive cannot change another exec's charity (not_authorized, no change)", async () => {
    const { client } = await linkedExec(); // a different, unrelated exec
    const { data: before } = await admin.from("executive").select("default_charity_id").eq("id", ids.e1).single();

    const { error } = await client.rpc("request_standing_nomination", { p_executive_id: ids.e1, p_charity_id: ids.charA });
    expect(error?.message.toLowerCase()).toMatch(/not_authorized/);

    const { data: after } = await admin.from("executive").select("default_charity_id").eq("id", ids.e1).single();
    expect(after?.default_charity_id).toBe(before?.default_charity_id); // unchanged
  });

  it("an assigned EA can change their principal's charity; a non-assigned EA cannot", async () => {
    const eaEmail = `chg-ea-${rand()}@ea.test`;
    const eaId = await mkEa(eaEmail);
    const target = await mkExec(`chg-target-${rand()}@exec.test`);
    await admin.from("ea_assignment").insert({ ea_id: eaId, executive_id: target });
    const uid = await mkUser(eaEmail);
    await admin.from("ea").update({ auth_user_id: uid }).eq("id", eaId);
    const client = await signedIn(eaEmail);

    const { error } = await client.rpc("request_standing_nomination", { p_executive_id: target, p_charity_id: ids.charA });
    expect(error).toBeNull();
    const { data: row } = await admin.from("executive").select("default_charity_id").eq("id", target).single();
    expect(row?.default_charity_id).toBe(ids.charA);
    const { data: au } = await admin.from("audit_entry").select("actor_type").eq("acting_for_executive_id", target).eq("action", "executive.standing_nomination_changed");
    expect(au!.some((r) => r.actor_type === "ea")).toBe(true);

    // The same EA cannot touch an exec they are NOT assigned to.
    const { error: e2 } = await client.rpc("request_standing_nomination", { p_executive_id: ids.e2, p_charity_id: ids.charB });
    expect(e2?.message.toLowerCase()).toMatch(/not_authorized/);
  });

  it("staff can change any executive's charity through the same function", async () => {
    const target = await mkExec(`staff-target-${rand()}@exec.test`);
    const staff = await signedIn("admin@thegoodintro.test", SEED_PW);
    const { error } = await staff.rpc("request_standing_nomination", { p_executive_id: target, p_charity_id: ids.charA });
    expect(error).toBeNull();
    const { data: row } = await admin.from("executive").select("default_charity_id").eq("id", target).single();
    expect(row?.default_charity_id).toBe(ids.charA);
    const { data: au } = await admin.from("audit_entry").select("actor_type").eq("acting_for_executive_id", target);
    expect(au!.some((r) => r.actor_type === "staff")).toBe(true);
  });

  it("the staff-only set_standing_nomination still refuses a non-staff caller", async () => {
    const { execId, client } = await linkedExec();
    const { error } = await client.rpc("set_standing_nomination", { p_executive_id: execId, p_charity_id: ids.charA });
    expect(error?.message.toLowerCase()).toMatch(/not_staff/);
  });

  it("the private nomination core is NOT exposed on the RPC surface", async () => {
    const staff = await signedIn("admin@thegoodintro.test", SEED_PW);
    const { error } = await staff.rpc("apply_standing_nomination", { p_executive_id: ids.e1, p_charity_id: ids.charA });
    expect(error).not.toBeNull(); // private schema -> not in the PostgREST API
  });

  // ── 5. The gate's resolution logic (what requireExecOrEa depends on) ───────
  it("an exec resolves to its own executive; an EA to its assigned principal; a vendor to nothing", async () => {
    const { execId, client: cExec } = await linkedExec();
    const execUid = (await cExec.auth.getUser()).data.user!.id;
    const { data: ownExec } = await cExec.from("executive").select("id").eq("auth_user_id", execUid).is("deleted_at", null);
    expect(ownExec?.map((r) => r.id)).toEqual([execId]);

    const eaEmail = `gate-ea-${rand()}@ea.test`;
    const eaId = await mkEa(eaEmail);
    const principal = await mkExec(`gate-principal-${rand()}@exec.test`);
    await admin.from("ea_assignment").insert({ ea_id: eaId, executive_id: principal });
    const eaUid = await mkUser(eaEmail);
    await admin.from("ea").update({ auth_user_id: eaUid }).eq("id", eaId);
    const cEa = await signedIn(eaEmail);
    const { data: eaRow } = await cEa.from("ea").select("id").eq("auth_user_id", eaUid).maybeSingle();
    expect(eaRow?.id).toBe(eaId);
    const { data: asg } = await cEa.from("ea_assignment").select("executive_id").eq("ea_id", eaId);
    expect(asg?.map((r) => r.executive_id)).toContain(principal);

    const vendor = await signedIn("alex@alpha.test", SEED_PW);
    const vUid = (await vendor.auth.getUser()).data.user!.id;
    const { data: vExec } = await vendor.from("executive").select("id").eq("auth_user_id", vUid);
    const { data: vEa } = await vendor.from("ea").select("id").eq("auth_user_id", vUid);
    expect(vExec ?? []).toEqual([]);
    expect(vEa ?? []).toEqual([]);
  });

  // ── 6. Ambiguous / reused email binding (review findings 1 & 4) ────────────
  it("refuses to bind when an email matches more than one unlinked record, binding none", async () => {
    const email = `dupe-${rand()}@exec.test`;
    const eA = await mkExec(email);
    const eB = await mkExec(email); // same email, both unlinked
    const uid = await mkUser(email);

    const res = await linkAuthUserToExecOrEa(admin, uid, email);
    expect(res).toBeNull(); // ambiguous -> never guess
    const { data } = await admin.from("executive").select("auth_user_id").in("id", [eA, eB]);
    expect(data!.every((r) => r.auth_user_id === null)).toBe(true); // neither claimed
  });

  it("the staff send classifier flags a duplicate address instead of a false success", async () => {
    const single = `staff-single-${rand()}@exec.test`;
    const e1 = await mkExec(single);
    expect(await resolveStaffSignInTarget(admin, single)).toMatchObject({ status: "ok", subject: { kind: "executive", id: e1 } });

    const dupe = `staff-dupe-${rand()}@exec.test`;
    await mkExec(dupe);
    await mkExec(dupe); // two execs share the address
    expect(await resolveStaffSignInTarget(admin, dupe)).toMatchObject({ status: "ambiguous", matches: 2 });

    expect(await resolveStaffSignInTarget(admin, `staff-none-${rand()}@nowhere.test`)).toEqual({ status: "none" });
  });

  it("does not mis-claim when an auth user is bound to a soft-deleted record whose email was reused", async () => {
    const email = `reuse-${rand()}@exec.test`;
    const e1 = await mkExec(email);
    const uid = await mkUser(email);
    await admin.from("executive").update({ auth_user_id: uid }).eq("id", e1);
    await admin.from("executive").update({ deleted_at: new Date().toISOString() }).eq("id", e1);
    const e2 = await mkExec(email); // same email, active, unlinked

    const res = await linkAuthUserToExecOrEa(admin, uid, email);
    expect(res).toBeNull(); // uid belongs to the deleted e1; must not jump to e2
    const { data } = await admin.from("executive").select("auth_user_id").eq("id", e2).single();
    expect(data?.auth_user_id).toBeNull(); // e2 untouched
  });

  // ── 7. Route `next` is confined to the exec portal (review finding 3) ──────
  it("the route collapses `next` traversal: /exec/../admin lands on /exec, a real /exec/* next is honored", async () => {
    const mk = async () => {
      const email = `trav-${rand()}@exec.test`;
      await mkExec(email);
      await mkUser(email);
      const { data: link } = await admin.auth.admin.generateLink({ type: "magiclink", email });
      return link!.properties!.hashed_token;
    };
    const th1 = await mk();
    const res1 = await signInGET(new NextRequest(`http://localhost:3001/auth/sign-in?token_hash=${th1}&type=magiclink&next=${encodeURIComponent("/exec/../admin")}`));
    expect(new globalThis.URL(res1.headers.get("location") ?? "", "http://localhost:3001").pathname).toBe("/exec");

    const th2 = await mk();
    const res2 = await signInGET(new NextRequest(`http://localhost:3001/auth/sign-in?token_hash=${th2}&type=magiclink&next=${encodeURIComponent("/exec/meetings")}`));
    expect(new globalThis.URL(res2.headers.get("location") ?? "", "http://localhost:3001").pathname).toBe("/exec/meetings");
  });

  // ── 8. exec_ea_login is a RELIABLE kill switch (the flag patch) ────────────
  it("getFlagAuthoritative reads the flag via the service role, with no authenticated session", async () => {
    await setExecEaLogin(true);
    expect(await getFlagAuthoritative("exec_ea_login")).toBe(true);
    await setExecEaLogin(false);
    expect(await getFlagAuthoritative("exec_ea_login")).toBe(false);
    await setExecEaLogin(true); // restore for following tests
  });

  it("the sign-in route fails closed when the flag is OFF: no verify, no bind, no session", async () => {
    const email = `flagoff-route-${rand()}@exec.test`;
    const execId = await mkExec(email);
    await mkUser(email);
    const { data: link } = await admin.auth.admin.generateLink({ type: "magiclink", email });
    const th = link!.properties!.hashed_token;

    await setExecEaLogin(false);
    try {
      const res = await signInGET(new NextRequest(`http://localhost:3001/auth/sign-in?token_hash=${th}&type=magiclink`));
      const loc = new globalThis.URL(res.headers.get("location") ?? "", "http://localhost:3001");
      expect(loc.pathname).toBe("/login");
      expect(loc.searchParams.get("error")).toBe("link_invalid");
      const { data: row } = await admin.from("executive").select("auth_user_id").eq("id", execId).single();
      expect(row?.auth_user_id).toBeNull(); // never bound
      expect(res.cookies.getAll().some((c) => c.name.includes("auth-token") && c.value)).toBe(false);
    } finally {
      await setExecEaLogin(true);
    }
  });

  it("the charity-change RPC is flag-gated for non-staff: OFF refuses a bound exec, staff still works, ON allows", async () => {
    const { execId, client } = await linkedExec();

    await setExecEaLogin(false);
    try {
      const off = await client.rpc("request_standing_nomination", { p_executive_id: execId, p_charity_id: ids.charA });
      expect(off.error?.message.toLowerCase()).toMatch(/not_authorized/);
      const { data: unchanged } = await admin.from("executive").select("default_charity_id").eq("id", execId).single();
      expect(unchanged?.default_charity_id).toBeNull(); // the flag-off call changed nothing

      // Staff bypass the flag entirely.
      const staff = await signedIn("admin@thegoodintro.test", SEED_PW);
      const staffRes = await staff.rpc("request_standing_nomination", { p_executive_id: execId, p_charity_id: ids.charA });
      expect(staffRes.error).toBeNull();
    } finally {
      await setExecEaLogin(true);
    }

    // ON: the exec can now make the change themselves.
    const on = await client.rpc("request_standing_nomination", { p_executive_id: execId, p_charity_id: ids.charB });
    expect(on.error).toBeNull();
    const { data: after } = await admin.from("executive").select("default_charity_id").eq("id", execId).single();
    expect(after?.default_charity_id).toBe(ids.charB);
  });
});
