import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  const fontData = await readFile(
    join(process.cwd(), "public/fonts/LibreCaslonText-Bold.ttf"),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          fontFamily: "Libre Caslon Text",
          fontWeight: 700,
        }}
      >
        <div
          style={{
            fontSize: 140,
            display: "flex",
            letterSpacing: "0",
            lineHeight: 1,
          }}
        >
          <span style={{ color: "#14110D" }}>the</span>
          <span style={{ color: "#1f7a47" }}>Good</span>
          <span style={{ color: "#14110D" }}>intro</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 260,
      fonts: [
        {
          name: "Libre Caslon Text",
          data: fontData,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
