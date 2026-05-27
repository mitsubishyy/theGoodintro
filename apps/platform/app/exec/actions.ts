"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { logAudit } from "@/lib/audit";
import { resolveDemoExecutiveId } from "./data";

export type ExecActionState = { ok?: boolean; error?: string };

/**
 * Set the executive's standing-nomination (default) charity. Flag-gated
 * (exec_dashboard) and recorded in the append-only audit log. In the demo the
 * caller is the synthetic admin session, so the change is logged as staff acting
 * for the executive — the same shape the real EA-acting-for-exec path will use.
 */
export async function setStandingNominationAction(
  charityId: string,
): Promise<ExecActionState> {
  if (!(await getFlag("exec_dashboard"))) return { error: "Executive dashboard is not enabled." };
  if (!charityId) return { error: "No charity selected." };

  const supabase = await createClient();

  // Only allow charities that exist and are DGR-endorsed (defence in depth;
  // RLS still applies on the update itself).
  const { data: charity } = await supabase
    .from("charity")
    .select("id, dgr_status")
    .eq("id", charityId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!charity || charity.dgr_status !== "endorsed") {
    return { error: "That charity is not available." };
  }

  const execId = await resolveDemoExecutiveId(supabase);
  if (!execId) return { error: "No executive found." };

  const { error } = await supabase
    .from("executive")
    .update({ default_charity_id: charityId })
    .eq("id", execId);
  if (error) return { error: error.message };

  const staff = (await getStaff())?.staff;
  if (staff) {
    await logAudit(supabase, staff.id, {
      action: "executive.standing_nomination_changed",
      targetType: "executive",
      targetId: execId,
      actingForExecutiveId: execId,
      metadata: { charity_id: charityId },
    });
  }

  revalidatePath("/exec");
  return { ok: true };
}
