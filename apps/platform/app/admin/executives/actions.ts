"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { getFlag, getFlagAuthoritative } from "@/lib/flags";
import { logAudit } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveStaffSignInTarget, sendSignInLink } from "@/lib/exec-access";
import { logSecurityEvent } from "@/lib/security-log";

export type FormState = { error?: string; ok?: boolean };

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const orNull = (v: string) => (v === "" ? null : v);

const EXEC_STATUSES = ["invited", "set_up", "active", "paused", "left"];

export async function createExecutiveAction(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("exec_onboarding")))
    return { error: "Executive onboarding is not enabled." };

  const name = str(fd, "name");
  const primary_email = str(fd, "primary_email").toLowerCase();
  if (!name || !primary_email)
    return { error: "Name and primary email are required." };

  const { data, error } = await supabase
    .from("executive")
    .insert({
      name,
      primary_email,
      title: orNull(str(fd, "title")),
      company: orNull(str(fd, "company")),
      context_notes: orNull(str(fd, "context_notes")),
      suggested_cadence: orNull(str(fd, "suggested_cadence")),
      photo_url: orNull(str(fd, "photo_url")),
      default_charity_id: orNull(str(fd, "default_charity_id")),
      linkedin_url: orNull(str(fd, "linkedin_url")),
      status: "invited",
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  await logAudit(supabase, staff.id, {
    action: "executive.created",
    targetType: "executive",
    targetId: data.id,
    metadata: { name },
  });
  redirect(`/admin/executives/${data.id}`);
}

export async function updateExecutiveAction(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("exec_onboarding")))
    return { error: "Executive onboarding is not enabled." };

  const id = str(fd, "id");
  if (!id) return { error: "Missing executive id." };
  const name = str(fd, "name");
  const primary_email = str(fd, "primary_email").toLowerCase();
  if (!name || !primary_email)
    return { error: "Name and primary email are required." };

  const { error } = await supabase
    .from("executive")
    .update({
      name,
      primary_email,
      title: orNull(str(fd, "title")),
      company: orNull(str(fd, "company")),
      context_notes: orNull(str(fd, "context_notes")),
      suggested_cadence: orNull(str(fd, "suggested_cadence")),
      photo_url: orNull(str(fd, "photo_url")),
      default_charity_id: orNull(str(fd, "default_charity_id")),
      linkedin_url: orNull(str(fd, "linkedin_url")),
    })
    .eq("id", id);
  if (error) return { error: error.message };

  await logAudit(supabase, staff.id, {
    action: "executive.updated",
    targetType: "executive",
    targetId: id,
  });
  revalidatePath(`/admin/executives/${id}`);
  return { ok: true };
}

export async function setExecutiveStatusAction(fd: FormData): Promise<void> {
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("exec_onboarding"))) return;

  const id = str(fd, "id");
  const status = str(fd, "status");
  if (!id || !EXEC_STATUSES.includes(status)) return;

  const { error } = await supabase
    .from("executive")
    .update({ status })
    .eq("id", id);
  if (!error) {
    await logAudit(supabase, staff.id, {
      action: "executive.status_changed",
      targetType: "executive",
      targetId: id,
      metadata: { status },
    });
  }
  revalidatePath(`/admin/executives/${id}`);
}

export async function linkEaAction(fd: FormData): Promise<void> {
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("exec_onboarding"))) return;

  const execId = str(fd, "executive_id");
  if (!execId) return;

  let eaId = str(fd, "ea_id");
  if (eaId === "__new__") {
    const name = str(fd, "ea_name");
    const email = str(fd, "ea_email").toLowerCase();
    if (!name || !email) return;
    const { data, error } = await supabase
      .from("ea")
      .insert({ name, email })
      .select("id")
      .single();
    if (error) return;
    eaId = data.id;
    await logAudit(supabase, staff.id, {
      action: "ea.created",
      targetType: "ea",
      targetId: eaId,
    });
  }
  if (!eaId) return;

  await supabase.from("executive").update({ ea_id: eaId }).eq("id", execId);
  await supabase
    .from("ea_assignment")
    .upsert({ ea_id: eaId, executive_id: execId }, { onConflict: "ea_id,executive_id" });
  await logAudit(supabase, staff.id, {
    action: "executive.ea_linked",
    targetType: "executive",
    targetId: execId,
    actingForExecutiveId: execId,
    metadata: { ea_id: eaId },
  });
  revalidatePath(`/admin/executives/${execId}`);
}

async function sendStaffAccessLink(email: string): Promise<FormState> {
  if (!(await getFlagAuthoritative("exec_ea_login"))) return { error: "Sign-in links are not enabled." };
  const clean = email.trim().toLowerCase();
  if (!clean) return { error: "No email provided." };

  const admin = createAdminClient();
  if (!admin) return { error: "The server is not configured to send sign-in links." };

  const target = await resolveStaffSignInTarget(admin, clean);
  if (target.status === "none") return { error: "No executive or assistant is on file for that email." };
  if (target.status === "ambiguous") {
    logSecurityEvent("exec_signin_ambiguous_email", { matches: target.matches, by: "staff" });
    return { error: "That email matches more than one record. Resolve the duplicate before sending an access link." };
  }

  await sendSignInLink(target.subject.email, true);
  logSecurityEvent("exec_signin_link_provisioned", { kind: target.subject.kind, by: "staff" });
  return { ok: true };
}

/** Staff support: send a sign-in link to the executive on this admin detail page. */
export async function sendExecutiveAccessLinkAction(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await requireStaff();
  return sendStaffAccessLink(str(fd, "email"));
}

/** Staff support: send a sign-in link to the current EA on this admin detail page. */
export async function sendEaAccessLinkAction(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await requireStaff();
  return sendStaffAccessLink(str(fd, "email"));
}

/**
 * Staff support: clear the executive's bound auth user without deleting the
 * executive. This is the manual revoke path for already-bound read-only RLS
 * access; the exec can re-bind later via a fresh access link.
 */
export async function clearExecutiveAccessAction(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const { staff, supabase } = await requireStaff();
  const id = str(fd, "id");
  if (!id) return { error: "Missing executive id." };

  const { error } = await supabase.from("executive").update({ auth_user_id: null }).eq("id", id);
  if (error) return { error: error.message };

  await logAudit(supabase, staff.id, {
    action: "executive.access_cleared",
    targetType: "executive",
    targetId: id,
    actingForExecutiveId: id,
  });
  revalidatePath(`/admin/executives/${id}`);
  return { ok: true };
}

/**
 * Staff support: clear a bound EA auth user without removing the EA assignment.
 * This revokes the current session's RLS scope while preserving the relationship
 * so staff can send a new access link when ready.
 */
export async function clearEaAccessAction(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const { staff, supabase } = await requireStaff();
  const eaId = str(fd, "ea_id");
  const execId = str(fd, "executive_id");
  if (!eaId || !execId) return { error: "Missing assistant id." };

  const { error } = await supabase.from("ea").update({ auth_user_id: null }).eq("id", eaId);
  if (error) return { error: error.message };

  await logAudit(supabase, staff.id, {
    action: "ea.access_cleared",
    targetType: "ea",
    targetId: eaId,
    actingForExecutiveId: execId,
  });
  revalidatePath(`/admin/executives/${execId}`);
  return { ok: true };
}
