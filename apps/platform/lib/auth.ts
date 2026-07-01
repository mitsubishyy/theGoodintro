import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFlag } from "@/lib/flags";

/**
 * The signed-in user + their staff row, loaded once per request. Memoized with
 * React `cache()` so the layout gate (`requireStaff`) and any page-level
 * `getStaff()` in the same render share a single `getUser` + staff lookup
 * instead of each doing its own round-trip. Per-request only; still runs as the
 * signed-in user's client, so RLS is unchanged. No redirect here — callers
 * decide what to do with a missing user/staff.
 */
const loadStaffSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, staff: null };

  const { data: staff } = await supabase
    .from("staff")
    .select("*")
    .eq("auth_user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  return { supabase, user, staff: staff ?? null };
});

/** The signed-in user plus their staff row (null if they are not staff). */
export async function getStaff() {
  const { user, staff } = await loadStaffSession();
  if (!user) return null;
  return { user, staff };
}

/**
 * The signed-in user plus their vendor membership + org (nulls if none).
 * Memoized per request: the vendor shell (`layout.tsx`) and the page it wraps
 * both call this, so caching collapses the duplicate `getUser` + vendor_user
 * lookup to one. Per-request only; RLS/session unchanged.
 */
export const getVendor = cache(async () => {
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
});

/**
 * Gate a page to staff only. Redirects to /login if signed out, away if not
 * staff, and to MFA enrolment once `admin_2fa_required` is on (admin 2FA from
 * launch; enforcement flips on via the flag so staging can be tested first).
 */
export async function requireStaff() {
  const { supabase, user, staff } = await loadStaffSession();
  if (!user) redirect("/login");
  if (!staff) redirect("/login?error=not_staff");

  if (await getFlag("admin_2fa_required")) {
    const { data: aal } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel !== "aal2") redirect("/account/security?enroll=1");
  }

  return { user, staff, supabase };
}
