import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFlag } from "@/lib/flags";

type AalLevels = {
  currentLevel: string | null;
  nextLevel: string | null;
} | null;

/**
 * Decide what an admin must do to satisfy `admin_2fa_required`, given their
 * Authenticator Assurance Level. Pure so it is unit-testable without a session.
 *
 * Fail-closed: anything other than a confirmed aal2 returns a step that keeps the
 * cockpit out of reach. `nextLevel === "aal2"` means a *verified* factor exists
 * but this session has not challenged it yet → send to the challenge, NOT the
 * enrol screen (sending an already-enrolled admin to enrol is a soft lock-out).
 * No determinable AAL (null, e.g. the lookup errored) → enrol, never allow.
 */
export function requiredMfaStep(aal: AalLevels): "challenge" | "enroll" | null {
  if (!aal) return "enroll";
  if (aal.currentLevel === "aal2") return null;
  return aal.nextLevel === "aal2" ? "challenge" : "enroll";
}

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
    const { data: aal, error: aalError } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    // Fail closed: an errored lookup is treated as "cannot confirm aal2" (null),
    // which requiredMfaStep maps to the enrol path — never a pass-through.
    const step = requiredMfaStep(aalError ? null : aal);
    if (step === "challenge") redirect("/login/mfa?next=%2Fadmin");
    if (step === "enroll") redirect("/account/security?enroll=1");
  }

  return { user, staff, supabase };
}
