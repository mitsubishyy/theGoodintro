"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { markGiftPaid } from "@/lib/gifts";

export async function markGiftPaidAction(fd: FormData): Promise<void> {
  const { staff, supabase } = await requireStaff();
  const id = String(fd.get("gift_id") ?? "").trim();
  if (!id) return;

  const r = await markGiftPaid(supabase, id, staff.id);
  if (r.ok) {
    await logAudit(supabase, staff.id, {
      action: "gift.paid",
      targetType: "gift_record",
      targetId: id,
    });
  }
  revalidatePath("/admin/giving");
}
