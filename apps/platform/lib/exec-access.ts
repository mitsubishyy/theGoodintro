import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { appBaseUrl } from "@/lib/app-url";
import { logSecurityEvent } from "@/lib/security-log";

/**
 * Exec / EA passwordless access (slice 2d). The pieces shared by the shared
 * /login self-service path, the staff "send access link" provisioning, and the
 * sign-in-link landing route live here so they are testable against the local
 * stack without a Next request scope (the server actions/route call cookies()).
 *
 * Built on Supabase Auth's built-in OTP / magic-link ("sign-in link" in UI copy —
 * never "magic", a banned word). No hand-rolled token table: the link, its expiry
 * ([auth.email].otp_expiry), and the send-rate limit ([auth.rate_limit].email_sent)
 * are all auth infrastructure. Staff and vendors keep password auth untouched.
 */

/** Where the sign-in link lands; must be allow-listed in supabase/config.toml. */
export const SIGN_IN_CONFIRM_PATH = "/auth/sign-in";

/** Absolute `emailRedirectTo` for the sign-in link. */
export function signInRedirectTo(): string {
  return `${appBaseUrl()}${SIGN_IN_CONFIRM_PATH}`;
}

export type PrincipalKind = "executive" | "ea";
export interface ExecEaPrincipal {
  kind: PrincipalKind;
  id: string;
  email: string;
}

/** A stateless anon client for OTP sends — never touches request cookies. */
function anonClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/** Escape ILIKE wildcards so an email is matched as a literal, case-insensitively. */
function ilikeLiteral(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/**
 * Resolve an email to an executive or EA membership using the service-role client
 * (the self-service caller is anonymous and cannot read these tables under RLS).
 * Executive wins over EA on the off chance an address is on both. Returns null for
 * a non-member — the caller must treat that identically to a member (no leak).
 */
export async function resolveExecOrEaByEmail(
  admin: SupabaseClient,
  email: string,
): Promise<ExecEaPrincipal | null> {
  const needle = ilikeLiteral(email.trim());
  if (!needle) return null;

  const { data: exec } = await admin
    .from("executive")
    .select("id, primary_email")
    .ilike("primary_email", needle)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();
  if (exec?.id) return { kind: "executive", id: exec.id as string, email: exec.primary_email as string };

  const { data: ea } = await admin
    .from("ea")
    .select("id, email")
    .ilike("email", needle)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();
  if (ea?.id) return { kind: "ea", id: ea.id as string, email: ea.email as string };

  return null;
}

export type StaffSignInTarget =
  | { status: "none" }
  | { status: "ambiguous"; matches: number }
  | { status: "ok"; subject: ExecEaPrincipal };

/**
 * Classify an email for a STAFF "send access link" action. Unlike the self-service
 * send (where an ambiguous address is harmless — the UI always shows "link sent"
 * and the bind refuses on click), staff get an explicit ok/error result, so a
 * silent "sent" on an ambiguous address would look successful and then fail when
 * the executive clicks (linkAuthUserToExecOrEa refuses a non-unique match). This
 * surfaces the same ambiguity up front: more than one non-deleted exec/EA sharing
 * the email is reported as a duplicate to resolve, not a successful send.
 */
export async function resolveStaffSignInTarget(
  admin: SupabaseClient,
  email: string,
): Promise<StaffSignInTarget> {
  const needle = ilikeLiteral(email.trim());
  if (!needle) return { status: "none" };

  const [{ data: execs }, { data: eas }] = await Promise.all([
    admin.from("executive").select("id, primary_email").ilike("primary_email", needle).is("deleted_at", null).limit(2),
    admin.from("ea").select("id, email").ilike("email", needle).is("deleted_at", null).limit(2),
  ]);
  const e = execs ?? [];
  const a = eas ?? [];
  const total = e.length + a.length;
  if (total === 0) return { status: "none" };
  if (total > 1) return { status: "ambiguous", matches: total };
  return e.length === 1
    ? { status: "ok", subject: { kind: "executive", id: e[0].id as string, email: e[0].primary_email as string } }
    : { status: "ok", subject: { kind: "ea", id: a[0].id as string, email: a[0].email as string } };
}

/**
 * Issue one OTP round-trip to GoTrue for `email`. `shouldCreateUser` must be true
 * for a real member (a never-logged-in exec/EA has no auth user yet; the
 * auth_user_id link is established on the landing route) and false for a non-
 * member (GoTrue round-trips but creates nothing and sends nothing — "unknown
 * addresses send nothing"). Errors (including the email-send rate limit) are
 * swallowed so the caller's response never depends on the outcome.
 */
export async function sendSignInLink(email: string, shouldCreateUser: boolean): Promise<void> {
  try {
    await anonClient().auth.signInWithOtp({
      email,
      options: { shouldCreateUser, emailRedirectTo: signInRedirectTo() },
    });
  } catch {
    // Deliberately ignored — account safety depends on a constant response.
  }
}

/**
 * Self-service entry: resolve membership, then ALWAYS issue exactly one OTP
 * round-trip so response LATENCY cannot distinguish a member from an unknown
 * email (a member-only send would be a timing oracle). shouldCreateUser is true
 * only for a real member, so a non-member still has nothing created and nothing
 * sent ("unknown addresses send nothing"), and the unknown branch is now equally
 * subject to Supabase's per-IP sign-in rate limit. Returns void and swallows
 * everything, so a known and an unknown email are indistinguishable.
 */
export async function requestExecEaSignInLink(
  admin: SupabaseClient,
  email: string,
): Promise<void> {
  const member = await resolveExecOrEaByEmail(admin, email);
  await sendSignInLink(email, Boolean(member));
}

/**
 * On the first authenticated sign-in, bind the auth user to its executive / EA
 * record by matching the (confirmed) session email, so the 0029 RLS begins
 * scoping them. Idempotent and takeover-safe: returns an already-linked record
 * as-is, and only claims an UNLINKED record (the conditional update no-ops if the
 * slot was taken in a race). Returns the principal, or null if the email matches
 * no exec/EA (e.g. a vendor or a stale address) — the caller routes that away
 * without revealing anything. Uses the service-role client: an exec/EA session
 * cannot write executive/ea under RLS.
 */
export async function linkAuthUserToExecOrEa(
  admin: SupabaseClient,
  authUserId: string,
  email: string,
): Promise<ExecEaPrincipal | null> {
  // Already linked (a returning sign-in), matched by the UNIQUE auth_user_id.
  // Soft-deleted rows are INCLUDED on purpose: a UID that still occupies a deleted
  // record must be refused (the record is gone) rather than falling through to
  // claim a different row that shares the email — which would both mis-scope and
  // collide on the unique auth_user_id constraint.
  const { data: byUidExec } = await admin
    .from("executive")
    .select("id, primary_email, deleted_at")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (byUidExec) {
    return byUidExec.deleted_at ? null : { kind: "executive", id: byUidExec.id as string, email: byUidExec.primary_email as string };
  }
  const { data: byUidEa } = await admin
    .from("ea")
    .select("id, email, deleted_at")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (byUidEa) {
    return byUidEa.deleted_at ? null : { kind: "ea", id: byUidEa.id as string, email: byUidEa.email as string };
  }

  const needle = ilikeLiteral(email.trim());
  if (!needle) return null;

  // Bind by email ONLY when there is EXACTLY ONE unlinked subject. primary_email
  // and ea.email are not unique, so a shared/role inbox or a duplicate can match
  // more than one record; binding to the oldest would silently scope the session
  // to the WRONG executive. Refuse (and log) any 0-or-many match so staff can
  // disambiguate rather than the system guessing. (limit 2 is enough to detect
  // "more than one".)
  const [{ data: execMatches }, { data: eaMatches }] = await Promise.all([
    admin.from("executive").select("id, primary_email").ilike("primary_email", needle).is("deleted_at", null).is("auth_user_id", null).limit(2),
    admin.from("ea").select("id, email").ilike("email", needle).is("deleted_at", null).is("auth_user_id", null).limit(2),
  ]);
  const execN = execMatches?.length ?? 0;
  const eaN = eaMatches?.length ?? 0;
  if (execN + eaN !== 1) {
    if (execN + eaN > 1) logSecurityEvent("exec_signin_ambiguous_email", { execMatches: execN, eaMatches: eaN });
    return null; // 0 = no unlinked subject; >1 = ambiguous, never guess.
  }

  if (execN === 1) {
    const target = execMatches![0];
    const { data: claimed, error } = await admin
      .from("executive")
      .update({ auth_user_id: authUserId })
      .eq("id", target.id as string)
      .is("auth_user_id", null) // takeover-safe: no-op under a race
      .select("id, primary_email")
      .maybeSingle();
    if (error) {
      logSecurityEvent("exec_signin_link_conflict", { kind: "executive" });
      return null; // a real DB fault must not masquerade as success/non-membership
    }
    return claimed?.id ? { kind: "executive", id: claimed.id as string, email: claimed.primary_email as string } : null;
  }

  const target = eaMatches![0];
  const { data: claimed, error } = await admin
    .from("ea")
    .update({ auth_user_id: authUserId })
    .eq("id", target.id as string)
    .is("auth_user_id", null)
    .select("id, email")
    .maybeSingle();
  if (error) {
    logSecurityEvent("exec_signin_link_conflict", { kind: "ea" });
    return null;
  }
  return claimed?.id ? { kind: "ea", id: claimed.id as string, email: claimed.email as string } : null;
}
