/**
 * Light helpers for the photo bucket's public URLs. No sharp / file-type import,
 * so this is safe for server actions (and would be safe client-side). The route
 * handler stores the full public URL in the *_url column; these guard that a
 * column write only ever accepts a URL in OUR own bucket (upload-only rule), so
 * a crafted action call cannot point an avatar at an arbitrary external image.
 */

export const AVATAR_BUCKET = "public-avatars";

/** `${SUPABASE_URL}/storage/v1/object/public/public-avatars/` or "" if unset. */
export function avatarPublicPrefix(): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base ? `${base}/storage/v1/object/public/${AVATAR_BUCKET}/` : "";
}

/** True only for a stable public URL inside our own avatars bucket. */
export function isOwnAvatarUrl(url: string): boolean {
  const prefix = avatarPublicPrefix();
  // Guard against an empty env making every URL "valid".
  return prefix.endsWith(`/${AVATAR_BUCKET}/`) && url.startsWith(prefix);
}
