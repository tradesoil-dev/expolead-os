import { ImageResponse } from "next/og";

export const runtime = "edge";

// Renders the ExpoLead OS logo lockup as a transparent PNG for use in emails
// (email clients render <img> reliably, unlike CSS-div logos). White marks so
// it sits on the dark/gradient email header. Served at /email-logo.
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          paddingLeft: 8,
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Square-grid mark */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 60, height: 60 }}>
          <div style={{ display: "flex", flexDirection: "row", gap: 6 }}>
            <div style={{ width: 27, height: 27, borderRadius: 5, border: "3px solid #ffffff", backgroundColor: "transparent", display: "flex" }} />
            <div style={{ width: 27, height: 27, borderRadius: 5, border: "3px solid #ffffff", backgroundColor: "transparent", display: "flex" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "row", gap: 6 }}>
            <div style={{ width: 27, height: 27, borderRadius: 5, border: "3px solid #ffffff", backgroundColor: "transparent", display: "flex" }} />
            <div style={{ width: 27, height: 27, borderRadius: 5, backgroundColor: "#34d399", display: "flex" }} />
          </div>
        </div>
        {/* Wordmark */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "baseline" }}>
          <span style={{ fontSize: 50, fontWeight: 700, color: "#ffffff" }}>Expo</span>
          <span style={{ fontSize: 50, fontWeight: 700, color: "#34d399" }}>Lead</span>
          <span style={{ fontSize: 32, fontWeight: 400, color: "rgba(255,255,255,0.6)", marginLeft: 8 }}>OS</span>
        </div>
      </div>
    ),
    { width: 520, height: 80 }
  );
}
