"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFlag } from "@/lib/flags";
import { isWorkEmail } from "@/lib/email-domain";

export type SignUpState = { error?: string; checkEmail?: boolean };

export async function signUpAction(
  _prev: SignUpState,
  fd: FormData,
): Promise<SignUpState> {
  if (!(await getFlag("vendor_signup")))
    return { error: "Sign-up is not open yet." };

  const company = String(fd.get("company") ?? "").trim();
  const fullName = String(fd.get("full_name") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");

  if (!company || !email || !password)
    return { error: "Company, email and password are required." };
  if (!isWorkEmail(email))
    return { error: "Please use your work email — generic domains are not accepted." };
  if (password.length < 10)
    return { error: "Use a password of at least 10 characters." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { company, full_name: fullName } },
  });
  if (error) return { error: error.message };

  // Email confirmation enabled: no session yet, finish org creation after login.
  if (!data.session) return { checkEmail: true };

  const { error: rpcErr } = await supabase.rpc("signup_vendor", {
    p_company: company,
    p_full_name: fullName,
  });
  if (rpcErr) return { error: rpcErr.message };

  redirect("/vendor");
}
