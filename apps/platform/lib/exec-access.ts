import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { appBaseUrl } from "@/lib/app-url";

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

/**
 * Send a sign-in link to `email`. `shouldCreateUser` is true because a member's
 * auth user does not exist until their first sign-in (most execs never log in);
 * the auth_user_id link is established on the landing route. Errors (including the
 * email-send rate limit) are swallowed so the caller's response never depends on
 * the outcome.
 */
export async function sendSignInLink(email: string): Promise<void> {
  try {
    await anonClient().auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, emailRedirectTo: signInRedirectTo() },
    });
  } catch {
    // Deliberately ignored — account safety depends on a constant response.
  }
}

/**
 * Self-service entry: resolve membership, and ONLY send a link to a real exec/EA
 * (the locked rule: "unknown addresses send nothing"). ALWAYS returns void and
 * swallows everything, so a known and an unknown email are indistinguishable to
 * the caller — no account enumeration.
 */
export async function requestExecEaSignInLink(
  admin: SupabaseClient,
  email: string,
): Promise<void> {
  const member = await resolveExecOrEaByEmail(admin, email);
  if (member) await sendSignInLink(member.email);
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
  // Already linked (a returning sign-in) — nothing to write.
  const { data: linkedExec } = await admin
    .from("executive")
    .select("id, primary_email")
    .eq("auth_user_id", authUserId)
    .is("deleted_at", null)
    .maybeSingle();
  if (linkedExec?.id) return { kind: "executive", id: linkedExec.id as string, email: linkedExec.primary_email as string };

  const { data: linkedEa } = await admin
    .from("ea")
    .select("id, email")
    .eq("auth_user_id", authUserId)
    .is("deleted_at", null)
    .maybeSingle();
  if (linkedEa?.id) return { kind: "ea", id: linkedEa.id as string, email: linkedEa.email as string };

  const needle = ilikeLiteral(email.trim());
  if (!needle) return null;

  // Claim an unlinked executive whose email matches. The .is("auth_user_id", null)
  // guard makes the write a no-op under a race, so two concurrent first sign-ins
  // can never both claim the row.
  const { data: execMatch } = await admin
    .from("executive")
    .select("id")
    .ilike("primary_email", needle)
    .is("deleted_at", null)
    .is("auth_user_id", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (execMatch?.id) {
    const { data: claimed } = await admin
      .from("executive")
      .update({ auth_user_id: authUserId })
      .eq("id", execMatch.id as string)
      .is("auth_user_id", null)
      .select("id, primary_email")
      .maybeSingle();
    if (claimed?.id) return { kind: "executive", id: claimed.id as string, email: claimed.primary_email as string };
  }

  const { data: eaMatch } = await admin
    .from("ea")
    .select("id")
    .ilike("email", needle)
    .is("deleted_at", null)
    .is("auth_user_id", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (eaMatch?.id) {
    const { data: claimed } = await admin
      .from("ea")
      .update({ auth_user_id: authUserId })
      .eq("id", eaMatch.id as string)
      .is("auth_user_id", null)
      .select("id, email")
      .maybeSingle();
    if (claimed?.id) return { kind: "ea", id: claimed.id as string, email: claimed.email as string };
  }

  return null;
}
