import type { SupabaseClient } from "@supabase/supabase-js";
import { appBaseUrl } from "@/lib/app-url";

/**
 * Password reset (PRODUCTION_READINESS C11), built on Supabase Auth's built-in
 * recovery — no hand-rolled token table. The pieces shared by the request and
 * set-new-password actions live here so they are unit-testable without a Next
 * request scope (the actions themselves call `cookies()` and cannot be invoked
 * directly in vitest).
 */

/** Minimum new-password length. Matches the sign-up rule for one bar across auth. */
export const MIN_PASSWORD_LENGTH = 10;

/** Where the set-new-password form lives (the recovery link's final landing). */
export const RESET_PASSWORD_PATH = "/auth/reset-password";

/**
 * Proof-of-recovery cookie. `/auth/confirm` sets it ONLY after a recovery link
 * successfully establishes a session; the set-new-password page and action
 * require it. This is what makes /auth/reset-password genuinely recovery-only
 * rather than a general "change my password while signed in" surface — a stray
 * session that did not come through the recovery link has no cookie and is
 * turned away. HttpOnly + SameSite means it cannot be forged by script or
 * cross-site, and it is short-lived and single-use (cleared on completion).
 */
export const RECOVERY_INTENT_COOKIE = "tgi-recovery";
/** Long enough to set a password, short enough to limit a dangling recovery session. */
export const RECOVERY_INTENT_MAX_AGE = 600; // seconds (10 min)
/** Scopes the cookie to the recovery pages (covers the page GET and the action POST). */
export const RECOVERY_INTENT_PATH = "/auth";

/**
 * Absolute `redirectTo` for `resetPasswordForEmail`. The recovery link hits the
 * Supabase verify endpoint, which redirects here; our `/auth/confirm` route
 * exchanges the code / verifies the OTP to establish the recovery session, then
 * forwards to the set-new-password page. The target must be allow-listed in
 * `supabase/config.toml` (`additional_redirect_urls`) or Supabase ignores it.
 *
 * NOTE: no caller-supplied `next`. The confirmation always lands on the
 * password-reset page, so a recovery email can never be redirected to act as a
 * magic login link to an arbitrary in-app route.
 */
export function recoveryRedirectTo(): string {
  return `${appBaseUrl()}/auth/confirm`;
}

/**
 * Ask Supabase to send a recovery email, then ALWAYS report the same generic
 * outcome — never branch on whether the account exists. `resetPasswordForEmail`
 * is already non-revealing (it no-ops for unknown emails), and we additionally
 * swallow any error (including rate-limit) so the caller's response is constant.
 * This is what makes the request flow safe against account enumeration.
 */
export async function sendPasswordReset(
  supabase: SupabaseClient,
  email: string,
  redirectTo: string,
): Promise<void> {
  try {
    await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  } catch {
    // Deliberately ignored: the response must not depend on the outcome.
  }
}
