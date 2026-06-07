import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "TheGoodIntro. Meetings that fund what matters.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logoData = await readFile(
    join(process.cwd(), "public/brand/email-signature.png"),
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
          padding: "80px",
          background: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="TheGoodIntro" width={420} height={94} />
        <div style={{ fontSize: 64, fontWeight: 700, marginTop: 48 }}>
          Meetings that fund what matters.
        </div>
        <div style={{ fontSize: 28, marginTop: 24 }}>
          Senior leaders take a few relevant conversations. Each one sends
          a real gift to a charity they choose.
        </div>
      </div>
    ),
    size,
  );
}
