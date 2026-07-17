"use client";

import { useEffect, useState } from "react";
import ReportChart from "@/components/ReportChart";

type ChartData = { labels: string[]; data: number[]; colors: string[] };
type Kpis = {
  connections: number;
  active: number;
  volume: string;
  winRate: number | null;
  followUpRate: number | null;
  exhibitions: number;
};
type PerExh = { name: string; conns: number; opps: number; won: number; winRate: number | null; volume: string };
type PresentChart = { key: string; heading: string; type: string; data: ChartData };

export default function ReportsPresent({
  title,
  rangeLabel,
  kpis,
  charts,
  funnel,
  perExhibition,
  onClose,
}: {
  title: string;
  rangeLabel: string;
  kpis: Kpis;
  charts: PresentChart[];
  funnel: { c: number; o: number; w: number };
  perExhibition: PerExh[];
  onClose: () => void;
}) {
  const activeCharts = charts.filter((c) => c.data.labels.length > 0);
  const slides: string[] = [
    "title",
    "kpis",
    ...activeCharts.map((c) => `chart:${c.key}`),
    "funnel",
    ...(perExhibition.length > 0 ? ["table"] : []),
    "summary",
  ];
  const n = slides.length;
  const [i, setI] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") setI((v) => Math.min(n - 1, v + 1));
      else if (e.key === "ArrowLeft") setI((v) => Math.max(0, v - 1));
      else if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [n, onClose]);

  const slide = slides[i];
  const chart = slide.startsWith("chart:") ? activeCharts.find((c) => `chart:${c.key}` === slide) : null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink-100 px-6 py-3">
        <div className="flex items-center gap-2.5">
          <svg width="22" height="22" viewBox="0 0 40 40" fill="none"><rect x="1" y="1" width="17" height="17" rx="3" stroke="#0f172a" strokeWidth="2.2"/><rect x="22" y="1" width="17" height="17" rx="3" stroke="#0f172a" strokeWidth="2.2"/><rect x="1" y="22" width="17" height="17" rx="3" stroke="#0f172a" strokeWidth="2.2"/><rect x="22" y="22" width="17" height="17" rx="3" fill="#10b981"/></svg>
          <span className="text-sm font-semibold text-ink-900">{title}</span>
          <span className="text-sm text-ink-400">· {rangeLabel}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-ink-400">{i + 1} / {n}</span>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg border border-ink-200 text-ink-500 hover:bg-ink-50" aria-label="Exit presentation">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      {/* Slide body */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-6">
        <div className="w-full max-w-5xl">
          {slide === "title" && (
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">Exhibition report</p>
              <h1 className="mt-4 text-5xl font-black tracking-tight text-ink-900">{title}</h1>
              <p className="mt-4 text-xl text-ink-500">{rangeLabel}</p>
            </div>
          )}

          {slide === "kpis" && (
            <div>
              <h2 className="mb-6 text-center text-2xl font-black tracking-tight text-ink-900">The headline numbers</h2>
              <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
                <BigKpi label="Connections" value={kpis.connections} />
                <BigKpi label="Active opportunities" value={kpis.active} />
                <BigKpi label="Pipeline volume" value={kpis.volume} />
                <BigKpi label="Win rate" value={kpis.winRate === null ? "—" : `${kpis.winRate}%`} accent />
                <BigKpi label="Follow-up rate" value={kpis.followUpRate === null ? "—" : `${kpis.followUpRate}%`} accent />
                <BigKpi label="Exhibitions" value={kpis.exhibitions} />
              </div>
            </div>
          )}

          {chart && (
            <div>
              <h2 className="mb-6 text-center text-2xl font-black tracking-tight text-ink-900">{chart.heading}</h2>
              <div className="relative mx-auto h-[58vh] w-full max-w-4xl">
                <ReportChart type={chart.type as "line" | "bar" | "pie" | "doughnut"} labels={chart.data.labels} data={chart.data.data} colors={chart.data.colors} />
              </div>
            </div>
          )}

          {slide === "funnel" && (
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-8 text-center text-2xl font-black tracking-tight text-ink-900">Conversion funnel</h2>
              <BigFunnel label="Connections captured" value={funnel.c} max={funnel.c} color="#10b981" />
              <BigFunnel label="Opportunities created" value={funnel.o} max={funnel.c} color="#38bdf8" pct={funnel.c ? Math.round((funnel.o / funnel.c) * 100) : null} />
              <BigFunnel label="Deals won" value={funnel.w} max={funnel.c} color="#8b5cf6" pct={funnel.c ? Math.round((funnel.w / funnel.c) * 100) : null} />
            </div>
          )}

          {slide === "table" && (
            <div>
              <h2 className="mb-6 text-center text-2xl font-black tracking-tight text-ink-900">Performance by exhibition</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-base">
                  <thead>
                    <tr className="border-b-2 border-ink-100 text-left text-xs font-bold uppercase tracking-wide text-emerald-700">
                      <th className="py-3 pr-3">Exhibition</th>
                      <th className="py-3 pr-3 text-right">Connections</th>
                      <th className="py-3 pr-3 text-right">Opportunities</th>
                      <th className="py-3 pr-3 text-right">Won</th>
                      <th className="py-3 pr-3 text-right">Win rate</th>
                      <th className="py-3 text-right">Pipeline volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perExhibition.map((r) => (
                      <tr key={r.name} className="border-b border-ink-50 last:border-0">
                        <td className="py-3.5 pr-3 font-semibold text-ink-900">{r.name}</td>
                        <td className="py-3.5 pr-3 text-right tabular-nums text-ink-700">{r.conns}</td>
                        <td className="py-3.5 pr-3 text-right tabular-nums text-ink-700">{r.opps}</td>
                        <td className="py-3.5 pr-3 text-right font-semibold tabular-nums text-emerald-700">{r.won}</td>
                        <td className="py-3.5 pr-3 text-right tabular-nums text-ink-700">{r.winRate === null ? "—" : `${r.winRate}%`}</td>
                        <td className="py-3.5 text-right tabular-nums text-ink-700">{r.volume}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {slide === "summary" && (
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">In summary</p>
              <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight text-ink-900">
                {kpis.connections} connections captured, {kpis.active} live opportunities, {kpis.winRate === null ? "no closes yet" : `${kpis.winRate}% win rate`}.
              </h1>
              <p className="mt-5 text-lg text-ink-500">Every lead captured, every follow-up tracked, every show measured.</p>
            </div>
          )}
        </div>

        {/* Arrows */}
        {i > 0 && (
          <button onClick={() => setI((v) => Math.max(0, v - 1))} className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-ink-200 bg-white text-ink-500 shadow-sm hover:bg-ink-50" aria-label="Previous">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        )}
        {i < n - 1 && (
          <button onClick={() => setI((v) => Math.min(n - 1, v + 1))} className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-ink-200 bg-white text-ink-500 shadow-sm hover:bg-ink-50" aria-label="Next">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 border-t border-ink-100 py-3">
        {slides.map((s, idx) => (
          <button key={s} onClick={() => setI(idx)} className={`h-1.5 rounded-full transition-all ${idx === i ? "w-5 bg-emerald-500" : "w-1.5 bg-ink-200 hover:bg-ink-300"}`} aria-label={`Go to slide ${idx + 1}`} />
        ))}
      </div>
    </div>
  );
}

function BigKpi({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-6 text-center ${accent ? "border-emerald-200 bg-emerald-50" : "border-ink-200 bg-ink-50/50"}`}>
      <p className={`text-4xl font-black tabular-nums ${accent ? "text-emerald-700" : "text-ink-900"} ${typeof value === "string" && value.length > 10 ? "text-2xl" : ""}`}>{value}</p>
      <p className="mt-2 text-sm font-medium text-ink-500">{label}</p>
    </div>
  );
}

function BigFunnel({ label, value, max, color, pct }: { label: string; value: number; max: number; color: string; pct?: number | null }) {
  const width = max > 0 ? Math.max((value / max) * 100, value > 0 ? 8 : 0) : 0;
  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-base font-semibold text-ink-800">{label}</span>
        <span className="tabular-nums text-ink-500">
          {value.toLocaleString()}{pct !== undefined && pct !== null && <span className="ml-2 font-semibold text-ink-400">{pct}%</span>}
        </span>
      </div>
      <div className="h-10 w-full overflow-hidden rounded-xl bg-ink-100">
        <div className="h-full rounded-xl transition-all" style={{ width: `${width}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
