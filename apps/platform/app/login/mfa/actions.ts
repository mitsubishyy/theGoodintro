"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safe-redirect";

export type AuthState = { error?: string };

export async function verifyMfaAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const code = String(formData.get("code") ?? "").trim();
  const next = safeNextPath(String(formData.get("next") ?? ""));

  const supabase = await createClient();
  const { data: factors, error: fe } = await supabase.auth.mfa.listFactors();
  if (fe) return { error: fe.message };

  const totp = factors?.totp?.[0];
  if (!totp) return { error: "No authenticator is enrolled on this account." };

  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: totp.id,
    code,
  });
  if (error) return { error: error.message };

  redirect(next);
}
