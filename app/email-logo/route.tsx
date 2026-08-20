import { ImageResponse } from "next/og";

export const runtime = "edge";

// Renders the text-only ExpoLead OS wordmark as a PNG for email headers (email
// clients render <img> reliably, unlike CSS-div logos). White + emerald so it
// sits on the dark/gradient email header. No glyph — matches the app's
// text-only brand mark. Served at /email-logo.
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: 8,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <span style={{ fontSize: 48, fontWeight: 800, color: "#ffffff", letterSpacing: -1 }}>EXPOLEAD</span>
        <span style={{ fontSize: 48, fontWeight: 800, color: "#34d399", letterSpacing: -1, marginLeft: 12 }}>OS</span>
      </div>
    ),
    { width: 420, height: 80 }
  );
}
