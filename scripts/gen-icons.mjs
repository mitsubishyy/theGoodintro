// Regenerates the PWA icon set and favicon.ico from the brand mark.
// Run after changing public/brand/logo.png:  node scripts/gen-icons.mjs
//
// Source: public/brand/logo.png is the emerald circle mark (full-bleed emerald
// corners, cream "G" centred), so it doubles as a valid maskable icon. We still
// emit a dedicated maskable with extra emerald safe-zone padding for launchers
// that apply an aggressive mask.

import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

const SRC = "public/brand/logo.png";
// Brand emerald used for theme_color and the maskable safe-zone bleed.
const EMERALD = { r: 0x1f, g: 0x7a, b: 0x47, alpha: 1 };

async function pngBuffer(size, fit = "cover") {
  // RGBA is required: Next's favicon.ico decoder rejects RGB PNGs inside an ICO.
  return sharp(SRC).resize(size, size, { fit }).ensureAlpha().png().toBuffer();
}

// Minimal ICO container that embeds PNG-encoded images (supported by every
// browser since Vista). One ICONDIRENTRY per size.
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + 16 * images.length;
  const entries = [];
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // width
    e.writeUInt8(size >= 256 ? 0 : size, 1); // height
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

async function main() {
  await mkdir("public/icons", { recursive: true });

  // PWA "any" icons.
  await writeFile("public/icons/icon-192.png", await pngBuffer(192));
  await writeFile("public/icons/icon-512.png", await pngBuffer(512));

  // Maskable: brand mark at 80% on an emerald square so the cream "G" always
  // lands inside the safe zone.
  const inner = await sharp(SRC)
    .resize(410, 410, { fit: "contain", background: EMERALD })
    .toBuffer();
  const maskable = await sharp({
    create: { width: 512, height: 512, channels: 4, background: EMERALD },
  })
    .composite([{ input: inner, gravity: "center" }])
    .png()
    .toBuffer();
  await writeFile("public/icons/icon-maskable-512.png", maskable);

  // favicon.ico (16/32/48).
  const ico = buildIco(
    await Promise.all(
      [16, 32, 48].map(async (size) => ({ size, data: await pngBuffer(size) })),
    ),
  );
  await writeFile("app/favicon.ico", ico);

  console.log("icons: wrote icon-192, icon-512, icon-maskable-512, favicon.ico");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
