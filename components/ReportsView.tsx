"use client";

import { useMemo, useState } from "react";
import ReportChart from "@/components/ReportChart";
import Select from "@/components/Select";
import ReportsPresent from "@/components/ReportsPresent";
import { formatGroupedVolume } from "@/lib/quantity-units";
import { TRADE_MODELS } from "@/lib/types";
import RoiPanel from "@/components/RoiPanel";

const RANGE_LABELS: Record<string, string> = {
  year: "This year",
  lastyear: "Last year",
  all: "All time",
};

type Conn = { id: string; created_at: string | null; interest_type: string | null; exhibition: string | null; country: string | null; trade_models?: string[]; follow_up_date?: string | null; follow_up_status?: string | null; follow_up_completed?: boolean | null };
type Opp = { id: string; created_at: string | null; status: string | null; deal_value?: number | null; quantity: number; quantity_unit?: string | null; exhibition: string | null; market?: string | null; next_follow_up_date: string | null; next_follow_up_completed: boolean | null; trade_models?: string[]; products?: { quantity: unknown; quantity_unit?: string | null }[] };

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

// Distinct categorical hues so pie / doughnut slices and bars are easy to tell
// apart (the old all-green ramp blended together in a pie). Emerald stays first
// to keep the brand accent leading.
const EXH_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#14b8a6", "#ec4899", "#f97316", "#06b6d4", "#84cc16"];
const TM_COLORS = ["#10b981", "#38bdf8", "#f59e0b", "#8b5cf6", "#f43f5e", "#14b8a6"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function withinRange(dateStr: string | null, range: string): boolean {
  if (range === "all") return true;
  if (!dateStr) return false;
  // Exhibitions are annual, so the report reasons in calendar years, not rolling
  // day-windows (a 30/90-day window rarely lines up with a show).
  const year = new Date(dateStr).getFullYear();
  const thisYear = new Date().getFullYear();
  if (range === "lastyear") return year === thisYear - 1;
  return year === thisYear; // "year" = this year (the default)
}

export default function ReportsView({ connections, opportunities, quantityUnit = "MT", currency = "USD", exhibitionCosts = [] }: { connections: Conn[]; opportunities: Opp[]; quantityUnit?: string; currency?: string; exhibitionCosts?: { name: string; cost: number | null }[] }) {
  const [exhibition, setExhibition] = useState("");
  const [range, setRange] = useState("year");
  const [tStage, setTStage] = useState<"bar" | "line" | "pie">("bar");
  const [tType, setTType] = useState<"doughnut" | "pie" | "bar">("doughnut");
  const [tExh, setTExh] = useState<"bar" | "line">("bar");
  const [tTime, setTTime] = useState<"line" | "bar">("line");
  const [tCountry, setTCountry] = useState<"bar" | "pie">("bar");
  const [tMarket, setTMarket] = useState<"bar" | "pie">("bar");
  const [tTm, setTTm] = useState<"bar" | "doughnut">("bar");
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
    const volume = formatGroupedVolume(active.flatMap((o) => o.products ?? []), quantityUnit);
    const withFu = fOpps.filter((o) => o.next_follow_up_date);
    const doneFu = withFu.filter((o) => o.next_follow_up_completed);
    const exhibitions = new Set(fConns.map((c) => c.exhibition).filter(Boolean)).size;
    return {
      connections: fConns.length,
      active: active.length,
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
      colors: keys.map((_, i) => EXH_COLORS[i % EXH_COLORS.length]),
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

  // Connections by trade model (counts). A connection can hold several models,
  // so this is not mutually exclusive.
  const tradeModel = useMemo(() => {
    const items = TRADE_MODELS
      .map((tm) => ({ label: tm.label, count: fConns.filter((c) => (c.trade_models ?? []).includes(tm.value)).length }))
      .filter((x) => x.count > 0);
    return { labels: items.map((x) => x.label), data: items.map((x) => x.count), colors: items.map((_, i) => TM_COLORS[i % TM_COLORS.length]) };
  }, [fConns]);

  // Performance per trade model, using opportunities linked to connections.
  const perTradeModel = useMemo(() => {
    return TRADE_MODELS
      .map((tm) => {
        const conns = fConns.filter((c) => (c.trade_models ?? []).includes(tm.value)).length;
        const opps = fOpps.filter((o) => (o.trade_models ?? []).includes(tm.value));
        const won = opps.filter((o) => o.status === "won").length;
        const lost = opps.filter((o) => o.status === "lost").length;
        const active = opps.filter((o) => o.status !== "won" && o.status !== "lost");
        const winRate = won + lost === 0 ? null : Math.round((won / (won + lost)) * 100);
        const value = active.reduce((sum, o) => sum + (Number(o.deal_value) || 0), 0);
        return { key: tm.value, label: tm.label, conns, opps: opps.length, won, winRate, value };
      })
      .filter((r) => r.conns > 0 || r.opps > 0)
      .sort((a, b) => b.conns - a.conns);
  }, [fConns, fOpps]);

  // Follow-ups reflect current due state, so they are filtered by exhibition
  // only (not the created-at date range) and cover connections + opportunities.
  const followUps = useMemo(() => {
    const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); };
    const today = startOfDay(new Date());
    let overdue = 0, due = 0, upcoming = 0, scheduled = 0, completed = 0;

    const bucket = (dateStr: string) => {
      const d = startOfDay(new Date(dateStr));
      if (d < today) overdue++; else if (d === today) due++; else upcoming++;
    };

    connections
      .filter((c) => !exhibition || c.exhibition === exhibition)
      .forEach((c) => {
        if (c.follow_up_completed) { scheduled++; completed++; return; }
        if (c.follow_up_date && c.follow_up_status !== "closed") { scheduled++; bucket(c.follow_up_date); }
      });

    opportunities
      .filter((o) => !exhibition || o.exhibition === exhibition)
      .forEach((o) => {
        if (o.next_follow_up_completed) { scheduled++; completed++; return; }
        if (o.next_follow_up_date) { scheduled++; bucket(o.next_follow_up_date); }
      });

    return { overdue, due, upcoming, rate: scheduled === 0 ? null : Math.round((completed / scheduled) * 100) };
  }, [connections, opportunities, exhibition]);

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
        return { name, conns, opps: opps.length, won, winRate, volume: formatGroupedVolume(active.flatMap((o) => o.products ?? []), quantityUnit) };
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
          { value: "lastyear", label: "Last year" },
          { value: "all", label: "All time" },
        ]} /></div>
      </div>

      {presenting && (
        <ReportsPresent
          title={exhibition || "All exhibitions"}
          rangeLabel={RANGE_LABELS[range] ?? "This year"}
          kpis={{ ...kpis, followUpRate: followUps.rate }}
          charts={[
            { key: "stage", heading: "Pipeline by stage", type: "bar", data: stage },
            { key: "type", heading: "Connections by type", type: "doughnut", data: type },
            { key: "exh", heading: "Leads by exhibition", type: "bar", data: exh },
            ...(!exhibition ? [{ key: "time", heading: "Connections added over time", type: "line" as const, data: time }] : []),
            { key: "country", heading: "Connections by country", type: "bar", data: country },
            { key: "market", heading: "Opportunities by market", type: "bar", data: market },
            ...(tradeModel.labels.length > 0 ? [{ key: "tradeModel", heading: "Connections by trade model", type: "bar", data: tradeModel }] : []),
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
            <Kpi label="Connections" value={kpis.connections} />
            <Kpi label="Active opportunities" value={kpis.active} />
            <Kpi label="Pipeline volume" value={kpis.volume} />
            <Kpi label="Win rate" value={kpis.winRate === null ? "—" : `${kpis.winRate}%`} />
            <Kpi label="Follow-up rate" value={followUps.rate === null ? "—" : `${followUps.rate}%`} />
            <Kpi label="Exhibitions" value={kpis.exhibitions} />
          </div>

          <div className="rounded-2xl border border-ink-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-bold text-emerald-800">Follow-ups</h3>
            <div className="grid grid-cols-3 gap-3">
              <FuStat label="Overdue" value={followUps.overdue} tone="red" />
              <FuStat label="Due today" value={followUps.due} tone="amber" />
              <FuStat label="Upcoming" value={followUps.upcoming} tone="emerald" />
            </div>
          </div>

          <RoiPanel
            opportunities={fOpps}
            exhibitionCosts={exhibitionCosts}
            currency={currency}
            exhibition={exhibition}
          />

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
            {!exhibition && (
              <Card title="Connections added over time" seg={<Seg value={tTime} onChange={(v) => setTTime(v as any)} options={["line", "bar"]} labels={["Line", "Bar"]} />}>
                <ReportChart type={tTime} labels={time.labels} data={time.data} colors={time.colors} />
              </Card>
            )}
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
            {tradeModel.labels.length > 0 && (
              <Card title="Connections by trade model" seg={<Seg value={tTm} onChange={(v) => setTTm(v as any)} options={["bar", "doughnut"]} labels={["Bar", "Donut"]} />}>
                <ReportChart type={tTm} labels={tradeModel.labels} data={tradeModel.data} colors={tradeModel.colors} />
              </Card>
            )}
          </div>

          <div className="rounded-2xl border border-ink-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-bold text-emerald-800">Conversion funnel</h3>
            <FunnelBar label="Connections captured" value={funnel.c} max={funnel.c} color="#10b981" />
            <FunnelBar label="Opportunities created" value={funnel.o} max={funnel.c} color="#38bdf8" pct={funnel.c ? Math.round((funnel.o / funnel.c) * 100) : null} />
            <FunnelBar label="Deals won" value={funnel.w} max={funnel.c} color="#8b5cf6" pct={funnel.c ? Math.round((funnel.w / funnel.c) * 100) : null} />
          </div>

          <div className="rounded-2xl border border-ink-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-bold text-emerald-800">Performance by exhibition</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-left text-[11px] font-bold uppercase tracking-wide text-emerald-700">
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

          {perTradeModel.length > 0 && (
            <div className="rounded-2xl border border-ink-200 bg-white p-4">
              <h3 className="mb-1 text-sm font-bold text-emerald-800">Performance by trade model</h3>
              <p className="mb-3 text-xs text-slate-500">Opportunities count, win rate and pipeline value come from opportunities linked to a connection.</p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-ink-100 text-left text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                      <th className="py-2 pr-3">Trade model</th>
                      <th className="py-2 pr-3 text-right">Connections</th>
                      <th className="py-2 pr-3 text-right">Opportunities</th>
                      <th className="py-2 pr-3 text-right">Won</th>
                      <th className="py-2 pr-3 text-right">Win rate</th>
                      <th className="py-2 text-right">Pipeline value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perTradeModel.map((r) => (
                      <tr key={r.key} className="border-b border-ink-50 last:border-0">
                        <td className="py-2.5 pr-3 font-semibold text-slate-900">{r.label}</td>
                        <td className="py-2.5 pr-3 text-right tabular-nums text-slate-700">{r.conns}</td>
                        <td className="py-2.5 pr-3 text-right tabular-nums text-slate-700">{r.opps}</td>
                        <td className="py-2.5 pr-3 text-right tabular-nums text-emerald-700 font-semibold">{r.won}</td>
                        <td className="py-2.5 pr-3 text-right tabular-nums text-slate-700">{r.winRate === null ? "—" : `${r.winRate}%`}</td>
                        <td className="py-2.5 text-right tabular-nums text-slate-700">{r.value > 0 ? `${currency} ${r.value.toLocaleString()}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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

function FuStat({ label, value, tone }: { label: string; value: number; tone: "red" | "amber" | "emerald" }) {
  const color = tone === "red" ? "text-rose-600" : tone === "amber" ? "text-amber-600" : "text-emerald-600";
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4 text-center">
      <p className={`text-2xl font-extrabold tabular-nums ${color}`}>{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
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
