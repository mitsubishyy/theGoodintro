import { ImageResponse } from "next/og";

// Branded social share card. App Router file convention: Next wires this
// as the Open Graph image automatically. Palette and wordmark mirror the
// locked Philanthropic Forest design. No dashes in any copy (middots only).
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
          background: "#F3F2EC",
          padding: "72px 80px",
          position: "relative",
          fontFamily: "Georgia, 'Times New Roman', serif",
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
            background: "rgba(31,93,69,0.16)",
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
            background: "rgba(31,93,69,0.10)",
          }}
        />

        <div style={{ display: "flex", fontSize: 36, fontWeight: 600 }}>
          <span style={{ color: "#15211B" }}>the</span>
          <span style={{ color: "#1F5D45" }}>Big</span>
          <span style={{ color: "#15211B" }}>intro</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 78,
              fontWeight: 600,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              color: "#15211B",
            }}
          >
            <span>Meetings that fund&nbsp;</span>
            <span style={{ color: "#1F5D45", fontStyle: "italic" }}>
              what matters.
            </span>
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#45504A" }}>
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
            fontWeight: 600,
            color: "#15211B",
          }}
        >
          <span>Invite only</span>
          <span style={{ color: "#1F5D45" }}>·</span>
          <span>Australia first</span>
          <span style={{ color: "#1F5D45" }}>·</span>
          <span>Funds charity</span>
        </div>
      </div>
    ),
    size,
  );
}
