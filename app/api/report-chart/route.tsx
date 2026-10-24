import { ImageResponse } from "next/og";
import { optionLabel } from "@/lib/survey-v2";

export const runtime = "edge";

// Renders the post-show report charts as PNG images for the report email
// (email clients do not render the page's SVG). The link carries only scores
// and answer ids, never a name or email, so images are safe to cache.
//
//   ?k=radar&s=21232            five habit scores (1 to 3): Capture, Notes, Speed, Team, Results
//   ?k=bars&c=gt200&l=h         contacts answer id + missed follow-up answer id
//   ?k=curve&sp=1w              first follow-up answer id
//   ?k=donut&p=50&plus=1        share at risk (percent) and whether it is "or more"
//
// Shapes are SVG; every label is HTML text, because the image renderer cannot
// draw SVG text without system fonts. Drawn at 2x for sharp email images.

const INK = "#0f172a";
const MUTED = "#475569";
const SOFT = "#94a3b8";
const EMERALD = "#059669";
const ROSE = "#e11d48";
const SKY = "#38bdf8";

const cache = { "Cache-Control": "public, max-age=31536000, immutable" };

function radar(sp: URLSearchParams, visitor = false) {
  // Exhibitor: 5 habits. Visitor: 4-point sourcing snapshot (long labels top and bottom).
  const names = visitor ? ["You follow up", "Reach", "They follow up", "Tracking"] : ["Capture", "Notes", "Speed", "Team", "Results"];
  const n = names.length;
  const raw = (sp.get("s") || "").replace(/[^1-3]/g, "").padEnd(n, "2").slice(0, n);
  const scores = raw.split("").map(Number);
  const S = 2, ox = 20; // viewBox -20 0 340 H, drawn at 2x
  const VH = n === 4 ? 260 : 240;
  const W = 680, H = VH * S;
  const cx = 150, cy = 128, R = 92;
  const pt = (i: number, r: number): [number, number] => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const ring = (lv: number) => scores.map((_, i) => pt(i, (R * lv) / 3).join(",")).join(" ");
  const shape = scores.map((v, i) => pt(i, (R * v) / 3).join(",")).join(" ");
  const dot = ["", ROSE, "#d97706", EMERALD];
  return new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: W, height: H, background: "#ffffff" }}>
        <svg width={W} height={H} viewBox={`-20 0 340 ${VH}`}>
          {[1, 2, 3].map((lv) => <polygon key={lv} points={ring(lv)} fill="none" stroke={lv === 3 ? "#cbd5e1" : "#e2e8f0"} strokeWidth={1} />)}
          {scores.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e2e8f0" strokeWidth={1} />; })}
          <polygon points={shape} fill="rgba(5,150,105,0.18)" stroke={EMERALD} strokeWidth={2} strokeLinejoin="round" />
          {scores.map((v, i) => { const [x, y] = pt(i, (R * v) / 3); return <circle key={i} cx={x} cy={y} r={4} fill={dot[v]} stroke="#ffffff" strokeWidth={2} />; })}
        </svg>
        {names.map((name, i) => {
          const [x, y] = pt(i, R + 22);
          const px = (x + ox) * S, py = y * S - 14;
          const anchor = Math.abs(x - cx) < 10 ? "middle" : x > cx ? "start" : "end";
          const left = anchor === "middle" ? px - 90 : anchor === "end" ? px - 180 : px;
          return (
            <div key={name} style={{ position: "absolute", left, top: py, width: 180, display: "flex", justifyContent: anchor === "middle" ? "center" : anchor === "end" ? "flex-end" : "flex-start", fontSize: 22, color: MUTED }}>
              {name}
            </div>
          );
        })}
      </div>
    ),
    { width: W, height: H, headers: cache },
  );
}

function bars(sp: URLSearchParams) {
  const c = sp.get("c") || "";
  const l = sp.get("l") || "";
  const share = ({ few: 0.05, q: 0.25, h: 0.5, m: 0.5 } as Record<string, number>)[l];
  const followed = ({ few: "Almost all", q: "About three quarters", h: "About half", m: "Less than half" } as Record<string, string>)[l] ?? "";
  const rows: { name: string; text: string; pct: number; color: string; hatch?: boolean }[] = [{ name: "Contacts made", text: optionLabel("count", c), pct: 100, color: EMERALD }];
  if (share === undefined) rows.push({ name: "Followed up properly", text: "Unknown", pct: 100, color: "#e2e8f0", hatch: true });
  else {
    rows.push({ name: "Likely followed up", text: followed, pct: Math.round((1 - share) * 100), color: SKY });
    rows.push({ name: "May never hear from you", text: optionLabel("lost", l), pct: Math.max(4, Math.round(share * 100)), color: ROSE });
  }
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 1040, height: 360, background: "#ffffff", padding: "20px 8px" }}>
        {rows.map((r) => (
          <div key={r.name} style={{ display: "flex", flexDirection: "column", marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: MUTED, marginBottom: 10 }}>
              <span>{r.name}</span>
              <span style={{ color: INK }}>{r.text}</span>
            </div>
            <div style={{ display: "flex", width: "100%", height: 24, borderRadius: 12, background: "#f1f5f9" }}>
              <div style={{ display: "flex", width: `${r.pct}%`, height: 24, borderRadius: 12, background: r.color, opacity: r.hatch ? 0.6 : 1 }} />
            </div>
          </div>
        ))}
      </div>
    ),
    { width: 1040, height: 360, headers: cache },
  );
}

// Visitor: both sides of the follow-up. Bar length is visual only; the label is the answer.
function vbars(sp: URLSearchParams) {
  const pct: Record<string, number> = { most: 75, half: 50, few: 20, none: 3 };
  const t = sp.get("t") || "";
  const y = sp.get("y") || "";
  const rows = [
    { name: "Exhibitors who followed up with you", text: optionLabel("v_followed", t), pct: pct[t] ?? 0, color: SKY },
    { name: "Exhibitors you followed up with", text: optionLabel("v_did", y), pct: pct[y] ?? 0, color: EMERALD },
  ];
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 1040, height: 260, background: "#ffffff", padding: "20px 8px" }}>
        {rows.map((r) => (
          <div key={r.name} style={{ display: "flex", flexDirection: "column", marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: MUTED, marginBottom: 10 }}>
              <span>{r.name}</span>
              <span style={{ color: INK }}>{r.text}</span>
            </div>
            <div style={{ display: "flex", width: "100%", height: 24, borderRadius: 12, background: "#f1f5f9" }}>
              <div style={{ display: "flex", width: `${Math.max(3, r.pct)}%`, height: 24, borderRadius: 12, background: r.color }} />
            </div>
          </div>
        ))}
      </div>
    ),
    { width: 1040, height: 260, headers: cache },
  );
}

function curve(sp: URLSearchParams) {
  const key = sp.get("sp") || "";
  const mark = ({ "2d": [92, "Within 2 days"], "1w": [150, "Within a week"], "4w": [238, "2 to 4 weeks"], later: [270, "Later"] } as Record<string, [number, string]>)[key];
  const S = 2;
  const path = "M40,34 C70,40 88,52 112,72 S170,118 208,136 S250,152 270,156";
  const ticks: [number, string][] = [[40, "Show"], [92, "2d"], [150, "7d"], [208, "14d"], [270, "30d"]];
  return new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: 600, height: 400, background: "#ffffff" }}>
        <svg width={600} height={400} viewBox="0 0 300 200">
          <defs>
            <linearGradient id="w" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor={EMERALD} stopOpacity={0.22} />
              <stop offset="1" stopColor={ROSE} stopOpacity={0.18} />
            </linearGradient>
          </defs>
          <path d={`${path} L270,170 L40,170 Z`} fill="url(#w)" />
          <path d={path} fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
          <line x1={40} y1={170} x2={282} y2={170} stroke="#e2e8f0" strokeWidth={1} />
          {mark && <line x1={mark[0]} y1={22} x2={mark[0]} y2={170} stroke={EMERALD} strokeWidth={2} strokeDasharray="4 4" />}
        </svg>
        <div style={{ position: "absolute", left: 0, top: 62, width: 68 * S / 2 + 8, display: "flex", justifyContent: "flex-end", fontSize: 20, color: SOFT }}>Warm</div>
        <div style={{ position: "absolute", left: 0, top: 306, width: 68 * S / 2 + 8, display: "flex", justifyContent: "flex-end", fontSize: 20, color: SOFT }}>Cold</div>
        {ticks.map(([x, t]) => (
          <div key={t} style={{ position: "absolute", left: x * S - 40, top: 356, width: 80, display: "flex", justifyContent: "center", fontSize: 20, color: SOFT }}>{t}</div>
        ))}
        {mark && (
          <div style={{ position: "absolute", left: Math.min(mark[0] - 52, 196) * S, top: 6 * S, width: 104 * S, height: 18 * S, borderRadius: 18, background: EMERALD, color: "#ffffff", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
            You: {mark[1]}
          </div>
        )}
      </div>
    ),
    { width: 600, height: 400, headers: cache },
  );
}

function donut(sp: URLSearchParams) {
  const p = Math.max(0, Math.min(100, Number(sp.get("p") || 0)));
  const plus = sp.get("plus") === "1";
  const C = 2 * Math.PI * 42;
  return new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: 220, height: 220, background: "#ffffff" }}>
        <svg width={220} height={220} viewBox="0 0 110 110">
          <circle cx={55} cy={55} r={42} fill="none" stroke="#d1fae5" strokeWidth={14} />
          <circle cx={55} cy={55} r={42} fill="none" stroke={ROSE} strokeWidth={14} strokeLinecap="round" strokeDasharray={`${((p / 100) * C).toFixed(1)} ${C.toFixed(1)}`} transform="rotate(-90 55 55)" />
        </svg>
        <div style={{ position: "absolute", left: 0, top: 0, width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, color: INK }}>
          {p}%{plus ? "+" : ""}
        </div>
      </div>
    ),
    { width: 220, height: 220, headers: cache },
  );
}

export function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const k = sp.get("k");
  if (k === "radar") return radar(sp);
  if (k === "vradar") return radar(sp, true);
  if (k === "bars") return bars(sp);
  if (k === "vbars") return vbars(sp);
  if (k === "curve") return curve(sp);
  if (k === "donut") return donut(sp);
  return new Response("Unknown chart", { status: 400 });
}
