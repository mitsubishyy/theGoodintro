import { describe, it, expect, beforeAll } from "vitest";
import sharp from "sharp";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { processImage } from "../lib/upload/photo";
import { isOwnAvatarUrl } from "../lib/upload/url";

/**
 * Photo-upload pipeline (PHOTO_UPLOAD_SCOPE.md). Two layers:
 *  1. processImage — the security-critical validate + sharp re-encode (pure).
 *  2. storage.objects RLS — public read, staff-only write on public-avatars.
 */

const AVATAR = { key: "avatar", width: 512, height: 512 } as const;

async function png(width: number, height: number): Promise<Buffer> {
  return sharp({ create: { width, height, channels: 3, background: { r: 200, g: 30, b: 30 } } })
    .png()
    .toBuffer();
}

describe("processImage", () => {
  it("rejects an empty buffer", async () => {
    expect(await processImage(Buffer.alloc(0), AVATAR)).toMatchObject({ ok: false });
  });

  it("rejects a file over 1MB", async () => {
    const r = await processImage(Buffer.alloc(1_048_577, 1), AVATAR);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/1MB/i);
  });

  it("rejects SVG (XSS vector) by magic-byte sniff", async () => {
    const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>`);
    expect(await processImage(svg, AVATAR)).toMatchObject({ ok: false });
  });

  it("rejects bytes that lie about being an image", async () => {
    const fake = Buffer.from("this is definitely not an image, even if named .png");
    expect(await processImage(fake, AVATAR)).toMatchObject({ ok: false });
  });

  it("rejects an image below the minimum dimension", async () => {
    expect(await processImage(await png(32, 32), AVATAR)).toMatchObject({ ok: false });
  });

  it("accepts a real PNG and re-encodes to a square WebP", async () => {
    const r = await processImage(await png(900, 600), AVATAR);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.contentType).toBe("image/webp");
      expect(r.hash).toMatch(/^[0-9a-f]{32}$/);
      const meta = await sharp(r.buffer).metadata();
      expect(meta.format).toBe("webp");
      expect(meta.width).toBe(512);
      expect(meta.height).toBe(512);
    }
  });

  it("strips EXIF/metadata in the re-encode", async () => {
    const withExif = await sharp({ create: { width: 300, height: 300, channels: 3, background: { r: 1, g: 2, b: 3 } } })
      .jpeg()
      .withExif({ IFD0: { Copyright: "leak-me" } })
      .toBuffer();
    const r = await processImage(withExif, AVATAR);
    expect(r.ok).toBe(true);
    if (r.ok) {
      const meta = await sharp(r.buffer).metadata();
      expect(meta.exif).toBeUndefined(); // GPS/EXIF never survives to storage
    }
  });
});

describe("isOwnAvatarUrl (origin guard)", () => {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  it("accepts a URL in our own avatars bucket", () => {
    expect(isOwnAvatarUrl(`${base}/storage/v1/object/public/public-avatars/exec/x/avatar-abc.webp`)).toBe(true);
    expect(isOwnAvatarUrl(`${base}/storage/v1/object/public/public-avatars/charity-hero/y/hero-def.webp`)).toBe(true);
  });
  it("rejects an external URL", () => {
    expect(isOwnAvatarUrl("https://evil.example.com/storage/v1/object/public/public-avatars/x.webp")).toBe(false);
  });
  it("rejects a different bucket on the same host", () => {
    expect(isOwnAvatarUrl(`${base}/storage/v1/object/public/other-bucket/x.webp`)).toBe(false);
  });
  it("treats empty as not-own", () => {
    expect(isOwnAvatarUrl("")).toBe(false);
  });
});

// ── storage.objects RLS (public read, staff-only write) ──────────────────────

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const PASSWORD = "Passw0rd!test";
const BUCKET = "public-avatars";

async function signIn(email: string): Promise<SupabaseClient> {
  const c = createClient(URL, KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await c.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) throw new Error(`sign-in failed for ${email}: ${error.message}`);
  return c;
}

describe("photo storage RLS (public-avatars)", () => {
  let staff: SupabaseClient;
  let vendor: SupabaseClient;
  let anon: SupabaseClient;
  let tiny: Buffer;

  beforeAll(async () => {
    if (!URL || !KEY) throw new Error("Supabase env vars are not set");
    staff = await signIn("admin@thegoodintro.test");
    vendor = await signIn("alex@alpha.test");
    anon = createClient(URL, KEY, { auth: { persistSession: false } });
    tiny = await png(64, 64);
  });

  it("a staff session can write to the bucket", async () => {
    const { error } = await staff.storage.from(BUCKET).upload("exec/test-staff/avatar.webp", tiny, {
      contentType: "image/webp",
      upsert: true,
    });
    expect(error).toBeNull();
  });

  it("a vendor session cannot write to the bucket", async () => {
    const { error } = await vendor.storage.from(BUCKET).upload("exec/test-vendor/avatar.webp", tiny, {
      contentType: "image/webp",
      upsert: true,
    });
    expect(error).not.toBeNull();
  });

  it("an anonymous session cannot write to the bucket", async () => {
    const { error } = await anon.storage.from(BUCKET).upload("exec/test-anon/avatar.webp", tiny, {
      contentType: "image/webp",
      upsert: true,
    });
    expect(error).not.toBeNull();
  });

  it("the public URL is readable without a session", async () => {
    await staff.storage.from(BUCKET).upload("exec/test-read/avatar.webp", tiny, {
      contentType: "image/webp",
      upsert: true,
    });
    const { data } = anon.storage.from(BUCKET).getPublicUrl("exec/test-read/avatar.webp");
    const res = await fetch(data.publicUrl);
    expect(res.ok).toBe(true);
  });

  it("staff can persist a charity's logo + hero URLs", async () => {
    const RFDS = "00000000-0000-0000-0000-00000000c1a3";
    const logo = `${URL}/storage/v1/object/public/${BUCKET}/charity-logo/${RFDS}/logo-abc.webp`;
    const hero = `${URL}/storage/v1/object/public/${BUCKET}/charity-hero/${RFDS}/hero-def.webp`;
    const { error } = await staff.from("charity").update({ logo_url: logo, hero_image_url: hero }).eq("id", RFDS);
    expect(error).toBeNull();
    const { data } = await staff.from("charity").select("logo_url, hero_image_url").eq("id", RFDS).single();
    expect(data?.logo_url).toBe(logo);
    expect(data?.hero_image_url).toBe(hero);
  });
});
