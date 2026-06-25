"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStaff, getExecPrincipal } from "@/lib/auth";
import { getFlag, getFlagAuthoritative } from "@/lib/flags";
import { logAudit } from "@/lib/audit";
import { isOwnAvatarUrl } from "@/lib/upload/url";
import { resolveExecOrEaByEmail, sendSignInLink } from "@/lib/exec-access";
import { logSecurityEvent } from "@/lib/security-log";
import { resolveDemoExecutiveId, loadCharityContent, loadCharityList, type CharityContent, type CharityListItem } from "./data";

export type ExecActionState = { ok?: boolean; error?: string };

/**
 * The endorsed charity set + the exec's current standing charity, for the
 * picker modal. On-demand (flag-gated, staff RLS) so no loader carries it.
 */
export async function getCharityListAction(): Promise<{ charities: CharityListItem[]; currentId: string | null }> {
  if (!(await getFlag("exec_dashboard"))) return { charities: [], currentId: null };
  // Authorize the principal (staff OR the owning exec/EA), then read under their
  // session RLS. Fail closed on identity, not on RLS alone.
  const principal = await getExecPrincipal();
  if (!principal) return { charities: [], currentId: null };
  const supabase = principal.supabase;
  const execId = principal.execId ?? (await resolveDemoExecutiveId(supabase));
  const charities = await loadCharityList(supabase);
  let currentId: string | null = null;
  if (execId) {
    const { data } = await supabase.from("executive").select("default_charity_id").eq("id", execId).maybeSingle();
    currentId = (data?.default_charity_id as string) ?? null;
  }
  return { charities, currentId };
}

/**
 * Fetch the curated content for a charity's DETAIL modal (exec-dashboard VP4 /
 * My charity VP3 / Impact "Learn about"). On-demand so no loader carries the
 * content; the modal calls this on open. Flag-gated; reads under the staff
 * session RLS, the same demo pattern as the dashboard.
 */
export async function getCharityContentAction(charityId: string): Promise<CharityContent | null> {
  if (!(await getFlag("exec_dashboard"))) return null;
  if (!charityId) return null;
  const principal = await getExecPrincipal();
  if (!principal) return null;
  return loadCharityContent(principal.supabase, charityId);
}

/* ── Profile per-section saves (exec-profile lock). Each is flag-gated, resolves
   the demo executive, updates only its section's columns under the staff session
   (the staff-acting-for-exec pattern), and appends an audit entry. Inline-edit
   sections: You, Business context, Calendar window, Requests (pause). EA add/edit
   + photo upload depend on email/upload machinery that is not wired and stay
   inert in the UI. ── */

function clean(v: unknown, max = 2000): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return s ? s.slice(0, max) : null;
}

async function updateExecProfile(updates: Record<string, unknown>, auditAction: string): Promise<ExecActionState> {
  if (!(await getFlag("exec_dashboard"))) return { error: "Executive portal is not enabled." };
  const supabase = await createClient();
  // Explicit staff gate — authorization does not rest on RLS alone, and the
  // audit row is then guaranteed (not a silent `if (staff)` skip). This is the
  // sanctioned staff-acting-for-exec path; the real EA/exec path will reuse it.
  const staff = (await getStaff())?.staff;
  if (!staff) return { error: "Not authorized." };
  const execId = await resolveDemoExecutiveId(supabase);
  if (!execId) return { error: "No executive found." };

  const { error } = await supabase.from("executive").update(updates).eq("id", execId);
  if (error) return { error: error.message };

  await logAudit(supabase, staff.id, { action: auditAction, targetType: "executive", targetId: execId, actingForExecutiveId: execId, metadata: { fields: Object.keys(updates) } });
  revalidatePath("/exec/profile");
  revalidatePath("/exec");
  return { ok: true };
}

export async function saveProfileYouAction(input: { name: string; title: string; company: string; email: string; linkedinUrl: string }): Promise<ExecActionState> {
  const email = clean(input.email, 320);
  if (!email) return { error: "Email is required." };
  const name = clean(input.name, 200);
  if (!name) return { error: "Name is required." };
  return updateExecProfile(
    { name, title: clean(input.title, 200), company: clean(input.company, 200), primary_email: email, linkedin_url: clean(input.linkedinUrl, 500) },
    "executive.profile_you_updated",
  );
}

export async function saveProfileBusinessAction(input: {
  interestedIn: string;
  currentProjects: string;
  notInterestedIn: string;
  timeline: string;
  cadence: string;
  seniority: string;
}): Promise<ExecActionState> {
  return updateExecProfile(
    {
      interested_in: clean(input.interestedIn),
      current_projects: clean(input.currentProjects),
      not_interested_in: clean(input.notInterestedIn),
      timeline: clean(input.timeline, 200),
      suggested_cadence: clean(input.cadence, 200),
      seniority_signal: clean(input.seniority, 200),
    },
    "executive.profile_business_updated",
  );
}

export async function saveProfileCalendarAction(input: { timezone: string; windowDays: string; windowStart: string; windowEnd: string }): Promise<ExecActionState> {
  return updateExecProfile(
    {
      timezone: clean(input.timezone, 64),
      preferred_window_days: clean(input.windowDays, 32),
      preferred_window_start: clean(input.windowStart, 8),
      preferred_window_end: clean(input.windowEnd, 8),
    },
    "executive.profile_calendar_updated",
  );
}

/**
 * Persist a newly uploaded profile photo (or clear it). The bytes already went
 * through the upload route (validate + sharp re-encode + storage write); this
 * only writes the returned public URL onto the executive, under the same
 * staff-acting-for-exec path + audit as the other Profile saves. The URL is
 * origin-checked to our own avatars bucket so a crafted call cannot point the
 * avatar at an arbitrary external image (the upload-only rule).
 */
export async function saveProfilePhotoAction(photoUrl: string | null): Promise<ExecActionState> {
  if (!(await getFlag("photo_upload"))) return { error: "Photo upload is not enabled." };
  const url = (photoUrl ?? "").trim();
  if (url && !isOwnAvatarUrl(url)) return { error: "That photo could not be saved." };
  return updateExecProfile(
    { photo_url: url || null },
    url ? "executive.profile_photo_updated" : "executive.profile_photo_removed",
  );
}

export async function setRequestPauseAction(paused: boolean): Promise<ExecActionState> {
  // The pause toggle is ONLY the active<->paused edge. executive.status is a
  // lifecycle enum (invited/set_up/active/paused/left); never resurrect a 'left'
  // exec or skip onboarding by force-writing 'active'. Guard the transition (the
  // same edge the admin status machine encodes), then delegate the write.
  if (!(await getFlag("exec_dashboard"))) return { error: "Executive portal is not enabled." };
  const supabase = await createClient();
  // Establish staff identity before any executive read (action-level consistency).
  if (!(await getStaff())?.staff) return { error: "Not authorized." };
  const execId = await resolveDemoExecutiveId(supabase);
  if (!execId) return { error: "No executive found." };
  const { data: row } = await supabase.from("executive").select("status").eq("id", execId).maybeSingle();
  const current = row?.status as string | undefined;
  if (paused) {
    if (current === "paused") return { ok: true };
    if (current !== "active") return { error: "Requests can only be paused for an active executive." };
  } else {
    if (current === "active") return { ok: true };
    if (current !== "paused") return { error: "Requests can only be resumed for a paused executive." };
  }
  return updateExecProfile({ status: paused ? "paused" : "active" }, paused ? "executive.requests_paused" : "executive.requests_resumed");
}

/**
 * Set the standing-nomination (default) charity — the single write the v1 exec
 * portal grants an executive/EA (everything else is read-only). Flag-gated
 * (exec_dashboard). Two authorization paths, both ending in the SAME atomic
 * nomination core (migration 0030's private.apply_standing_nomination; charity
 * validation + the one-open-row invariant live there, so a partial failure can
 * never leave the executive with zero open nomination rows):
 *  - staff (the demo / admin-acting surface): set_standing_nomination, audited at
 *    the action layer as staff acting for the executive (unchanged behaviour);
 *  - the owning exec or their assigned EA: request_standing_nomination, which is
 *    scope-checked (private.can_access_executive) and self-audits as the acting
 *    principal inside the SECURITY DEFINER function (an exec/EA session cannot
 *    insert audit_entry under RLS).
 */
export async function setStandingNominationAction(
  charityId: string,
): Promise<ExecActionState> {
  if (!(await getFlag("exec_dashboard"))) return { error: "Executive dashboard is not enabled." };
  if (!charityId) return { error: "No charity selected." };

  const principal = await getExecPrincipal();
  if (!principal) return { error: "Not authorized." };
  const supabase = principal.supabase;
  const execId = principal.execId ?? (await resolveDemoExecutiveId(supabase));
  if (!execId) return { error: "No executive found." };

  if (principal.kind === "staff") {
    const { error } = await supabase.rpc("set_standing_nomination", { p_executive_id: execId, p_charity_id: charityId });
    if (error) return { error: error.message };
    if (principal.staffId) {
      await logAudit(supabase, principal.staffId, {
        action: "executive.standing_nomination_changed",
        targetType: "executive",
        targetId: execId,
        actingForExecutiveId: execId,
        metadata: { charity_id: charityId },
      });
    }
  } else {
    // The exec/EA self-service path: scope-checked + self-auditing in the DB.
    const { error } = await supabase.rpc("request_standing_nomination", { p_executive_id: execId, p_charity_id: charityId });
    if (error) return { error: error.message };
  }

  revalidatePath("/exec");
  revalidatePath("/exec/my-charity");
  return { ok: true };
}

/**
 * Staff "send access link" provisioning (slice 2d): resolve an executive or EA by
 * email and send them a passwordless sign-in link, so staff can grant portal
 * access on demand (the locked EA drawer's "Send access link", and the exec
 * equivalent). Staff-gated + flag-gated (exec_ea_login). Membership is resolved
 * under the service role (authoritative across RLS); the send reuses the same OTP
 * path as the self-service /login. Because this is staff-triggered, telling the
 * operator there is no record for an email is fine — it is not a public
 * enumeration oracle (contrast the self-service path, which never reveals).
 */
export async function sendAccessLinkAction(email: string): Promise<ExecActionState> {
  if (!(await getFlagAuthoritative("exec_ea_login"))) return { error: "Sign-in links are not enabled." };
  const clean = (email ?? "").trim().toLowerCase();
  if (!clean) return { error: "No email provided." };
  if (!(await getStaff())?.staff) return { error: "Not authorized." };

  const admin = createAdminClient();
  if (!admin) return { error: "The server is not configured to send sign-in links." };

  const member = await resolveExecOrEaByEmail(admin, clean);
  if (!member) return { error: "No executive or assistant is on file for that email." };

  // member confirmed -> shouldCreateUser true (a never-logged-in exec/EA has no
  // auth user yet); the sign-in link binds auth_user_id on first click.
  await sendSignInLink(member.email, true);
  logSecurityEvent("exec_signin_link_provisioned", { kind: member.kind, by: "staff" });
  return { ok: true };
}
