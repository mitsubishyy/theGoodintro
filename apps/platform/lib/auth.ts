import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFlag } from "@/lib/flags";

/** The signed-in user plus their staff row (null if they are not staff). */
export async function getStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: staff } = await supabase
    .from("staff")
    .select("*")
    .eq("auth_user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  return { user, staff };
}

/** The signed-in user plus their vendor membership + org (nulls if none). */
export async function getVendor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: vendorUser } = await supabase
    .from("vendor_user")
    .select("*, vendor:vendor_id(*)")
    .eq("auth_user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  return { user, vendorUser, supabase };
}

/**
 * Gate a page to staff only. Redirects to /login if signed out, away if not
 * staff, and to MFA enrolment once `admin_2fa_required` is on (admin 2FA from
 * launch; enforcement flips on via the flag so staging can be tested first).
 */
export async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: staff } = await supabase
    .from("staff")
    .select("*")
    .eq("auth_user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!staff) redirect("/login?error=not_staff");

  if (await getFlag("admin_2fa_required")) {
    const { data: aal } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel !== "aal2") redirect("/account/security?enroll=1");
  }

  return { user, staff, supabase };
}
