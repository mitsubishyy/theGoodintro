import { ImageResponse } from "next/og";

// Branded social share card. App Router file convention: Next wires this
// as the Open Graph image automatically. Palette and mark mirror the
// locked design. No dashes in any copy (middots only).
export const alt = "TheBigIntro. Meetings that fund what matters.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FCFBF8",
          padding: "72px 80px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -120,
            width: 460,
            height: 460,
            borderRadius: 460,
            background: "rgba(242,137,123,0.20)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -180,
            left: -140,
            width: 420,
            height: 420,
            borderRadius: 420,
            background: "rgba(79,180,147,0.16)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="52" height="52" viewBox="0 0 32 32" fill="none">
            <path
              d="M11 5a13 13 0 0 0 0 22"
              stroke="#1F2638"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <path
              d="M21 5a13 13 0 0 1 0 22"
              stroke="#1F2638"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <path
              d="M16 23c-3.6-2.6-6-4.8-6-7.6A3.1 3.1 0 0 1 16 13.4 3.1 3.1 0 0 1 22 15.4c0 2.8-2.4 5-6 7.6z"
              fill="#DD6450"
            />
          </svg>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 800 }}>
            <span style={{ color: "#1F2638" }}>The</span>
            <span style={{ color: "#DD6450" }}>Big</span>
            <span style={{ color: "#1F2638" }}>Intro</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "#1F2638",
            }}
          >
            <span>Meetings that fund&nbsp;</span>
            <span style={{ color: "#DD6450" }}>what matters.</span>
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#5C6170" }}>
            Senior leaders take a few relevant conversations. Each one sends
            $1,000 to a charity they choose.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 24,
            fontWeight: 700,
            color: "#1F2638",
          }}
        >
          <span>Invite only</span>
          <span style={{ color: "#DD6450" }}>·</span>
          <span>Australia first</span>
          <span style={{ color: "#DD6450" }}>·</span>
          <span>Funds charity</span>
        </div>
      </div>
    ),
    size,
  );
}
