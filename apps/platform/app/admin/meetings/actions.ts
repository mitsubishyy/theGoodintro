"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { logAudit } from "@/lib/audit";
import { confirmMeeting, markHeld, releaseMeeting } from "@/lib/meetings";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function confirmMeetingAction(fd: FormData): Promise<void> {
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("request_loop"))) return;
  const id = str(fd, "meeting_id");
  if (!id) return;
  const when = str(fd, "scheduled_at");
  const iso = when ? new Date(when).toISOString() : null;
  const r = await confirmMeeting(supabase, id, iso, str(fd, "join_url") || null);
  if (r.ok) {
    await logAudit(supabase, staff.id, {
      action: "meeting.confirmed",
      targetType: "meeting",
      targetId: id,
      metadata: { detail: r.detail },
    });
  }
  revalidatePath("/admin/meetings");
}

export async function markHeldAction(fd: FormData): Promise<void> {
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("request_loop"))) return;
  const id = str(fd, "meeting_id");
  if (!id) return;
  const r = await markHeld(supabase, id, "admin");
  if (r.ok) {
    await logAudit(supabase, staff.id, { action: "meeting.held", targetType: "meeting", targetId: id });
  }
  revalidatePath("/admin/meetings");
}

export async function releaseMeetingAction(fd: FormData): Promise<void> {
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("request_loop"))) return;
  const id = str(fd, "meeting_id");
  const outcome = str(fd, "outcome") === "cancelled" ? "cancelled" : "no_show";
  if (!id) return;
  const r = await releaseMeeting(supabase, id, outcome);
  if (r.ok) {
    await logAudit(supabase, staff.id, {
      action: `meeting.${outcome}`,
      targetType: "meeting",
      targetId: id,
    });
  }
  revalidatePath("/admin/meetings");
}
