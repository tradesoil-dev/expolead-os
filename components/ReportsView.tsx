"use client";

import { useMemo, useState } from "react";
import ReportChart from "@/components/ReportChart";
import Select from "@/components/Select";

type Conn = { id: string; created_at: string | null; interest_type: string | null; exhibition: string | null };
type Opp = { id: string; created_at: string | null; status: string | null; quantity: number; exhibition: string | null; next_follow_up_date: string | null; next_follow_up_completed: boolean | null };

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

export default function ReportsView({ connections, opportunities }: { connections: Conn[]; opportunities: Opp[] }) {
  const [exhibition, setExhibition] = useState("");
  const [range, setRange] = useState("year");
  const [tStage, setTStage] = useState<"bar" | "line" | "pie">("bar");
  const [tType, setTType] = useState<"doughnut" | "pie" | "bar">("doughnut");
  const [tExh, setTExh] = useState<"bar" | "line">("bar");
  const [tTime, setTTime] = useState<"line" | "bar">("line");

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
    const volume = active.reduce((t, o) => t + (Number(o.quantity) || 0), 0);
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
  }, [fConns, fOpps]);

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

  const hasData = connections.length > 0 || opportunities.length > 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="w-48"><Select value={exhibition} onChange={setExhibition} options={exhibitionOptions} className="py-2" /></div>
        <div className="w-40"><Select value={range} onChange={setRange} className="py-2" options={[
          { value: "year", label: "This year" },
          { value: "90", label: "Last 90 days" },
          { value: "30", label: "Last 30 days" },
          { value: "all", label: "All time" },
        ]} /></div>
      </div>

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
            <Kpi label="Pipeline volume" value={`${kpis.volume.toLocaleString()}`} unit="MT" />
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
          </div>
        </>
      )}
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
