import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

// Site-wide default card. Every route inherits this unless it defines its own
// opengraph-image. twitter-image.tsx re-exports these, so keep the names stable.
export const runtime = "nodejs";
export const alt = "TheGoodIntro. Meetings that fund what matters.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgCard("Meetings that fund what matters.");
}
