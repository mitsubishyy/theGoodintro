import { NextResponse } from "next/server";
import { getStaff } from "@/lib/auth";
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
 * its existing audited save path. v1 is staff-only (exec + charity); vendor
 * self-serve is Pass B behind its own flag.
 */
export async function POST(req: Request) {
  if (!(await getFlag("photo_upload"))) return fail("Photo upload is not enabled.", 403);

  // Authz BEFORE any processing. Session client is RLS-bound, so the storage
  // INSERT policy (staff-only) is the real enforcement; this is the friendly 403.
  const staff = (await getStaff())?.staff;
  if (!staff) return fail("Not authorized.", 403);

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
