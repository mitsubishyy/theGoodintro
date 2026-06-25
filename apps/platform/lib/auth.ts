import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getFlag, getFlagAuthoritative } from "@/lib/flags";

/**
 * The EA's chosen active principal (the EA Mode banner's "Switch executive").
 * Read by getExecPrincipal to scope a multi-principal EA, set by
 * switchEaPrincipalAction. Always re-validated against the EA's real assignments
 * on read — a forged or stale value falls back to the first assignment, and RLS
 * (can_access_executive) is the backstop regardless.
 */
export const EA_PRINCIPAL_COOKIE = "tgi_ea_principal";

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

/**
 * The principal whose data the exec portal shows for the current session.
 * - `staff`: the surface is staff-operated (the demo / admin-acting path);
 *   `execId` is null and the caller resolves the demo executive. Staff can always
 *   operate the portal, regardless of the exec/EA login flag.
 * - `executive`: the signed-in executive themselves (`execId` is their id).
 * - `ea`: an assigned EA; `execId` is the principal they are acting for (the
 *   first assignment — one principal at a time, the locked EA Mode banner model).
 */
export interface ExecPrincipal {
  supabase: SupabaseClient;
  user: User;
  kind: "staff" | "executive" | "ea";
  execId: string | null;
  /** Present for the staff principal — the staff row id, for action-layer audit. */
  staffId?: string;
  eaId?: string;
}

/**
 * Resolve the exec-portal principal WITHOUT redirecting — returns null when there
 * is no signed-in user, or the user is neither staff nor an exec/EA with access.
 * For server actions (which return error states, not redirects). The exec/EA
 * branches are gated on the exec_ea_login flag (CHANGE_SAFETY: the behaviour
 * change of exec/EA reaching the portal ships off by default); staff are not.
 */
export async function getExecPrincipal(): Promise<ExecPrincipal | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: staff } = await supabase
    .from("staff")
    .select("id")
    .eq("auth_user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (staff) return { supabase, user, kind: "staff", execId: null, staffId: staff.id as string };

  // Authoritative read: the same kill switch the sign-in route and the RPC honor.
  if (await getFlagAuthoritative("exec_ea_login")) {
    const { data: exec } = await supabase
      .from("executive")
      .select("id")
      .eq("auth_user_id", user.id)
      .is("deleted_at", null)
      .maybeSingle();
    if (exec?.id) return { supabase, user, kind: "executive", execId: exec.id as string };

    const { data: ea } = await supabase
      .from("ea")
      .select("id")
      .eq("auth_user_id", user.id)
      .is("deleted_at", null)
      .maybeSingle();
    if (ea?.id) {
      // One principal at a time. RLS already lets the EA read all their assigned
      // execs; the active principal is the EA Mode banner's choice (cookie) when it
      // is genuinely one of their assignments, else the first assignment.
      const { data: asgs } = await supabase
        .from("ea_assignment")
        .select("executive_id")
        .eq("ea_id", ea.id as string)
        .order("created_at", { ascending: true });
      const assignmentIds = (asgs ?? []).map((r) => r.executive_id as string);
      // An EA with no assignment has nothing to act on — treat as no access.
      if (assignmentIds.length > 0) {
        const chosen = (await cookies()).get(EA_PRINCIPAL_COOKIE)?.value;
        const active = chosen && assignmentIds.includes(chosen) ? chosen : assignmentIds[0];
        return { supabase, user, kind: "ea", execId: active, eaId: ea.id as string };
      }
    }
  }

  return null;
}

/**
 * Gate the exec portal to "staff OR the owning exec/EA" (slice 2d), replacing the
 * interim staff-only gate. Redirects a signed-out user to /login and a signed-in
 * non-principal (e.g. a vendor) to /login with a generic notice. Returns the
 * resolved principal for the page/layout.
 */
export async function requireExecOrEa(): Promise<ExecPrincipal> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const principal = await getExecPrincipal();
  if (!principal) redirect("/login?error=not_authorized");
  return principal;
}
