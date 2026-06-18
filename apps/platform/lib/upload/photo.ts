import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";
import { createHash } from "crypto";

/**
 * Server-only image processing for the photo-upload pipeline (PHOTO_UPLOAD_SCOPE.md).
 * The re-encode is the CORE SECURITY CONTROL, not optimisation: it strips all
 * EXIF/GPS/XMP (a real executive's photo never leaks location), neutralises
 * polyglot payloads (the output is fresh pixels), normalises dimensions, and is
 * itself a validation gate (anything sharp cannot decode as a raster throws).
 *
 * `processImage` is pure (no storage, no Supabase) so it is unit-testable; the
 * route handler does the authz + storage write around it. NEVER import this into
 * client code (pulls sharp + file-type into the bundle).
 */

export const MAX_BYTES = 1_048_576; // 1MB, the locked photo cap
export const ACCEPTED_MIME = ["image/png", "image/jpeg", "image/webp"] as const;
const MIN_DIM = 64;
const MAX_DIM = 6000; // decompression-bomb guard

export interface AssetVariant {
  key: string; // 'avatar' | 'logo' | 'hero'
  width: number;
  height: number;
}

export type AssetEntity = "exec" | "charity-logo" | "charity-hero";

/**
 * One spec per asset class so the pipeline is reusable. Only `exec` is wired in
 * v1; charity entries are built-ready for the residual logo/hero gap. Vendor
 * self-serve is Pass B (own its own flag) and is intentionally absent here.
 */
export const ASSET_SPECS: Record<AssetEntity, { variant: AssetVariant }> = {
  exec: { variant: { key: "avatar", width: 512, height: 512 } },
  "charity-logo": { variant: { key: "logo", width: 512, height: 512 } },
  "charity-hero": { variant: { key: "hero", width: 1200, height: 480 } },
};

export type ProcessResult =
  | { ok: true; buffer: Buffer; hash: string; contentType: "image/webp" }
  | { ok: false; error: string };

export async function processImage(input: Buffer, variant: AssetVariant): Promise<ProcessResult> {
  if (input.length === 0) return { ok: false, error: "The file is empty." };
  if (input.length > MAX_BYTES) return { ok: false, error: "Image must be 1MB or smaller." };

  // Magic-byte sniff: never trust the filename or the client Content-Type. SVG
  // (XML, an XSS vector) is rejected by being absent from the allow-list.
  const ft = await fileTypeFromBuffer(input);
  if (!ft || !ACCEPTED_MIME.includes(ft.mime as (typeof ACCEPTED_MIME)[number])) {
    return { ok: false, error: "Only PNG, JPG or WebP images are accepted." };
  }

  // Bounds + animation guard before the full re-encode.
  let meta;
  try {
    meta = await sharp(input).metadata();
  } catch {
    return { ok: false, error: "That file is not a readable image." };
  }
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (w < MIN_DIM || h < MIN_DIM) return { ok: false, error: "Image is too small (min 64px)." };
  if (w > MAX_DIM || h > MAX_DIM) return { ok: false, error: "Image is too large (max 6000px)." };
  if ((meta.pages ?? 1) > 1) return { ok: false, error: "Animated images are not accepted." };

  let out: Buffer;
  try {
    out = await sharp(input)
      .rotate() // bake in orientation; metadata is then dropped (no withMetadata)
      .resize(variant.width, variant.height, { fit: "cover", position: "attention" })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return { ok: false, error: "Could not process that image." };
  }

  const hash = createHash("sha256").update(out).digest("hex").slice(0, 32);
  return { ok: true, buffer: out, hash, contentType: "image/webp" };
}

/** Server-composed, content-hashed object path. The client filename is never used. */
export function objectPath(entity: AssetEntity, ownerId: string, variant: AssetVariant, hash: string): string {
  return `${entity}/${ownerId}/${variant.key}-${hash}.webp`;
}
