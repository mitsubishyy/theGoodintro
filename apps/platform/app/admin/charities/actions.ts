"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { logAudit } from "@/lib/audit";

export type FormState = { error?: string; ok?: boolean };

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const DGR = ["endorsed", "unverified", "revoked"];

export async function createCharityAction(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("exec_onboarding")))
    return { error: "Executive onboarding is not enabled." };

  const name = str(fd, "name");
  if (!name) return { error: "Charity name is required." };
  const dgr_status = DGR.includes(str(fd, "dgr_status"))
    ? str(fd, "dgr_status")
    : "unverified";

  const { data, error } = await supabase
    .from("charity")
    .insert({ name, abn: str(fd, "abn") || null, dgr_status })
    .select("id")
    .single();
  if (error) return { error: error.message };

  await logAudit(supabase, staff.id, {
    action: "charity.created",
    targetType: "charity",
    targetId: data.id,
    metadata: { name },
  });
  revalidatePath("/admin/charities");
  return { ok: true };
}
