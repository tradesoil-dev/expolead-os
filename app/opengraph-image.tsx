import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ExpoLead OS - Turn Expo Conversations Into Revenue";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          backgroundColor: "#0f172a",
          display: "flex",
          flexDirection: "row",
          position: "relative",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Green left accent bar */}
        <div style={{ position: "absolute", left: 0, top: 0, width: 6, height: 630, backgroundColor: "#059669", display: "flex" }} />

        {/* Left content */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", paddingLeft: 60, paddingTop: 60, width: 680 }}>

          {/* Logo */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 6 }}>
            {/* Floor plan icon */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4, width: 36, height: 36 }}>
              <div style={{ display: "flex", flexDirection: "row", gap: 4 }}>
                <div style={{ width: 16, height: 16, borderRadius: 3, border: "2px solid white", backgroundColor: "transparent", display: "flex" }} />
                <div style={{ width: 16, height: 16, borderRadius: 3, border: "2px solid white", backgroundColor: "transparent", display: "flex" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "row", gap: 4 }}>
                <div style={{ width: 16, height: 16, borderRadius: 3, border: "2px solid white", backgroundColor: "transparent", display: "flex" }} />
                <div style={{ width: 16, height: 16, borderRadius: 3, backgroundColor: "#10b981", display: "flex" }} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "baseline" }}>
              <span style={{ fontSize: 34, fontWeight: 700, color: "#ffffff" }}>Expo</span>
              <span style={{ fontSize: 34, fontWeight: 700, color: "#34d399" }}>Lead</span>
              <span style={{ fontSize: 22, fontWeight: 400, color: "#64748b", marginLeft: 6 }}>OS</span>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#475569", marginBottom: 60, display: "flex" }}>Powered by Tradesoil</div>

          {/* Headline */}
          <div style={{ fontSize: 72, fontWeight: 700, color: "#ffffff", lineHeight: 1.1, display: "flex" }}>Turn Expo</div>
          <div style={{ fontSize: 72, fontWeight: 700, color: "#ffffff", lineHeight: 1.1, display: "flex" }}>Conversations</div>
          <div style={{ fontSize: 72, fontWeight: 700, color: "#34d399", lineHeight: 1.1, display: "flex", marginBottom: 28 }}>Into Revenue.</div>

          {/* Subtext */}
          <div style={{ fontSize: 23, color: "#94a3b8", display: "flex" }}>Capture connections. Track opportunities.</div>
          <div style={{ fontSize: 23, color: "#94a3b8", display: "flex", marginBottom: 48 }}>Follow up faster from every exhibition.</div>

          {/* Bottom info */}
          <div style={{ fontSize: 17, color: "#475569", display: "flex", flexDirection: "row", gap: 12 }}>
            <span>14 day free trial</span>
            <span style={{ color: "#334155" }}>·</span>
            <span>No credit card required</span>
            <span style={{ color: "#334155" }}>·</span>
            <span>tradesoil.com</span>
          </div>
        </div>

        {/* Right card */}
        <div style={{
          display: "flex", flexDirection: "column",
          position: "absolute", right: 50, top: 80,
          width: 420, height: 470,
          backgroundColor: "#1e293b", borderRadius: 16,
        }}>
          {/* Card header */}
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0f172a", borderRadius: "16px 16px 0 0", padding: "14px 20px" }}>
            <span style={{ fontSize: 14, color: "#64748b" }}>Lead Pipeline</span>
            <div style={{ display: "flex", backgroundColor: "#059669", borderRadius: 5, padding: "2px 8px" }}>
              <span style={{ fontSize: 11, color: "#ffffff", fontWeight: 600 }}>Live</span>
            </div>
          </div>

          {/* Row 1 */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", backgroundColor: "#0f172a", margin: "10px 16px 0", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ width: 5, height: 34, backgroundColor: "#34d399", borderRadius: 2, marginRight: 12, display: "flex" }} />
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>Guangzhou Resin Co.</span>
              <span style={{ fontSize: 11, color: "#64748b" }}>Resins · Coatings · Hall 3</span>
            </div>
            <div style={{ display: "flex", backgroundColor: "#064e3b", borderRadius: 5, padding: "3px 8px" }}>
              <span style={{ fontSize: 11, color: "#34d399", fontWeight: 600 }}>Contacted</span>
            </div>
          </div>

          {/* Row 2 */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", backgroundColor: "#0f172a", margin: "8px 16px 0", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ width: 5, height: 34, backgroundColor: "#f59e0b", borderRadius: 2, marginRight: 12, display: "flex" }} />
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>Sino Pigment International</span>
              <span style={{ fontSize: 11, color: "#64748b" }}>Pigments · Hall 5 · A112</span>
            </div>
            <div style={{ display: "flex", backgroundColor: "#1c1400", borderRadius: 5, padding: "3px 8px" }}>
              <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 600 }}>Follow up</span>
            </div>
          </div>

          {/* Row 3 */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", backgroundColor: "#0f172a", margin: "8px 16px 0", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ width: 5, height: 34, backgroundColor: "#3b82f6", borderRadius: 2, marginRight: 12, display: "flex" }} />
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>Delta Chemicals Trading</span>
              <span style={{ fontSize: 11, color: "#64748b" }}>Solvents · Canton Fair</span>
            </div>
            <div style={{ display: "flex", backgroundColor: "#0c1a35", borderRadius: 5, padding: "3px 8px" }}>
              <span style={{ fontSize: 11, color: "#93c5fd", fontWeight: 600 }}>New</span>
            </div>
          </div>

          {/* Row 4 */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", backgroundColor: "#0f172a", margin: "8px 16px 0", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ width: 5, height: 34, backgroundColor: "#a855f7", borderRadius: 2, marginRight: 12, display: "flex" }} />
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>FAME Korea</span>
              <span style={{ fontSize: 11, color: "#64748b" }}>SK Eco · Quotation ready</span>
            </div>
            <div style={{ display: "flex", backgroundColor: "#1a0a2e", borderRadius: 5, padding: "3px 8px" }}>
              <span style={{ fontSize: 11, color: "#d8b4fe", fontWeight: 600 }}>Order Ready</span>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", flexDirection: "row", gap: 10, margin: "14px 16px 0" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "#0f172a", borderRadius: 8, padding: "10px 0", flex: 1 }}>
              <span style={{ fontSize: 11, color: "#64748b" }}>Connections</span>
              <span style={{ fontSize: 26, fontWeight: 700, color: "#ffffff" }}>24</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "#0f172a", borderRadius: 8, padding: "10px 0", flex: 1 }}>
              <span style={{ fontSize: 11, color: "#64748b" }}>Opportunities</span>
              <span style={{ fontSize: 26, fontWeight: 700, color: "#34d399" }}>8</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "#0f172a", borderRadius: 8, padding: "10px 0", flex: 1 }}>
              <span style={{ fontSize: 11, color: "#64748b" }}>Follow ups</span>
              <span style={{ fontSize: 26, fontWeight: 700, color: "#f59e0b" }}>5</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
