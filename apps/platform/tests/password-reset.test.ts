import { describe, it, expect, beforeAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import {
  sendPasswordReset,
  recoveryRedirectTo,
  MIN_PASSWORD_LENGTH,
  RECOVERY_INTENT_COOKIE,
  RESET_PASSWORD_PATH,
} from "@/lib/password-reset";
import { GET as confirmGET } from "@/app/auth/confirm/route";

/**
 * Password reset flow (C11), against the LOCAL Supabase stack. Two properties
 * the acceptance criteria turn on:
 *   1. the request flow returns the SAME outcome for a real and an unknown email
 *      (no account enumeration);
 *   2. the recovery link establishes a session that can set a new password, and
 *      the link is single-use.
 *
 * The request server action itself calls cookies() and cannot run in vitest, so
 * we test its testable core (sendPasswordReset) plus the underlying Supabase
 * primitive directly — the same code path the action drives.
 */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const anon = () => createClient(URL, KEY, { auth: { persistSession: false } });

describe("password reset: request flow does not leak whether an account exists", () => {
  beforeAll(() => {
    if (!URL || !KEY) throw new Error("Supabase env vars are not set");
  });

  it("returns the identical outcome for a seeded user and an unknown email", async () => {
    const redirectTo = recoveryRedirectTo();

    // A real account (seeded) and a definitely-unknown one. The core swallows
    // every outcome (including rate-limit) and resolves the same, so the user
    // visible response is constant — the action returns { done: true } for both.
    const known = await sendPasswordReset(anon(), "alex@alpha.test", redirectTo);
    const unknown = await sendPasswordReset(
      anon(),
      `nobody-${Math.random().toString(36).slice(2)}@nowhere.test`,
      redirectTo,
    );

    expect(known).toBeUndefined();
    expect(unknown).toBeUndefined();
    expect(known).toEqual(unknown);
  });

  it("the underlying Supabase primitive is itself non-revealing", async () => {
    // resetPasswordForEmail must not error-differently for unknown vs known
    // emails (that is what would leak existence). Both come back without a
    // user-facing error. (Either may hit the email_sent rate limit; that is the
    // same for both and is still swallowed by sendPasswordReset.)
    const redirectTo = recoveryRedirectTo();
    const a = await anon().auth.resetPasswordForEmail("alex@alpha.test", { redirectTo });
    const b = await anon().auth.resetPasswordForEmail(
      `ghost-${Math.random().toString(36).slice(2)}@nowhere.test`,
      { redirectTo },
    );
    // Neither returns a "no such user" style error to the caller.
    expect(a.error?.message ?? "").not.toMatch(/not found|no user|exist/i);
    expect(b.error?.message ?? "").not.toMatch(/not found|no user|exist/i);
  });
});

describe("password reset: recovery link sets a new password (single-use)", () => {
  let admin: SupabaseClient;
  let userId: string;
  let email: string;
  const OLD_PW = "Old-Passw0rd!1";
  const NEW_PW = "New-Passw0rd!2";

  beforeAll(async () => {
    if (!SERVICE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
    admin = createClient(URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    // Throwaway user so we never mutate a shared seed account's password.
    email = `reset-${Math.random().toString(36).slice(2)}@reset.test`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: OLD_PW,
      email_confirm: true,
    });
    if (error) throw new Error(`createUser failed: ${error.message}`);
    userId = data.user!.id;
  });

  it("a recovery token verifies, updates the password, and is then single-use", async () => {
    // Generate the recovery link the email would carry (no email is sent here).
    const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
    });
    expect(linkErr).toBeNull();
    const tokenHash = link!.properties!.hashed_token;
    expect(tokenHash).toBeTruthy();

    // The /auth/confirm route's OTP branch: verify establishes a recovery session.
    const recovery = anon();
    const { error: verifyErr } = await recovery.auth.verifyOtp({
      type: "recovery",
      token_hash: tokenHash,
    });
    expect(verifyErr).toBeNull();

    // The set-new-password action: updateUser on the recovery session.
    expect(NEW_PW.length).toBeGreaterThanOrEqual(MIN_PASSWORD_LENGTH);
    const { error: updErr } = await recovery.auth.updateUser({ password: NEW_PW });
    expect(updErr).toBeNull();

    // The new password works and the old one no longer does.
    const fresh = anon();
    const { error: newOk } = await fresh.auth.signInWithPassword({ email, password: NEW_PW });
    expect(newOk).toBeNull();
    const { error: oldFails } = await anon().auth.signInWithPassword({ email, password: OLD_PW });
    expect(oldFails).not.toBeNull();

    // Single-use: the same recovery token cannot be redeemed again.
    const { error: reuseErr } = await anon().auth.verifyOtp({
      type: "recovery",
      token_hash: tokenHash,
    });
    expect(reuseErr).not.toBeNull();
  });

  // Best-effort cleanup so reruns on a non-reset DB stay clean.
  it("cleans up the throwaway user", async () => {
    const { error } = await admin.auth.admin.deleteUser(userId);
    expect(error).toBeNull();
  });
});

describe("password reset: /auth/confirm route is recovery-only with a fixed destination", () => {
  let admin: SupabaseClient;
  let userId: string;
  let email: string;

  const confirm = (qs: string) =>
    confirmGET(new NextRequest(`http://localhost:3001/auth/confirm${qs}`));
  // NOTE: the module-level `const URL` (the Supabase URL) shadows the global URL
  // constructor here, so reach for it explicitly.
  const loc = (res: Response) =>
    new globalThis.URL(res.headers.get("location") ?? "", "http://localhost:3001");

  beforeAll(async () => {
    if (!SERVICE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
    admin = createClient(URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    email = `confirm-${Math.random().toString(36).slice(2)}@reset.test`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: "Init-Passw0rd!1",
      email_confirm: true,
    });
    if (error) throw new Error(`createUser failed: ${error.message}`);
    userId = data.user!.id;
  });

  it("a valid recovery token lands on the reset page (never the caller's next) and sets the intent cookie", async () => {
    const { data: link, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
    });
    expect(error).toBeNull();
    const tokenHash = link!.properties!.hashed_token;

    // The crux of the P1 fix: an attacker-supplied next=/admin must be ignored.
    const res = await confirm(
      `?token_hash=${tokenHash}&type=recovery&next=${encodeURIComponent("/admin")}`,
    );

    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    expect(loc(res).pathname).toBe(RESET_PASSWORD_PATH);
    expect(loc(res).pathname).not.toBe("/admin");
    // A session was established and the recovery-intent cookie was set.
    expect(res.cookies.get(RECOVERY_INTENT_COOKIE)?.value).toBe("1");
  });

  it("an invalid token redirects to the request page with a generic error and no intent cookie", async () => {
    const res = await confirm(`?token_hash=deadbeefdeadbeefdeadbeef&type=recovery`);
    expect(loc(res).pathname).toBe("/login/forgot");
    expect(loc(res).searchParams.get("error")).toBe("link_invalid");
    expect(res.cookies.get(RECOVERY_INTENT_COOKIE)?.value).toBeUndefined();
  });

  it("a non-recovery OTP type is rejected (no other email flows yet)", async () => {
    const res = await confirm(`?token_hash=whatever&type=magiclink`);
    expect(loc(res).pathname).toBe("/login/forgot");
    expect(loc(res).searchParams.get("error")).toBe("link_invalid");
    expect(res.cookies.get(RECOVERY_INTENT_COOKIE)?.value).toBeUndefined();
  });

  it("cleans up the throwaway user", async () => {
    const { error } = await admin.auth.admin.deleteUser(userId);
    expect(error).toBeNull();
  });
});
