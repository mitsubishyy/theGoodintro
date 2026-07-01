"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { logAudit } from "@/lib/audit";
import { redirect } from "next/navigation";
import { confirmMeeting, createProposedMeeting, markHeld, releaseMeeting, rescheduleMeeting, reverseHeld } from "@/lib/meetings";
import { parseNewMeetingForm } from "@/lib/meetings-form";
import { drainEmailQueue } from "@/lib/email/sender";
import { resendTransport } from "@/lib/email/transport";

export type FormState = { error?: string };

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

export async function createMeetingAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("request_loop"))) return { error: "Meeting scheduling is not enabled." };

  const parsed = parseNewMeetingForm({
    vendorId: str(fd, "vendor_id"),
    executiveId: str(fd, "executive_id"),
    charityId: str(fd, "charity_id"),
    q1What: str(fd, "q1_what"),
    q2Why: str(fd, "q2_why"),
    scheduledAt: str(fd, "scheduled_at"),
    joinUrl: str(fd, "join_url"),
  });
  if (!parsed.ok) return { error: parsed.error };
  const v = parsed.value;

  const created = await createProposedMeeting(supabase, {
    vendorId: v.vendorId,
    executiveId: v.executiveId,
    charityId: v.charityId,
    q1What: v.q1What,
    q2Why: v.q2Why,
  });
  if (!created.ok) {
    return {
      error:
        created.error === "no_vendor_user"
          ? "This vendor has no users to attribute the request to."
          : created.error === "no_charity"
            ? "Pick a charity (this executive has no default charity)."
            : `Could not create the meeting: ${created.error}`,
    };
  }

  // Confirm a time now if one was given (reserve a credit, else schedule overcommit).
  if (v.scheduledAtISO) {
    await confirmMeeting(supabase, created.meetingId, v.scheduledAtISO, v.joinUrl);
  }

  await logAudit(supabase, staff.id, {
    action: "meeting.created",
    targetType: "meeting",
    targetId: created.meetingId,
    metadata: { vendorId: v.vendorId, executiveId: v.executiveId, scheduled: Boolean(v.scheduledAtISO) },
  });
  revalidatePath("/admin/meetings");
  redirect("/admin/meetings");
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
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("request_loop"))) return;
  const id = str(fd, "meeting_id");
  if (!id) return;
  const r = await reverseHeld(supabase, id);
  if (r.ok) {
    await logAudit(supabase, staff.id, {
      action: "meeting.reversed",
      targetType: "meeting",
      targetId: id,
      metadata: { detail: r.detail },
    });
  }
  revalidatePath("/admin/meetings");
  revalidatePath("/admin/giving");
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
