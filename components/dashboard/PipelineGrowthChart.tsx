"use client";

import { useState } from "react";

// Area chart of total deal value over the last 30 days, with the previous 30
// days as a dashed line. Each point is the running total of deal value on
// opportunities created up to that day (lost deals left out).

export type GrowthPoint = { label: string; current: number; previous: number };

const W = 720;
const H = 220;
const L = 52; // left gutter for the axis labels
const T = 12;
const B = 196; // baseline

function money(v: number, currency: string) {
  const abs = Math.abs(v);
  const s = abs >= 1_000_000 ? `${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}M` : abs >= 1000 ? `${Math.round(v / 1000)}k` : String(Math.round(v));
  return `${currency} ${s}`;
}

export default function PipelineGrowthChart({ points, currency }: { points: GrowthPoint[]; currency: string }) {
  const [compare, setCompare] = useState(true);
  const [hover, setHover] = useState<number | null>(null);

  const max = Math.max(1, ...points.map((p) => Math.max(p.current, compare ? p.previous : 0))) * 1.08;
  const n = points.length;
  const x = (i: number) => L + (i / Math.max(1, n - 1)) * (W - L - 6);
  const y = (v: number) => B - (v / max) * (B - T);
  const line = (key: "current" | "previous") => points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p[key]).toFixed(1)}`).join(" ");
  const area = `${line("current")} L${x(n - 1).toFixed(1)} ${B} L${L} ${B} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => (max / 1.08) * f);
  const labelEvery = Math.ceil(n / 6);
  const h = hover !== null ? points[hover] : null;

  return (
    <div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H + 18}`}
          width="100%"
          className="block"
          role="img"
          aria-label="Total deal value over the last 30 days"
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const px = ((e.clientX - r.left) / r.width) * W;
            const i = Math.round(((px - L) / (W - L - 6)) * (n - 1));
            setHover(Math.min(n - 1, Math.max(0, i)));
          }}
        >
          <defs>
            <linearGradient id="pg-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#10b981" stopOpacity="0.32" />
              <stop offset="1" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={L} x2={W - 4} y1={y(t)} y2={y(t)} stroke="#eef1ef" />
              <text x={0} y={y(t) + 4} fontSize="10.5" fill="#94a3b8">{money(t, currency)}</text>
            </g>
          ))}
          {points.map((p, i) =>
            i % labelEvery === 0 || i === n - 1 ? (
              <text key={i} x={x(i)} y={H + 12} fontSize="10.5" fill="#94a3b8" textAnchor={i === n - 1 ? "end" : "middle"}>{p.label}</text>
            ) : null,
          )}
          <path d={area} fill="url(#pg-fill)" />
          {compare && <path d={line("previous")} fill="none" stroke="#94a3b8" strokeWidth="1.6" strokeDasharray="4 4" />}
          <path d={line("current")} fill="none" stroke="#059669" strokeWidth="2.2" />
          {h && hover !== null && (
            <>
              <line x1={x(hover)} x2={x(hover)} y1={T} y2={B} stroke="#cbd5e1" strokeDasharray="3 3" />
              <circle cx={x(hover)} cy={y(h.current)} r="4.5" fill="#fff" stroke="#059669" strokeWidth="2.2" />
            </>
          )}
          {!h && n > 0 && <circle cx={x(n - 1)} cy={y(points[n - 1].current)} r="4.5" fill="#fff" stroke="#059669" strokeWidth="2.2" />}
        </svg>
        {h && hover !== null && (
          <div
            className="pointer-events-none absolute top-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs shadow-sm"
            style={{ left: `${Math.min(78, (x(hover) / W) * 100)}%` }}
          >
            <p className="text-ink-400">{h.label}</p>
            <p className="font-semibold text-ink-900"><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-600" />{money(h.current, currency)}</p>
            {compare && <p className="text-ink-400">previous: {money(h.previous, currency)}</p>}
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-ink-600">
        <button type="button" onClick={() => setCompare((c) => !c)} className="inline-flex items-center gap-2" aria-pressed={compare}>
          <span className={`relative h-[17px] w-[30px] rounded-full transition-colors ${compare ? "bg-emerald-600" : "bg-slate-300"}`}>
            <span className={`absolute top-[2px] h-[13px] w-[13px] rounded-full bg-white transition-all ${compare ? "left-[15px]" : "left-[2px]"}`} />
          </span>
          Compare previous 30 days
        </button>
        <span className="ml-auto flex items-center gap-4 text-ink-500">
          <span><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-600" />Last 30 days</span>
          {compare && <span><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-slate-400" />Previous 30 days</span>}
        </span>
      </div>
    </div>
  );
}
