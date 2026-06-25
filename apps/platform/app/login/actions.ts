"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeNextPath } from "@/lib/safe-redirect";
import { getFlag } from "@/lib/flags";
import { requestExecEaSignInLink } from "@/lib/exec-access";
import { logSecurityEvent } from "@/lib/security-log";

export type AuthState = { error?: string };

export type SignInLinkState = { sent?: boolean };

/**
 * Request a passwordless sign-in link for an executive or EA (slice 2d), from the
 * shared /login. ALWAYS returns the same `{ sent: true }` for a member and an
 * unknown email — the page renders the identical "check your email" state either
 * way — so the response can never confirm whether an address belongs to the
 * invite-only network (the locked never-reveal-membership rule). Staff and
 * vendors keep password auth and never use this path.
 *
 * Resolution + the actual send use the service role (the caller is anonymous);
 * the membership branch happens invisibly server-side and errors are swallowed in
 * the core, so the visible response is constant. Rate limiting is Supabase's
 * built-in [auth.rate_limit].email_sent. Flag-gated (exec_ea_login, OFF by
 * default); when off, the response is still the constant sent-state.
 */
export async function requestSignInLinkAction(
  _prev: SignInLinkState,
  formData: FormData,
): Promise<SignInLinkState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (email && (await getFlag("exec_ea_login"))) {
    const admin = createAdminClient();
    if (admin) await requestExecEaSignInLink(admin, email);
    // Logged identically whether or not the address is a member (no enumeration).
    logSecurityEvent("exec_signin_link_requested", { email });
  }

  return { sent: true };
}

export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""));

  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  // If a second factor is required to reach aal2, go to the challenge step.
  const { data: aal } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && aal.nextLevel === "aal2" && aal.nextLevel !== aal.currentLevel) {
    redirect(`/login/mfa?next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
