"use server";

import { revalidatePath } from "next/cache";
import { getVendor } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { isOwnAvatarUrl } from "@/lib/upload/url";
import { createAdminClient } from "@/lib/supabase/admin";

export type VendorSettingsState = { ok?: boolean; error?: string };

/**
 * Resolve the signed-in vendor user from THEIR session. The id we write with is
 * always the session-resolved one, never client-supplied, so the service-role
 * write below can only ever touch the caller's own row.
 */
async function ownVendorUser(): Promise<{ id: string } | null> {
  const result = await getVendor();
  const vu = result?.vendorUser as { id?: string } | null | undefined;
  return vu?.id ? { id: vu.id } : null;
}

/**
 * Vendor self-serve: persist a newly uploaded avatar (or clear it). The bytes
 * already went through the upload route (validate + re-encode + storage write
 * under the vendor's own path-scoped session). vendor_user writes are staff-only
 * under RLS (0003), so the column write goes through the service-role client
 * after the server has resolved the caller's OWN vendor_user id — the documented
 * "vendor self-serve writes go through the server with explicit validation" path.
 */
export async function saveVendorPhotoAction(photoUrl: string | null): Promise<VendorSettingsState> {
  if (!(await getFlag("vendor_photo_upload"))) return { error: "Photo upload is not enabled." };
  const vu = await ownVendorUser();
  if (!vu) return { error: "Not authorized." };
  const admin = createAdminClient();
  if (!admin) return { error: "Photo upload is not available right now." };

  const url = (photoUrl ?? "").trim();
  if (url && !isOwnAvatarUrl(url)) return { error: "That photo could not be saved." };

  const { error } = await admin.from("vendor_user").update({ photo_url: url || null }).eq("id", vu.id);
  if (error) return { error: "Could not save your photo." };

  await admin.from("audit_entry").insert({
    actor_type: "vendor_user",
    actor_id: vu.id,
    action: url ? "vendor_user.photo_updated" : "vendor_user.photo_removed",
    target_type: "vendor_user",
    target_id: vu.id,
    metadata: { self: true },
  });
  revalidatePath("/vendor/settings");
  return { ok: true };
}

/**
 * Vendor self-serve: update the editable profile fields (name only for now;
 * email is the sign-in identity and stays read-only until a verification flow
 * exists). Same service-role + own-id pattern as the photo save.
 */
export async function saveVendorProfileAction(input: { name: string }): Promise<VendorSettingsState> {
  const vu = await ownVendorUser();
  if (!vu) return { error: "Not authorized." };
  const admin = createAdminClient();
  if (!admin) return { error: "Could not save your changes right now." };

  const name = (input.name ?? "").trim().slice(0, 200);
  if (!name) return { error: "Name is required." };

  const { error } = await admin.from("vendor_user").update({ name }).eq("id", vu.id);
  if (error) return { error: "Could not save your changes." };

  await admin.from("audit_entry").insert({
    actor_type: "vendor_user",
    actor_id: vu.id,
    action: "vendor_user.profile_updated",
    target_type: "vendor_user",
    target_id: vu.id,
    metadata: { fields: ["name"] },
  });
  revalidatePath("/vendor/settings");
  return { ok: true };
}
