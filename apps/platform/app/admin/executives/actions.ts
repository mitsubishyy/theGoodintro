"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { logAudit } from "@/lib/audit";

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
