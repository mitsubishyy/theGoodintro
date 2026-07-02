import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// Shared Open Graph / social card: warm cream ground, brand wordmark, one
// headline. Used by the site-wide default and the per-page overrides so every
// shared link looks consistent. Satori cannot read CSS variables, so the brand
// tokens are mirrored here as concrete values.
export async function renderOgCard(headline: string) {
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
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
          {headline}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
