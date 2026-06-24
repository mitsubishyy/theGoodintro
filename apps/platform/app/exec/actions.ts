"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { logAudit } from "@/lib/audit";
import { isOwnAvatarUrl } from "@/lib/upload/url";
import { resolveDemoExecutiveId, loadCharityContent, loadCharityList, type CharityContent, type CharityListItem } from "./data";

export type ExecActionState = { ok?: boolean; error?: string };

/**
 * The endorsed charity set + the exec's current standing charity, for the
 * picker modal. On-demand (flag-gated, staff RLS) so no loader carries it.
 */
export async function getCharityListAction(): Promise<{ charities: CharityListItem[]; currentId: string | null }> {
  if (!(await getFlag("exec_dashboard"))) return { charities: [], currentId: null };
  // Staff-only for now: the /exec portal is staff-operated until slice 2d builds
  // the exec/EA access model. Fail closed on identity, not on RLS alone.
  if (!(await getStaff())?.staff) return { charities: [], currentId: null };
  const supabase = await createClient();
  const execId = await resolveDemoExecutiveId(supabase);
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
  if (!(await getStaff())?.staff) return null;
  const supabase = await createClient();
  return loadCharityContent(supabase, charityId);
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
 * Set the executive's standing-nomination (default) charity. Flag-gated
 * (exec_dashboard), staff-gated, and recorded in the append-only audit log. In
 * the demo the caller is the synthetic admin session, so the change is logged as
 * staff acting for the executive — the same shape the real EA-acting-for-exec
 * path will use. The default_charity_id flip + the nomination_history close/open
 * run atomically inside the set_standing_nomination plpgsql function (migration
 * 0022; charity validation + the one-open-row invariant live there) so a partial
 * failure can never leave the executive with zero open nomination rows.
 */
export async function setStandingNominationAction(
  charityId: string,
): Promise<ExecActionState> {
  if (!(await getFlag("exec_dashboard"))) return { error: "Executive dashboard is not enabled." };
  if (!charityId) return { error: "No charity selected." };

  const supabase = await createClient();
  const staff = (await getStaff())?.staff;
  if (!staff) return { error: "Not authorized." };

  const execId = await resolveDemoExecutiveId(supabase);
  if (!execId) return { error: "No executive found." };

  const { error } = await supabase.rpc("set_standing_nomination", { p_executive_id: execId, p_charity_id: charityId });
  if (error) return { error: error.message };

  await logAudit(supabase, staff.id, {
    action: "executive.standing_nomination_changed",
    targetType: "executive",
    targetId: execId,
    actingForExecutiveId: execId,
    metadata: { charity_id: charityId },
  });

  revalidatePath("/exec");
  revalidatePath("/exec/my-charity");
  return { ok: true };
}
