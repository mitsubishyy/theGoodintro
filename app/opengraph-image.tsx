import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "TheGoodIntro. Meetings that fund what matters.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Single branded Open Graph card, used site-wide via the file convention
// (every route inherits it unless it defines its own). Warm cream ground,
// the brand wordmark, one line. Tokens mirrored as concrete values because
// Satori cannot read CSS custom properties.
export default async function OpengraphImage() {
  const logoData = await readFile(
    join(process.cwd(), "public/brand/wordmark.png"),
  );
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "96px",
          background: "#F7F3EA",
          fontFamily: "sans-serif",
        }}
      >
        <img src={logoSrc} alt="TheGoodIntro" width={520} height={117} />
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            color: "#1A1611",
            marginTop: 56,
          }}
        >
          Meetings that fund what matters.
        </div>
      </div>
    ),
    size,
  );
}
