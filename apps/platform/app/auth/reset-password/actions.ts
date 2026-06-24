"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MIN_PASSWORD_LENGTH } from "@/lib/password-reset";
import { logSecurityEvent } from "@/lib/security-log";

export type ResetState = { error?: string };

/**
 * Set a new password from an active recovery session (established by
 * `/auth/confirm`). Enforces the minimum length, calls Supabase's built-in
 * `updateUser`, records the completion as a security event, then signs the
 * recovery session out and sends the user to /login to re-authenticate cleanly
 * with the new password (re-triggering MFA for staff).
 */
export async function updatePasswordAction(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < MIN_PASSWORD_LENGTH)
    return { error: `Use a password of at least ${MIN_PASSWORD_LENGTH} characters.` };
  if (password !== confirm) return { error: "The two passwords do not match." };

  const supabase = await createClient();

  // The recovery link must have landed a valid session here; without one
  // updateUser cannot identify the account.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return {
      error:
        "Your reset link has expired or was already used. Request a new one.",
    };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  logSecurityEvent("password_reset_completed", { user_id: user.id });

  // Invalidate the recovery session so the link cannot be reused as a live login.
  await supabase.auth.signOut();
  redirect("/login?reset=done");
}
