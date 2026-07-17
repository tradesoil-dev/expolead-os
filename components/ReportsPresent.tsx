"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-white">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-white px-6 py-3">
        <div className="flex items-center gap-2.5">
          <svg width="22" height="22" viewBox="0 0 40 40" fill="none"><rect x="1" y="1" width="17" height="17" rx="3" stroke="#0f172a" strokeWidth="2.2"/><rect x="22" y="1" width="17" height="17" rx="3" stroke="#0f172a" strokeWidth="2.2"/><rect x="1" y="22" width="17" height="17" rx="3" stroke="#0f172a" strokeWidth="2.2"/><rect x="22" y="22" width="17" height="17" rx="3" fill="#10b981"/></svg>
          <span className="text-sm font-semibold text-ink-900">{title}</span>
          <span className="text-sm text-ink-400">· {rangeLabel}</span>
        </div>
        <button onClick={onClose} className="inline-flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-semibold text-ink-600 hover:bg-ink-50" aria-label="Exit presentation">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          Exit
        </button>
      </div>

      {/* Scrollable single page */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl space-y-10 px-6 py-10">
          {/* Title block */}
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">Exhibition report</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-ink-900 md:text-5xl">{title}</h1>
            <p className="mt-3 text-lg text-ink-500">{rangeLabel}</p>
          </div>

          {/* KPIs */}
          <section>
            <h2 className="mb-4 text-center text-lg font-bold uppercase tracking-wide text-ink-400">The headline numbers</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              <BigKpi label="Connections" value={kpis.connections} />
              <BigKpi label="Active opportunities" value={kpis.active} />
              <BigKpi label="Pipeline volume" value={kpis.volume} />
              <BigKpi label="Win rate" value={kpis.winRate === null ? "—" : `${kpis.winRate}%`} accent />
              <BigKpi label="Follow-up rate" value={kpis.followUpRate === null ? "—" : `${kpis.followUpRate}%`} accent />
              <BigKpi label="Exhibitions" value={kpis.exhibitions} />
            </div>
          </section>

          {/* Charts */}
          {activeCharts.length > 0 && (
            <section className="grid gap-5 md:grid-cols-2">
              {activeCharts.map((c) => (
                <div key={c.key} className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
                  <h3 className="mb-3 text-base font-bold text-ink-900">{c.heading}</h3>
                  <div className="relative h-[320px]">
                    <ReportChart type={c.type as "line" | "bar" | "pie" | "doughnut"} labels={c.data.labels} data={c.data.data} colors={c.data.colors} />
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Funnel */}
          <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
            <h3 className="mb-5 text-base font-bold text-ink-900">Conversion funnel</h3>
            <BigFunnel label="Connections captured" value={funnel.c} max={funnel.c} color="#10b981" />
            <BigFunnel label="Opportunities created" value={funnel.o} max={funnel.c} color="#38bdf8" pct={funnel.c ? Math.round((funnel.o / funnel.c) * 100) : null} />
            <BigFunnel label="Deals won" value={funnel.w} max={funnel.c} color="#8b5cf6" pct={funnel.c ? Math.round((funnel.w / funnel.c) * 100) : null} />
          </section>

          {/* Per-exhibition table */}
          {perExhibition.length > 0 && (
            <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
              <h3 className="mb-4 text-base font-bold text-ink-900">Performance by exhibition</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
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
                        <td className="py-3 pr-3 font-semibold text-ink-900">{r.name}</td>
                        <td className="py-3 pr-3 text-right tabular-nums text-ink-700">{r.conns}</td>
                        <td className="py-3 pr-3 text-right tabular-nums text-ink-700">{r.opps}</td>
                        <td className="py-3 pr-3 text-right font-semibold tabular-nums text-emerald-700">{r.won}</td>
                        <td className="py-3 pr-3 text-right tabular-nums text-ink-700">{r.winRate === null ? "—" : `${r.winRate}%`}</td>
                        <td className="py-3 text-right tabular-nums text-ink-700">{r.volume}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Summary */}
          <div className="border-t border-ink-100 pt-8 text-center">
            <h2 className="mx-auto max-w-3xl text-2xl font-black leading-tight tracking-tight text-ink-900 md:text-3xl">
              {kpis.connections} connections captured, {kpis.active} live opportunities, {kpis.winRate === null ? "no closes yet" : `${kpis.winRate}% win rate`}.
            </h2>
            <p className="mt-3 text-ink-500">Every lead captured, every follow-up tracked, every show measured.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BigKpi({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 text-center ${accent ? "border-emerald-200 bg-emerald-50" : "border-ink-200 bg-ink-50/50"}`}>
      <p className={`font-black tabular-nums ${accent ? "text-emerald-700" : "text-ink-900"} ${typeof value === "string" && value.length > 10 ? "text-xl" : "text-3xl"}`}>{value}</p>
      <p className="mt-1.5 text-xs font-medium text-ink-500">{label}</p>
    </div>
  );
}

function BigFunnel({ label, value, max, color, pct }: { label: string; value: number; max: number; color: string; pct?: number | null }) {
  const width = max > 0 ? Math.max((value / max) * 100, value > 0 ? 8 : 0) : 0;
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink-800">{label}</span>
        <span className="tabular-nums text-ink-500">
          {value.toLocaleString()}{pct !== undefined && pct !== null && <span className="ml-2 font-semibold text-ink-400">{pct}%</span>}
        </span>
      </div>
      <div className="h-8 w-full overflow-hidden rounded-xl bg-ink-100">
        <div className="h-full rounded-xl transition-all" style={{ width: `${width}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
