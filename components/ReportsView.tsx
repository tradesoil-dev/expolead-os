"use client";

import { useMemo, useState } from "react";
import ReportChart from "@/components/ReportChart";
import Select from "@/components/Select";
import ReportsPresent from "@/components/ReportsPresent";
import { formatGroupedVolume } from "@/lib/quantity-units";

const RANGE_LABELS: Record<string, string> = {
  year: "This year",
  "90": "Last 90 days",
  "30": "Last 30 days",
  all: "All time",
};

type Conn = { id: string; created_at: string | null; interest_type: string | null; exhibition: string | null; country: string | null };
type Opp = { id: string; created_at: string | null; status: string | null; quantity: number; quantity_unit?: string | null; exhibition: string | null; market?: string | null; next_follow_up_date: string | null; next_follow_up_completed: boolean | null };

const STAGE_ORDER: { key: string; label: string; color: string }[] = [
  { key: "researching", label: "Qualified", color: "#64748b" },
  { key: "contacted", label: "Pricing", color: "#f59e0b" },
  { key: "evaluating", label: "Evaluation", color: "#38bdf8" },
  { key: "negotiating", label: "Negotiating", color: "#8b5cf6" },
  { key: "won", label: "Won", color: "#10b981" },
  { key: "lost", label: "Lost", color: "#f43f5e" },
];

const TYPE_ORDER: { key: string; label: string; color: string }[] = [
  { key: "buyer", label: "Buyers", color: "#10b981" },
  { key: "supplier", label: "Suppliers", color: "#38bdf8" },
  { key: "partner", label: "Partners", color: "#8b5cf6" },
  { key: "other", label: "Other", color: "#64748b" },
];

const EXH_COLORS = ["#10b981", "#34d399", "#6ee7b7", "#059669", "#047857", "#94a3b8"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function withinRange(dateStr: string | null, range: string): boolean {
  if (range === "all") return true;
  if (!dateStr) return false;
  const d = new Date(dateStr).getTime();
  const now = Date.now();
  if (range === "year") return new Date(dateStr).getFullYear() === new Date().getFullYear();
  const days = range === "30" ? 30 : 90;
  return d >= now - days * 86400000;
}

export default function ReportsView({ connections, opportunities, quantityUnit = "MT" }: { connections: Conn[]; opportunities: Opp[]; quantityUnit?: string }) {
  const [exhibition, setExhibition] = useState("");
  const [range, setRange] = useState("year");
  const [tStage, setTStage] = useState<"bar" | "line" | "pie">("bar");
  const [tType, setTType] = useState<"doughnut" | "pie" | "bar">("doughnut");
  const [tExh, setTExh] = useState<"bar" | "line">("bar");
  const [tTime, setTTime] = useState<"line" | "bar">("line");
  const [tCountry, setTCountry] = useState<"bar" | "pie">("bar");
  const [tMarket, setTMarket] = useState<"bar" | "pie">("bar");
  const [presenting, setPresenting] = useState(false);

  const exhibitionOptions = useMemo(() => {
    const set = new Set<string>();
    connections.forEach((c) => c.exhibition && set.add(c.exhibition));
    opportunities.forEach((o) => o.exhibition && set.add(o.exhibition));
    return [{ value: "", label: "All exhibitions" }, ...Array.from(set).sort().map((n) => ({ value: n, label: n }))];
  }, [connections, opportunities]);

  const fConns = useMemo(
    () => connections.filter((c) => (!exhibition || c.exhibition === exhibition) && withinRange(c.created_at, range)),
    [connections, exhibition, range]
  );
  const fOpps = useMemo(
    () => opportunities.filter((o) => (!exhibition || o.exhibition === exhibition) && withinRange(o.created_at, range)),
    [opportunities, exhibition, range]
  );

  const kpis = useMemo(() => {
    const active = fOpps.filter((o) => o.status !== "won" && o.status !== "lost");
    const won = fOpps.filter((o) => o.status === "won").length;
    const lost = fOpps.filter((o) => o.status === "lost").length;
    const volume = formatGroupedVolume(active, quantityUnit);
    const withFu = fOpps.filter((o) => o.next_follow_up_date);
    const doneFu = withFu.filter((o) => o.next_follow_up_completed);
    const exhibitions = new Set(fConns.map((c) => c.exhibition).filter(Boolean)).size;
    const cutoff = Date.now() - 30 * 86400000;
    const newConns = fConns.filter((c) => c.created_at && new Date(c.created_at).getTime() >= cutoff).length;
    const newOpps = fOpps.filter((o) => o.created_at && new Date(o.created_at).getTime() >= cutoff).length;
    return {
      connections: fConns.length,
      newConns,
      active: active.length,
      newOpps,
      volume,
      winRate: won + lost === 0 ? null : Math.round((won / (won + lost)) * 100),
      followUpRate: withFu.length === 0 ? null : Math.round((doneFu.length / withFu.length) * 100),
      exhibitions,
    };
  }, [fConns, fOpps, quantityUnit]);

  const stage = useMemo(() => {
    const counts = STAGE_ORDER.map((s) => fOpps.filter((o) => o.status === s.key).length);
    return { labels: STAGE_ORDER.map((s) => s.label), data: counts, colors: STAGE_ORDER.map((s) => s.color) };
  }, [fOpps]);

  const type = useMemo(() => {
    const present = TYPE_ORDER.filter((t) => fConns.some((c) => (c.interest_type ?? "other") === t.key) || t.key !== "other");
    const used = present.filter((t) => t.key !== "other" || fConns.some((c) => (c.interest_type ?? "other") === "other"));
    return {
      labels: used.map((t) => t.label),
      data: used.map((t) => fConns.filter((c) => (c.interest_type ?? "other") === t.key).length),
      colors: used.map((t) => t.color),
    };
  }, [fConns]);

  const exh = useMemo(() => {
    const map = new Map<string, number>();
    fConns.forEach((c) => { if (c.exhibition) map.set(c.exhibition, (map.get(c.exhibition) ?? 0) + 1); });
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
    return { labels: sorted.map(([n]) => n), data: sorted.map(([, v]) => v), colors: sorted.map((_, i) => EXH_COLORS[i % EXH_COLORS.length]) };
  }, [fConns]);

  const time = useMemo(() => {
    const map = new Map<string, number>();
    fConns.forEach((c) => {
      if (!c.created_at) return;
      const d = new Date(c.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    const keys = Array.from(map.keys()).sort();
    return {
      labels: keys.map((k) => { const [y, m] = k.split("-"); return `${MONTHS[Number(m)]} ${String(y).slice(2)}`; }),
      data: keys.map((k) => map.get(k) ?? 0),
      colors: ["#10b981"],
    };
  }, [fConns]);

  const country = useMemo(() => {
    const map = new Map<string, number>();
    fConns.forEach((c) => { const k = (c.country || "").trim() || "Unknown"; map.set(k, (map.get(k) ?? 0) + 1); });
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
    return { labels: sorted.map(([n]) => n), data: sorted.map(([, v]) => v), colors: sorted.map((_, i) => EXH_COLORS[i % EXH_COLORS.length]) };
  }, [fConns]);

  const market = useMemo(() => {
    const map = new Map<string, number>();
    fOpps.forEach((o) => { const k = (o.market || "").trim(); if (k) map.set(k, (map.get(k) ?? 0) + 1); });
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
    return { labels: sorted.map(([n]) => n), data: sorted.map(([, v]) => v), colors: sorted.map((_, i) => EXH_COLORS[i % EXH_COLORS.length]) };
  }, [fOpps]);

  const funnel = useMemo(() => {
    const c = fConns.length;
    const o = fOpps.length;
    const w = fOpps.filter((x) => x.status === "won").length;
    return { c, o, w };
  }, [fConns, fOpps]);

  const perExhibition = useMemo(() => {
    const names = new Set<string>();
    fConns.forEach((c) => c.exhibition && names.add(c.exhibition));
    fOpps.forEach((o) => o.exhibition && names.add(o.exhibition));
    return Array.from(names)
      .map((name) => {
        const conns = fConns.filter((c) => c.exhibition === name).length;
        const opps = fOpps.filter((o) => o.exhibition === name);
        const won = opps.filter((o) => o.status === "won").length;
        const lost = opps.filter((o) => o.status === "lost").length;
        const active = opps.filter((o) => o.status !== "won" && o.status !== "lost");
        const winRate = won + lost === 0 ? null : Math.round((won / (won + lost)) * 100);
        return { name, conns, opps: opps.length, won, winRate, volume: formatGroupedVolume(active, quantityUnit) };
      })
      .sort((a, b) => b.conns - a.conns);
  }, [fConns, fOpps, quantityUnit]);

  const hasData = connections.length > 0 || opportunities.length > 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {hasData && (
          <button
            onClick={() => setPresenting(true)}
            className="mr-auto inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h20v14H2z"/><path d="M8 21h8M12 17v4"/></svg>
            Present
          </button>
        )}
        <div className="w-48"><Select value={exhibition} onChange={setExhibition} options={exhibitionOptions} className="py-2" /></div>
        <div className="w-40"><Select value={range} onChange={setRange} className="py-2" options={[
          { value: "year", label: "This year" },
          { value: "90", label: "Last 90 days" },
          { value: "30", label: "Last 30 days" },
          { value: "all", label: "All time" },
        ]} /></div>
      </div>

      {presenting && (
        <ReportsPresent
          title={exhibition || "All exhibitions"}
          rangeLabel={RANGE_LABELS[range] ?? "This year"}
          kpis={kpis}
          charts={[
            { key: "stage", heading: "Pipeline by stage", type: "bar", data: stage },
            { key: "type", heading: "Connections by type", type: "doughnut", data: type },
            { key: "exh", heading: "Leads by exhibition", type: "bar", data: exh },
            { key: "time", heading: "Connections added over time", type: "line", data: time },
            { key: "country", heading: "Connections by country", type: "bar", data: country },
            { key: "market", heading: "Opportunities by market", type: "bar", data: market },
          ]}
          funnel={funnel}
          perExhibition={perExhibition}
          onClose={() => setPresenting(false)}
        />
      )}

      {!hasData ? (
        <div className="rounded-xl border border-ink-200 bg-white px-4 py-16 text-center">
          <p className="text-sm font-semibold text-slate-900">No data to report yet</p>
          <p className="mt-1 text-sm text-slate-500">Capture connections and create opportunities, and your charts will fill in here.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <Kpi label="Connections" value={kpis.connections} sub={kpis.newConns > 0 ? `+${kpis.newConns} in 30d` : undefined} />
            <Kpi label="Active opportunities" value={kpis.active} sub={kpis.newOpps > 0 ? `+${kpis.newOpps} in 30d` : undefined} />
            <Kpi label="Pipeline volume" value={kpis.volume} />
            <Kpi label="Win rate" value={kpis.winRate === null ? "—" : `${kpis.winRate}%`} />
            <Kpi label="Follow-up rate" value={kpis.followUpRate === null ? "—" : `${kpis.followUpRate}%`} />
            <Kpi label="Exhibitions" value={kpis.exhibitions} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Pipeline by stage" seg={<Seg value={tStage} onChange={(v) => setTStage(v as any)} options={["bar", "line", "pie"]} labels={["Bar", "Line", "Pie"]} />}>
              <ReportChart type={tStage} labels={stage.labels} data={stage.data} colors={stage.colors} />
            </Card>
            <Card title="Connections by type" seg={<Seg value={tType} onChange={(v) => setTType(v as any)} options={["doughnut", "pie", "bar"]} labels={["Donut", "Pie", "Bar"]} />}>
              <ReportChart type={tType} labels={type.labels} data={type.data} colors={type.colors} />
            </Card>
            <Card title="Leads by exhibition" seg={<Seg value={tExh} onChange={(v) => setTExh(v as any)} options={["bar", "line"]} labels={["Bar", "Line"]} />}>
              <ReportChart type={tExh} labels={exh.labels} data={exh.data} colors={exh.colors} />
            </Card>
            <Card title="Connections added over time" seg={<Seg value={tTime} onChange={(v) => setTTime(v as any)} options={["line", "bar"]} labels={["Line", "Bar"]} />}>
              <ReportChart type={tTime} labels={time.labels} data={time.data} colors={time.colors} />
            </Card>
            {country.labels.length > 0 && (
              <Card title="Connections by country" seg={<Seg value={tCountry} onChange={(v) => setTCountry(v as any)} options={["bar", "pie"]} labels={["Bar", "Pie"]} />}>
                <ReportChart type={tCountry} labels={country.labels} data={country.data} colors={country.colors} />
              </Card>
            )}
            {market.labels.length > 0 && (
              <Card title="Opportunities by market" seg={<Seg value={tMarket} onChange={(v) => setTMarket(v as any)} options={["bar", "pie"]} labels={["Bar", "Pie"]} />}>
                <ReportChart type={tMarket} labels={market.labels} data={market.data} colors={market.colors} />
              </Card>
            )}
          </div>

          <div className="rounded-2xl border border-ink-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-bold text-slate-900">Conversion funnel</h3>
            <FunnelBar label="Connections captured" value={funnel.c} max={funnel.c} color="#10b981" />
            <FunnelBar label="Opportunities created" value={funnel.o} max={funnel.c} color="#38bdf8" pct={funnel.c ? Math.round((funnel.o / funnel.c) * 100) : null} />
            <FunnelBar label="Deals won" value={funnel.w} max={funnel.c} color="#8b5cf6" pct={funnel.c ? Math.round((funnel.w / funnel.c) * 100) : null} />
          </div>

          <div className="rounded-2xl border border-ink-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-bold text-slate-900">Performance by exhibition</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-3">Exhibition</th>
                    <th className="py-2 pr-3 text-right">Connections</th>
                    <th className="py-2 pr-3 text-right">Opportunities</th>
                    <th className="py-2 pr-3 text-right">Won</th>
                    <th className="py-2 pr-3 text-right">Win rate</th>
                    <th className="py-2 text-right">Pipeline volume</th>
                  </tr>
                </thead>
                <tbody>
                  {perExhibition.length === 0 ? (
                    <tr><td colSpan={6} className="py-6 text-center text-slate-400">No exhibition data in this range.</td></tr>
                  ) : (
                    perExhibition.map((r) => (
                      <tr key={r.name} className="border-b border-ink-50 last:border-0">
                        <td className="py-2.5 pr-3 font-semibold text-slate-900">{r.name}</td>
                        <td className="py-2.5 pr-3 text-right tabular-nums text-slate-700">{r.conns}</td>
                        <td className="py-2.5 pr-3 text-right tabular-nums text-slate-700">{r.opps}</td>
                        <td className="py-2.5 pr-3 text-right tabular-nums text-emerald-700 font-semibold">{r.won}</td>
                        <td className="py-2.5 pr-3 text-right tabular-nums text-slate-700">{r.winRate === null ? "—" : `${r.winRate}%`}</td>
                        <td className="py-2.5 text-right tabular-nums text-slate-700">{r.volume}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FunnelBar({ label, value, max, color, pct }: { label: string; value: number; max: number; color: string; pct?: number | null }) {
  const width = max > 0 ? Math.max((value / max) * 100, value > 0 ? 6 : 0) : 0;
  return (
    <div className="mb-2.5 last:mb-0">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="tabular-nums text-slate-500">
          {value.toLocaleString()}{pct !== undefined && pct !== null && <span className="ml-2 font-semibold text-slate-400">{pct}%</span>}
        </span>
      </div>
      <div className="h-6 w-full overflow-hidden rounded-lg bg-slate-100">
        <div className="h-full rounded-lg transition-all" style={{ width: `${width}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function Kpi({ label, value, unit, sub }: { label: string; value: string | number; unit?: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-4">
      <p className="text-[11px] font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight tabular-nums text-slate-900">
        {value}{unit && <span className="ml-1 text-sm font-semibold text-slate-500">{unit}</span>}
      </p>
      {sub && <p className="mt-0.5 text-[11px] font-bold text-emerald-600">{sub}</p>}
    </div>
  );
}

function Card({ title, seg, children }: { title: string; seg: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {seg}
      </div>
      <div className="relative h-[230px]">{children}</div>
    </div>
  );
}

function Seg({ value, onChange, options, labels }: { value: string; onChange: (v: string) => void; options: string[]; labels: string[] }) {
  return (
    <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
      {options.map((o, i) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${value === o ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          {labels[i]}
        </button>
      ))}
    </div>
  );
}
