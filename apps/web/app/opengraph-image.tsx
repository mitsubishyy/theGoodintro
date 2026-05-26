import { ImageResponse } from "next/og";

export const alt = "theGoodintro. Meetings that fund what matters.";
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
          justifyContent: "center",
          padding: "80px",
          background: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 36, fontWeight: 700, display: "flex" }}>
          <span>the</span>
          <span
            style={{
              color: "#1f7a47",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontWeight: 700,
              letterSpacing: "0.01em",
            }}
          >
            Good
          </span>
          <span>intro</span>
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, marginTop: 24 }}>
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
