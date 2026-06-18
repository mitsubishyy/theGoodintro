/**
 * Client-side helper to POST a selected file to the upload route. Plain async
 * function (no sharp / no server imports) so it is safe to call from client
 * components (admin form control + exec Profile camera chip). The route does the
 * authz + validate + sharp re-encode + storage write and returns a stable public
 * URL; the caller then persists it via its existing save path.
 */

export type UploadResult = { url: string } | { error: string };

export async function uploadPhotoFile(
  file: File,
  entity: "exec" | "charity-logo" | "charity-hero",
  ownerId: string,
): Promise<UploadResult> {
  const fd = new FormData();
  fd.set("file", file);
  fd.set("entity", entity);
  fd.set("ownerId", ownerId);

  let res: Response;
  try {
    res = await fetch("/api/upload/photo", { method: "POST", body: fd });
  } catch {
    return { error: "Upload failed. Check your connection and try again." };
  }
  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; url?: string; error?: string };
  if (!res.ok || !json.ok || !json.url) {
    return { error: json.error || "Upload failed." };
  }
  return { url: json.url };
}
