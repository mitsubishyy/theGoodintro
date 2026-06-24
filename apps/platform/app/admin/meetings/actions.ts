"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { logAudit } from "@/lib/audit";
import { confirmMeeting, markHeld, releaseMeeting, rescheduleMeeting, reverseHeld } from "@/lib/meetings";
import { drainEmailQueue } from "@/lib/email/sender";
import { resendTransport } from "@/lib/email/transport";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

// NOTE: the canonical transition audits (meeting.confirmed/held/reversed/no_show/
// cancelled) are written INSIDE the 0027 RPCs, so these actions no longer log them
// — one audit per transition, written in one place. Reschedule and the email drain
// are not RPC transitions, so they keep their audit here.

export async function confirmMeetingAction(fd: FormData): Promise<void> {
  const { supabase } = await requireStaff();
  if (!(await getFlag("request_loop"))) return;
  const id = str(fd, "meeting_id");
  if (!id) return;
  const when = str(fd, "scheduled_at");
  const iso = when ? new Date(when).toISOString() : null;
  await confirmMeeting(supabase, id, iso, str(fd, "join_url") || null);
  revalidatePath("/admin/meetings");
}

export async function rescheduleMeetingAction(fd: FormData): Promise<void> {
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("request_loop"))) return;
  const id = str(fd, "meeting_id");
  if (!id) return;
  const when = str(fd, "scheduled_at");
  const iso = when ? new Date(when).toISOString() : null;
  const r = await rescheduleMeeting(supabase, id, iso, str(fd, "join_url") || null);
  if (r.ok) {
    await logAudit(supabase, staff.id, {
      action: "meeting.rescheduled",
      targetType: "meeting",
      targetId: id,
    });
  }
  revalidatePath("/admin/meetings");
}

export async function markHeldAction(fd: FormData): Promise<void> {
  const { supabase } = await requireStaff();
  if (!(await getFlag("request_loop"))) return;
  const id = str(fd, "meeting_id");
  if (!id) return;
  await markHeld(supabase, id, "admin");
  revalidatePath("/admin/meetings");
}

/**
 * Manual queue drain (A1). Stopgap trigger until the S6 cron exists; flag-gated
 * (email_sending, off by default) and a no-op without a Resend key, so it is
 * inert until Issy completes the provider/DNS setup.
 */
export async function sendQueuedEmailsAction(): Promise<void> {
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("email_sending"))) return;
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const summary = await drainEmailQueue(supabase, resendTransport(key));
  await logAudit(supabase, staff.id, {
    action: "email.drain",
    targetType: "notification",
    metadata: { ...summary },
  });
  revalidatePath("/admin/meetings");
}

export async function reverseHeldAction(fd: FormData): Promise<void> {
  const { supabase } = await requireStaff();
  if (!(await getFlag("request_loop"))) return;
  const id = str(fd, "meeting_id");
  if (!id) return;
  await reverseHeld(supabase, id);
  revalidatePath("/admin/meetings");
  revalidatePath("/admin/giving");
}

export async function releaseMeetingAction(fd: FormData): Promise<void> {
  const { supabase } = await requireStaff();
  if (!(await getFlag("request_loop"))) return;
  const id = str(fd, "meeting_id");
  const outcome = str(fd, "outcome") === "cancelled" ? "cancelled" : "no_show";
  if (!id) return;
  await releaseMeeting(supabase, id, outcome);
  revalidatePath("/admin/meetings");
}
