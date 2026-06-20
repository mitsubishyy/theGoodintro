import { NextResponse } from "next/server";
import { getStaff, getVendor } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { createClient } from "@/lib/supabase/server";
import { ASSET_SPECS, processImage, objectPath, MAX_BYTES, type AssetEntity } from "@/lib/upload/photo";
import { AVATAR_BUCKET } from "@/lib/upload/url";

// sharp needs the Node runtime (not edge).
export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fail = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status });

/**
 * Photo upload (PHOTO_UPLOAD_SCOPE.md). Upload-only: this route validates,
 * re-encodes (the security control) and stores the image, then returns a stable
 * public URL. It does NOT write any column; the caller persists the URL through
 * its existing audited save path. The `exec` + charity entities are staff-only
 * under the `photo_upload` flag; the `vendor-user` entity is the Pass B vendor
 * slice under the `vendor_photo_upload` flag (vendor self-serve OR admin override).
 */
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("Invalid upload.", 400);
  }

  const entity = String(form.get("entity") ?? "") as AssetEntity;
  const spec = ASSET_SPECS[entity];
  if (!spec) return fail("Unknown asset type.", 400);

  const ownerId = String(form.get("ownerId") ?? "").trim();
  if (!UUID_RE.test(ownerId)) return fail("Invalid target id.", 400);

  // Flag + authz by entity, BEFORE any processing. The session client below is
  // RLS-bound, so the storage policy is the real enforcement; these are the
  // friendly 403s plus defense-in-depth.
  if (entity === "vendor-user") {
    if (!(await getFlag("vendor_photo_upload"))) return fail("Photo upload is not enabled.", 403);
    // Staff may upload for any vendor (admin override). Otherwise the caller
    // must be the vendor who owns this row; the path-scoped RLS (0026) enforces
    // the same constraint at the database, so a forged ownerId fails either way.
    const staff = (await getStaff())?.staff;
    if (!staff) {
      const vendorUser = (await getVendor())?.vendorUser;
      if (!vendorUser || vendorUser.id !== ownerId) return fail("Not authorized.", 403);
    }
  } else {
    if (!(await getFlag("photo_upload"))) return fail("Photo upload is not enabled.", 403);
    const staff = (await getStaff())?.staff;
    if (!staff) return fail("Not authorized.", 403);
  }

  const file = form.get("file");
  if (!(file instanceof File)) return fail("No file provided.", 400);
  if (file.size > MAX_BYTES) return fail("Image must be 1MB or smaller.", 400);

  const input = Buffer.from(await file.arrayBuffer());
  const processed = await processImage(input, spec.variant);
  if (!processed.ok) return fail(processed.error, 400);

  const path = objectPath(entity, ownerId, spec.variant, processed.hash);
  const supabase = await createClient();
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, processed.buffer, { contentType: processed.contentType, upsert: true });
  if (error) return fail("Upload failed.", 500);

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return NextResponse.json({ ok: true, url: data.publicUrl, path });
}
