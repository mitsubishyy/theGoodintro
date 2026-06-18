"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { logAudit } from "@/lib/audit";
import { isOwnAvatarUrl } from "@/lib/upload/url";

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

/**
 * Persist a charity's logo + hero image URLs (file-upload only). The bytes
 * already went through the upload route (validate + sharp re-encode + storage
 * write); this writes the returned public URLs, each origin-checked to our own
 * avatars bucket so a crafted call cannot point at an arbitrary external image.
 * An empty value clears the column (falls back to the initials / tint render).
 */
export async function updateCharityImagesAction(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const { staff, supabase } = await requireStaff();
  if (!(await getFlag("exec_onboarding")))
    return { error: "Executive onboarding is not enabled." };

  const id = str(fd, "id");
  if (!id) return { error: "Missing charity id." };
  const logo = str(fd, "logo_url");
  const hero = str(fd, "hero_image_url");
  if (logo && !isOwnAvatarUrl(logo)) return { error: "That logo image could not be saved." };
  if (hero && !isOwnAvatarUrl(hero)) return { error: "That hero image could not be saved." };

  const { error } = await supabase
    .from("charity")
    .update({ logo_url: logo || null, hero_image_url: hero || null })
    .eq("id", id);
  if (error) return { error: error.message };

  await logAudit(supabase, staff.id, {
    action: "charity.images_updated",
    targetType: "charity",
    targetId: id,
    metadata: { logo: Boolean(logo), hero: Boolean(hero) },
  });
  revalidatePath(`/admin/charities/${id}`);
  revalidatePath("/admin/charities");
  return { ok: true };
}
