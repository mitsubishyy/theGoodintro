"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function markGiftPaidAction(fd: FormData): Promise<void> {
  const { staff, supabase } = await requireStaff();
  const id = String(fd.get("gift_id") ?? "").trim();
  if (!id) return;

  await supabase
    .from("gift_record")
    .update({
      status: "paid",
      confirmation: { paid_at: new Date().toISOString(), by: staff.id },
    })
    .eq("id", id)
    .eq("status", "released");

  await logAudit(supabase, staff.id, {
    action: "gift.paid",
    targetType: "gift_record",
    targetId: id,
  });
  revalidatePath("/admin/giving");
}
