"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import WorldMap, { type MapPoint } from "@/components/WorldMap";
import DeltaChip from "@/components/DeltaChip";
import { canonicalCountry } from "@/lib/geo/country";
import { formatMoney } from "@/lib/currencies";
import { opportunityStatusLabel, type Opportunity } from "@/lib/types";

// The new Reports "Overview" pieces: headline numbers with change chips,
// pipeline value by exhibition, deals by outcome, a location map with a metric
// picker, and the biggest open deals. All figures come from the user's own
// connections and opportunities (already filtered by exhibition and period).

export type OvConn = { id: string; exhibition: string | null; country: string | null };
export type OvOpp = {
  id: string;
  name?: string | null;
  supplier_name?: string | null;
  country?: string | null; // from the linked connection
  status: string | null;
  deal_value?: number | null;
  exhibition: string | null;
  created_at: string | null;
  next_follow_up_date: string | null;
  next_follow_up_completed: boolean | null;
};

const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
// "USD 21k" style, for tight table cells.
function compactMoney(v: number, currency: string) {
  const a = Math.abs(v);
  const s = a >= 1_000_000 ? `${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}M` : a >= 1000 ? `${(v / 1000).toFixed(a >= 10000 ? 0 : 1).replace(/\.0$/, "")}k` : String(Math.round(v));
  return `${currency} ${s}`;
}
const isOpen = (o: OvOpp) => o.status !== "won" && o.status !== "lost";
const card = "rounded-2xl border border-ink-200 bg-white overflow-hidden";
const head = "flex items-center gap-2.5 border-b border-ink-100 px-4 py-3";

function Icon({ d, tone = "emerald" }: { d: string; tone?: "emerald" | "amber" }) {
  const cls = tone === "amber" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600";
  return (
    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${cls}`}>
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
    </span>
  );
}
const GLOBE = "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18";
const CAL = "M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 10h18";
const PIE = "M12 3a9 9 0 1 0 9 9h-9z";
const ALERT = "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01";

/* ───────────── Headline numbers ───────────── */

export type Headline = { label: string; value: string; delta: number | null; unit?: "%" | " pts" | ""; goodWhenUp?: boolean; sub: string };

export function HeadlineStrip({ items }: { items: Headline[] }) {
  return (
    <div className="grid grid-cols-2 gap-y-5 lg:grid-cols-4">
      {items.map((k, i) => (
        <div key={k.label} className={`px-0 lg:px-5 ${i > 0 ? "lg:border-l lg:border-ink-200" : "lg:pl-0"}`}>
          <p className="text-[12.5px] text-ink-500">{k.label}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="text-[26px] font-semibold tracking-tight tabular-nums text-ink-900">{k.value}</span>
            <DeltaChip value={k.delta} unit={k.unit ?? "%"} goodWhenUp={k.goodWhenUp ?? true} />
          </div>
          <p className="mt-1 text-[11.5px] text-ink-400">{k.sub}</p>
        </div>
      ))}
    </div>
  );
}

/* ───────────── Pipeline value by exhibition ───────────── */

export function ExhibitionValueBars({ opps, currency }: { opps: OvOpp[]; currency: string }) {
  const rows = useMemo(() => {
    const m = new Map<string, number>();
    for (const o of opps) if (isOpen(o) && o.exhibition) m.set(o.exhibition, (m.get(o.exhibition) ?? 0) + num(o.deal_value));
    return Array.from(m.entries()).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 7);
  }, [opps]);
  const max = rows[0]?.[1] ?? 0;
  const avg = rows.length ? rows.reduce((s, r) => s + r[1], 0) / rows.length : 0;

  return (
    <div className={card}>
      <div className={head}>
        <Icon d={CAL} />
        <h3 className="text-sm font-semibold text-ink-900">Pipeline value by exhibition</h3>
        {rows.length > 1 && <span className="ml-auto text-xs text-ink-400">Average per show {formatMoney(avg, currency)}</span>}
      </div>
      <div className="px-4 py-3">
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-400">Add a deal value and exhibition to opportunities to see this.</p>
        ) : (
          rows.map(([name, v], i) => {
            const vsAvg = rows.length > 1 && avg > 0 ? Math.round(((v - avg) / avg) * 100) : null;
            return (
              <div key={name} className="grid grid-cols-[minmax(0,140px)_1fr_auto_auto] items-center gap-3 py-2 text-sm">
                <span className="truncate text-ink-800" title={name}>{name}</span>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full" style={{ width: `${(v / max) * 100}%`, background: i < 2 ? "#10b981" : i < 3 ? "#34d399" : "#cbd5e1" }} />
                </div>
                <span className="text-right tabular-nums text-ink-700">{formatMoney(v, currency)}</span>
                <span className="w-[86px] text-right">{vsAvg !== null && <DeltaChip value={vsAvg} suffix="vs avg" />}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ───────────── Deals by outcome ───────────── */

export function OutcomeDonut({ opps, currency }: { opps: OvOpp[]; currency: string }) {
  let open = 0, won = 0, lost = 0, wonN = 0, lostN = 0;
  for (const o of opps) {
    const v = num(o.deal_value);
    if (o.status === "won") { won += v; wonN++; } else if (o.status === "lost") { lost += v; lostN++; } else open += v;
  }
  const total = open + won + lost;
  const winRate = wonN + lostN ? Math.round((wonN / (wonN + lostN)) * 100) : null;
  const C = 2 * Math.PI * 44;
  const seg = [
    { label: "Open", v: open, color: "#0f172a" },
    { label: "Won", v: won, color: "#10b981" },
    { label: "Lost", v: lost, color: "#fb7185" },
  ];
  let offset = 0;

  return (
    <div className={card}>
      <div className={head}><Icon d={PIE} /><h3 className="text-sm font-semibold text-ink-900">Deals by outcome</h3></div>
      <div className="px-4 py-4">
        {total === 0 ? (
          <p className="py-8 text-center text-sm text-ink-400">Add deal values to opportunities to see open, won and lost value.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-5">
            <svg viewBox="0 0 120 120" className="h-36 w-36 shrink-0" role="img" aria-label="Deal value by outcome">
              <circle cx="60" cy="60" r="44" fill="none" stroke="#e2e8f0" strokeWidth="16" />
              {seg.map((s) => {
                const len = (s.v / total) * C;
                const el = len > 0 && (
                  <circle key={s.label} cx="60" cy="60" r="44" fill="none" stroke={s.color} strokeWidth="16" strokeDasharray={`${len} ${C}`} strokeDashoffset={-offset} transform="rotate(-90 60 60)" />
                );
                offset += len;
                return el;
              })}
              <text x="60" y="58" textAnchor="middle" fontSize="17" fontWeight="700" fill="#0f172a">{winRate === null ? "—" : `${winRate}%`}</text>
              <text x="60" y="73" textAnchor="middle" fontSize="9" fill="#64748b">win rate</text>
            </svg>
            <div className="grid gap-2.5 text-[12.5px]">
              {seg.map((s) => (
                <div key={s.label}>
                  <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-ink-600">{s.label}</span>
                  <div><b className="text-base tabular-nums text-ink-900">{formatMoney(s.v, currency)}</b> <span className="text-ink-400">{Math.round((s.v / total) * 100)}%</span></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────── By location ───────────── */

type Metric = "conns" | "opps" | "pipeline" | "won" | "winrate";
const METRICS: { key: Metric; label: string; noun: string }[] = [
  { key: "conns", label: "Connections (leads)", noun: "connections" },
  { key: "opps", label: "Opportunities", noun: "opportunities" },
  { key: "pipeline", label: "Pipeline value", noun: "pipeline" },
  { key: "won", label: "Won revenue", noun: "won revenue" },
  { key: "winrate", label: "Win rate", noun: "win rate" },
];

export function LocationCard({ conns, opps, currency }: { conns: OvConn[]; opps: OvOpp[]; currency: string }) {
  const [metric, setMetric] = useState<Metric>("conns");

  const { rows, unplaced } = useMemo(() => {
    const m = new Map<string, { conns: number; opps: number; pipeline: number; won: number; wonN: number; lostN: number }>();
    const get = (c: string) => {
      if (!m.has(c)) m.set(c, { conns: 0, opps: 0, pipeline: 0, won: 0, wonN: 0, lostN: 0 });
      return m.get(c)!;
    };
    let unplaced = 0;
    for (const c of conns) {
      const k = canonicalCountry(c.country);
      if (!k) { if ((c.country ?? "").trim()) unplaced++; continue; }
      get(k).conns++;
    }
    for (const o of opps) {
      const k = canonicalCountry(o.country);
      if (!k) continue;
      const r = get(k);
      r.opps++;
      if (o.status === "won") { r.won += num(o.deal_value); r.wonN++; }
      else if (o.status === "lost") r.lostN++;
      else r.pipeline += num(o.deal_value);
    }
    const rows = Array.from(m.entries()).map(([country, r]) => ({
      country,
      ...r,
      winrate: r.wonN + r.lostN ? Math.round((r.wonN / (r.wonN + r.lostN)) * 100) : null,
    }));
    return { rows, unplaced };
  }, [conns, opps]);

  const valueOf = (r: (typeof rows)[number]) => (metric === "winrate" ? r.winrate ?? 0 : r[metric]);
  const fmt = (v: number) => (metric === "pipeline" || metric === "won" ? formatMoney(v, currency) : metric === "winrate" ? `${v}%` : String(v));
  const sorted = [...rows].filter((r) => valueOf(r) > 0).sort((a, b) => valueOf(b) - valueOf(a));
  const meta = METRICS.find((x) => x.key === metric)!;
  const points: MapPoint[] = sorted.map((r) => ({ country: r.country, value: valueOf(r), label: `${fmt(valueOf(r))} ${meta.noun}` }));
  const top = sorted[0];

  return (
    <div className={card}>
      <div className={`${head} flex-wrap`}>
        <Icon d={GLOBE} />
        <h3 className="text-sm font-semibold text-ink-900">By location</h3>
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value as Metric)}
          className="ml-auto h-8 rounded-full border border-ink-200 bg-white px-3 text-xs font-medium text-ink-700 outline-none focus:border-emerald-500"
          aria-label="What the map shows"
        >
          {METRICS.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
        </select>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-12 text-center text-sm text-ink-400">Add a country to your connections and they will appear on the map.</p>
      ) : (
        <div className="grid gap-5 p-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] xl:items-start">
          <div>
            <WorldMap points={points} ariaLabel={`Map of ${meta.noun} by country`} />
            {top && (
              <p className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-[12.5px] text-sky-900">
                <b>{top.country}</b> leads on {meta.noun} with {fmt(valueOf(top))}.
                {metric === "conns" && " Switch the view to see where leads turn into revenue."}
              </p>
            )}
            {unplaced > 0 && <p className="mt-2 text-[11px] text-ink-400">{unplaced} {unplaced === 1 ? "connection has a country" : "connections have a country"} we could not place on the map.</p>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-slate-50 text-left text-[11.5px] font-medium text-ink-400">
                  <th className="px-3 py-2">Country</th>
                  <th className="px-3 py-2 text-right">Leads</th>
                  <th className="px-3 py-2 text-right">Pipeline</th>
                  <th className="px-3 py-2 text-right">Won</th>
                  <th className="px-3 py-2 text-right">Win rate</th>
                </tr>
              </thead>
              <tbody>
                {(sorted.length ? sorted : rows).slice(0, 8).map((r) => (
                  <tr key={r.country} className="border-b border-ink-50 last:border-0">
                    <td className="px-3 py-2 font-medium text-ink-800">{r.country}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-ink-700">{r.conns}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-ink-700">{r.pipeline ? compactMoney(r.pipeline, currency) : "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-ink-700">{r.won ? compactMoney(r.won, currency) : "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-ink-700">{r.winrate === null ? "—" : `${r.winrate}%`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-[11px] text-ink-400">Opportunities are placed by the country of their linked connection.</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────── Biggest open deals ───────────── */

function daysBetween(a: Date, b: Date) {
  return Math.floor((a.getTime() - b.getTime()) / 86400000);
}
function shortDate(s: string) {
  return new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
const STAGE_CLS: Record<string, string> = {
  researching: "bg-slate-100 text-slate-700",
  contacted: "bg-amber-50 text-amber-700",
  evaluating: "bg-sky-50 text-sky-700",
  negotiating: "bg-violet-50 text-violet-700",
};

// A plain-language next step worked out from the deal's own dates.
function noteFor(o: OvOpp, today: Date): { text: string; tone: string } {
  if (o.next_follow_up_date && !o.next_follow_up_completed) {
    const d = new Date(o.next_follow_up_date);
    d.setHours(0, 0, 0, 0);
    const diff = daysBetween(d, today);
    if (diff < 0) return { text: `Follow-up overdue since ${shortDate(o.next_follow_up_date)}`, tone: "text-rose-600" };
    if (diff === 0) return { text: "Follow-up due today", tone: "text-amber-700" };
    return { text: `Next follow-up ${shortDate(o.next_follow_up_date)}`, tone: "text-sky-700" };
  }
  const age = o.created_at ? daysBetween(today, new Date(o.created_at)) : 0;
  if (age >= 7) return { text: `No follow-up set, added ${age} days ago`, tone: "text-amber-700" };
  return { text: "No follow-up set yet", tone: "text-ink-500" };
}

export function BiggestDeals({ opps, currency }: { opps: OvOpp[]; currency: string }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rows = opps.filter((o) => isOpen(o) && num(o.deal_value) > 0).sort((a, b) => num(b.deal_value) - num(a.deal_value)).slice(0, 6);

  return (
    <div className={card}>
      <div className={head}>
        <Icon d={ALERT} tone="amber" />
        <h3 className="text-sm font-semibold text-ink-900">Biggest open deals</h3>
        <Link href="/opportunities" className="ml-auto text-xs font-semibold text-emerald-700 hover:underline">All opportunities</Link>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-ink-400">Open opportunities with a deal value will show here.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-slate-50 text-left text-[11.5px] font-medium text-ink-400">
                <th className="px-4 py-2.5">Deal</th>
                <th className="px-4 py-2.5">Exhibition</th>
                <th className="px-4 py-2.5 text-right">Value</th>
                <th className="px-4 py-2.5">Stage</th>
                <th className="px-4 py-2.5">Next step</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => {
                const n = noteFor(o, today);
                return (
                  <tr key={o.id} className="border-b border-ink-50 last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <Link href={`/opportunities/${o.id}`} className="font-semibold text-ink-900 hover:text-emerald-700">{o.name || "Untitled deal"}</Link>
                      {o.supplier_name && <span className="block text-xs text-ink-400">{o.supplier_name}</span>}
                    </td>
                    <td className="px-4 py-3 text-ink-700">{o.exhibition || "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-800">{formatMoney(num(o.deal_value), currency)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STAGE_CLS[o.status ?? ""] ?? "bg-slate-100 text-slate-700"}`}>
                        {opportunityStatusLabel((o.status ?? "researching") as Opportunity["status"])}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-[12.5px] font-medium ${n.tone}`}>{n.text}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
