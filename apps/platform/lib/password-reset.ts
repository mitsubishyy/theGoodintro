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
 * Absolute `redirectTo` for `resetPasswordForEmail`. The recovery link hits the
 * Supabase verify endpoint, which redirects here; our `/auth/confirm` route
 * exchanges the code / verifies the OTP to establish the recovery session, then
 * forwards to the set-new-password page. The target must be allow-listed in
 * `supabase/config.toml` (`additional_redirect_urls`) or Supabase ignores it.
 */
export function recoveryRedirectTo(): string {
  const next = encodeURIComponent(RESET_PASSWORD_PATH);
  return `${appBaseUrl()}/auth/confirm?next=${next}`;
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
