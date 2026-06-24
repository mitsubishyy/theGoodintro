"use server";

import { createClient } from "@/lib/supabase/server";
import { sendPasswordReset, recoveryRedirectTo } from "@/lib/password-reset";
import { logSecurityEvent } from "@/lib/security-log";

export type ForgotState = { done?: boolean };

/**
 * Request a password reset link. ALWAYS returns the same `{ done: true }` state
 * for a real or unknown email — the page renders one generic "if that account
 * exists…" message either way — so the response cannot be used to enumerate
 * accounts. Rate limiting is Supabase's built-in `[auth.rate_limit].email_sent`.
 */
export async function requestPasswordResetAction(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  // No email at all is the only thing we surface differently, and even then we
  // return the generic done-state rather than an error, to keep the response shape
  // constant. A genuinely empty submit just sends nothing.
  if (email) {
    const supabase = await createClient();
    await sendPasswordReset(supabase, email, recoveryRedirectTo());
    // Logged identically whether or not the account exists (no enumeration via logs).
    logSecurityEvent("password_reset_requested", { email });
  }

  return { done: true };
}
