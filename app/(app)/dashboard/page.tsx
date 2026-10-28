import Link from "next/link";
import WelcomeCard from "@/components/WelcomeCard";
import Greeting from "@/components/dashboard/Greeting";
import PipelineGrowthChart, { type GrowthPoint } from "@/components/dashboard/PipelineGrowthChart";
import WorldMap from "@/components/WorldMap";
import DeltaChip, { pctChange } from "@/components/DeltaChip";
import { HeadlineStrip, type Headline } from "@/components/ReportsOverview";
import { getSuppliers, getOpportunities, getExhibitions } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_CURRENCY, formatMoney } from "@/lib/currencies";
import { DEFAULT_QUANTITY_UNIT, formatGroupedVolume } from "@/lib/quantity-units";
import { canonicalCountry } from "@/lib/geo/country";
import { ADD_BUTTON } from "@/lib/ui";
import { opportunityStatusLabel } from "@/lib/types";
import { Bell, Calendar, Globe, LineChart, Sparkles, Clock, AlertTriangle, Trophy, UserPlus, Target, ArrowUpRight } from "lucide-react";

const DAY = 86400000;
const card = "rounded-2xl border border-ink-200 bg-white overflow-hidden";
const head = "flex items-center gap-2.5 border-b border-ink-100 px-4 py-3";
const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);

function CardIcon({ children, tone = "emerald" }: { children: React.ReactNode; tone?: "emerald" | "amber" | "dark" | "slate" }) {
  const cls =
    tone === "amber" ? "bg-amber-50 text-amber-600" : tone === "dark" ? "bg-slate-900 text-emerald-400" : tone === "slate" ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-600";
  return <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${cls}`}>{children}</span>;
}

function ago(iso: string, now: number) {
  const m = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

export default async function DashboardPage() {
  const [suppliers, opportunities, exhibitions, extra] = await Promise.all([
    getSuppliers(),
    getOpportunities(),
    getExhibitions(),
    (async () => {
      if (!isSupabaseConfigured) return { profile: null, wins: [] as { opportunity_id: string; created_at: string }[] };
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { profile: null, wins: [] };
      const since = new Date(Date.now() - 60 * DAY).toISOString();
      const [{ data: profile }, { data: wins }] = await Promise.all([
        supabase.from("profiles").select("full_name, currency, quantity_unit").eq("id", user.id).single(),
        // When deals were marked won, for "Won in the last 30 days" (best effort).
        supabase.from("opportunity_status_history").select("opportunity_id, created_at").eq("status", "won").gte("created_at", since),
      ]);
      return { profile, wins: (wins ?? []) as { opportunity_id: string; created_at: string }[] };
    })(),
  ]);

  const firstName = (extra.profile?.full_name ?? "").trim().split(" ")[0] ?? "";
  const currency = extra.profile?.currency || DEFAULT_CURRENCY;
  const quantityUnit = extra.profile?.quantity_unit || DEFAULT_QUANTITY_UNIT;
  const now = Date.now();
  const start30 = now - 30 * DAY;
  const start60 = now - 60 * DAY;
  const t = (s: string | null | undefined) => (s ? new Date(s).getTime() : 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  /* ── Headline numbers (last 30 days vs the 30 before) ── */
  const conns30 = suppliers.filter((s) => t(s.created_at) >= start30).length;
  const connsPrev = suppliers.filter((s) => t(s.created_at) >= start60 && t(s.created_at) < start30).length;

  const openOpps = opportunities.filter((o) => o.status !== "won" && o.status !== "lost");
  const openValue = openOpps.reduce((s, o) => s + num(o.deal_value), 0);
  const notLost = opportunities.filter((o) => o.status !== "lost");
  const added30 = notLost.filter((o) => t(o.created_at) >= start30);
  const addedPrev = notLost.filter((o) => t(o.created_at) >= start60 && t(o.created_at) < start30);
  const addedValue30 = added30.reduce((s, o) => s + num(o.deal_value), 0);
  const addedValuePrev = addedPrev.reduce((s, o) => s + num(o.deal_value), 0);

  const oppById = new Map(opportunities.map((o) => [o.id, o]));
  const wonIn = (from: number, to: number) => {
    const ids = new Set(extra.wins.filter((w) => t(w.created_at) >= from && t(w.created_at) < to).map((w) => w.opportunity_id));
    const list = Array.from(ids).map((id) => oppById.get(id)).filter((o) => o && o.status === "won");
    return { n: list.length, value: list.reduce((s, o) => s + num(o!.deal_value), 0) };
  };
  const won30 = wonIn(start30, now + 1);
  const closed = opportunities.filter((o) => o.status === "won" || o.status === "lost");
  const winRate = closed.length ? Math.round((closed.filter((o) => o.status === "won").length / closed.length) * 100) : null;

  /* ── Follow-ups (same sources as the Follow-ups tab) ── */
  type Fu = { label: string; date: number; href: string };
  const fus: Fu[] = [];
  let done = 0;
  for (const s of suppliers) {
    if ((s as any).follow_up_completed) { done++; continue; }
    if (s.follow_up_date && s.follow_up_status !== "closed") fus.push({ label: s.company_name, date: t(s.follow_up_date), href: `/follow-ups#fu-s-${s.id}` });
  }
  for (const o of opportunities) {
    if (o.next_follow_up_completed) { done++; continue; }
    if (o.next_follow_up_date) fus.push({ label: o.name, date: t(o.next_follow_up_date), href: `/follow-ups#fu-o-${o.id}` });
  }
  const dayOf = (ms: number) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const overdue = fus.filter((f) => dayOf(f.date) < todayMs);
  const dueToday = fus.filter((f) => dayOf(f.date) === todayMs);
  const thisWeek = fus.filter((f) => dayOf(f.date) > todayMs && dayOf(f.date) <= todayMs + 7 * DAY);
  const later = fus.filter((f) => dayOf(f.date) > todayMs + 7 * DAY);
  const nextDue = [...dueToday, ...thisWeek].sort((a, b) => a.date - b.date)[0];

  /* ── Deal value card: total, open, won, lost (all time) ── */
  const wonOpps = opportunities.filter((o) => o.status === "won");
  const lostOpps = opportunities.filter((o) => o.status === "lost");
  const wonValue = wonOpps.reduce((s, o) => s + num(o.deal_value), 0);
  const lostValue = lostOpps.reduce((s, o) => s + num(o.deal_value), 0);
  const totalValue = openValue + wonValue;
  const barTotal = openValue + wonValue + lostValue;
  const share = (v: number) => (barTotal ? Math.round((v / barTotal) * 100) : 0);
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  const dealHeadlines: Headline[] = [
    { label: "Total deal value", value: formatMoney(totalValue, currency), delta: null, sub: "Open and won, lost left out" },
    { label: "Open pipeline", value: formatMoney(openValue, currency), delta: null, chip: { text: `${openOpps.length} open`, tone: "neutral" }, sub: `+${formatMoney(addedValue30, currency)} added in 30 days` },
    { label: "Won", value: formatMoney(wonValue, currency), valueTone: wonValue ? "good" : undefined, delta: null, chip: { text: plural(wonOpps.length, "deal", "deals"), tone: "good" }, sub: winRate !== null ? `Win rate ${winRate}% · ${formatMoney(won30.value, currency)} in 30 days` : "No closed deals yet" },
    { label: "Lost", value: formatMoney(lostValue, currency), valueTone: lostValue ? "bad" : undefined, delta: null, chip: lostOpps.length ? { text: plural(lostOpps.length, "deal", "deals"), tone: "bad" } : undefined, sub: lostOpps.length ? "Worth a look back" : "Nothing lost" },
  ];

  /* ── Activity row ── */
  const activeExhibitions = new Set(suppliers.map((s) => s.exhibition_id).filter(Boolean)).size;
  const visited = suppliers.filter((s) => s.visited).length;
  const notVisited = suppliers.filter((s) => s.exhibition_id && !s.visited).length;
  const volume = formatGroupedVolume(openOpps.flatMap((o) => o.products ?? []), quantityUnit);
  const activity: Headline[] = [
    { label: "Connections", value: String(suppliers.length), delta: null, chip: { text: `${conns30} in 30 days`, tone: conns30 >= connsPrev ? "good" : "bad" }, sub: `${connsPrev} the 30 days before` },
    { label: "Active exhibitions", value: String(activeExhibitions), delta: null, sub: "Shows with connections" },
    { label: "Active opportunities", value: String(openOpps.length), delta: null, sub: "Not yet won or lost" },
    { label: "Follow-ups due", value: String(overdue.length + dueToday.length), delta: null, chip: overdue.length ? { text: `${overdue.length} overdue`, tone: "bad" } : { text: "None overdue", tone: "good" }, sub: `${dueToday.length} due today` },
    { label: "Booths visited", value: String(visited), delta: null, chip: notVisited ? { text: `${notVisited} not yet`, tone: "warn" } : undefined, sub: "Connections marked visited" },
    { label: "Pipeline volume", value: volume, delta: null, sub: "Open deals" },
  ];

  /* ── Pipeline growth: running total of deal value, last 30 days vs previous ── */
  const valueUpTo = (ms: number) => notLost.reduce((s, o) => (t(o.created_at) <= ms ? s + num(o.deal_value) : s), 0);
  const points: GrowthPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const end = now - i * DAY;
    points.push({
      label: new Date(end).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      current: valueUpTo(end),
      previous: valueUpTo(end - 30 * DAY),
    });
  }
  const hasDealValues = notLost.some((o) => num(o.deal_value) > 0);

  /* ── Map: connections by country ── */
  const byCountry = new Map<string, { n: number; first: number }>();
  for (const s of suppliers) {
    const c = canonicalCountry(s.country);
    if (!c) continue;
    const cur = byCountry.get(c) ?? { n: 0, first: Infinity };
    cur.n++;
    cur.first = Math.min(cur.first, t(s.created_at) || Infinity);
    byCountry.set(c, cur);
  }
  const countryRows = Array.from(byCountry.entries()).sort((a, b) => b[1].n - a[1].n);
  const newCountries = countryRows.filter(([, v]) => v.first >= start30).length;
  const placedTotal = countryRows.reduce((s, [, v]) => s + v.n, 0);
  const top6 = countryRows.slice(0, 6);
  const top6Share = placedTotal ? Math.round((top6.reduce((s, [, v]) => s + v.n, 0) / placedTotal) * 100) : 0;

  /* ── Exhibition ROI: show cost per connection ── */
  const connsByExh = new Map<string, number>();
  for (const s of suppliers) if (s.exhibition_id) connsByExh.set(s.exhibition_id, (connsByExh.get(s.exhibition_id) ?? 0) + 1);
  const roi = exhibitions
    .map((e) => ({ name: e.name, cost: num(e.cost), conns: connsByExh.get(e.id) ?? 0 }))
    .filter((e) => e.cost > 0 && e.conns > 0)
    .map((e) => ({ ...e, cpc: e.cost / e.conns }))
    .sort((a, b) => a.cpc - b.cpc);
  const roiAvg = roi.length ? roi.reduce((s, e) => s + e.cost, 0) / roi.reduce((s, e) => s + e.conns, 0) : null;
  const roiMax = Math.max(1, ...roi.map((e) => e.cpc));

  /* ── Insights: facts worked out from the user's own data ── */
  const coldList = suppliers.filter(
    (s) => !(s as any).follow_up_completed && s.follow_up_status === "new" && t(s.created_at) <= now - 7 * DAY && !(s.follow_up_date && t(s.follow_up_date) >= todayMs),
  );
  const coldByExh = new Map<string, typeof coldList>();
  for (const s of coldList) {
    const k = s.exhibition?.name ?? "No exhibition";
    coldByExh.set(k, [...(coldByExh.get(k) ?? []), s]);
  }
  const coldTop = Array.from(coldByExh.entries()).sort((a, b) => b[1].length - a[1].length)[0];
  const coldIds = new Set(coldTop?.[1].map((s) => s.id) ?? []);
  const coldPipeline = openOpps.filter((o) => o.supplier_id && coldIds.has(o.supplier_id)).reduce((s, o) => s + num(o.deal_value), 0);
  const coldExh = coldTop ? exhibitions.find((e) => e.name === coldTop[0]) : undefined;
  const coldSince = coldExh?.end_date ? Math.max(0, Math.floor((now - t(coldExh.end_date)) / DAY)) : null;
  const bestShow = roi.length >= 2 ? roi[0] : null;
  const watch = openOpps
    .filter((o) => num(o.deal_value) > 0 && ((o.next_follow_up_date && !o.next_follow_up_completed && t(o.next_follow_up_date) < todayMs) || (!o.next_follow_up_date && t(o.created_at) <= now - 7 * DAY)))
    .sort((a, b) => num(b.deal_value) - num(a.deal_value))[0];
  const insightCount = (coldTop ? 1 : 0) + (bestShow ? 1 : 0) + (watch ? 1 : 0);

  /* ── Recent activity ── */
  type Act = { at: string; title: string; meta: string; badge: string; cls: string; href: string; icon: "conn" | "opp" | "won" };
  const acts: Act[] = [
    ...suppliers.slice(0, 8).map((s): Act => ({
      at: s.created_at, title: `Connection added · ${s.company_name}`, meta: [s.contacts?.[0]?.full_name, s.exhibition?.name].filter(Boolean).join(" · ") || s.country || "Connection",
      badge: "New", cls: "bg-emerald-50 text-emerald-700", href: `/connections/${s.id}`, icon: "conn",
    })),
    ...opportunities.slice(0, 8).map((o): Act => ({
      at: o.created_at, title: `Opportunity · ${o.name}`, meta: [num(o.deal_value) ? formatMoney(num(o.deal_value), currency) : null, o.supplier?.company_name].filter(Boolean).join(" · ") || "Opportunity",
      badge: opportunityStatusLabel(o.status), cls: o.status === "won" ? "bg-emerald-50 text-emerald-700" : o.status === "lost" ? "bg-rose-50 text-rose-600" : "bg-violet-50 text-violet-700", href: `/opportunities/${o.id}`, icon: "opp",
    })),
    ...extra.wins.map((w): Act | null => {
      const o = oppById.get(w.opportunity_id);
      return o ? { at: w.created_at, title: `Deal won · ${o.name}`, meta: num(o.deal_value) ? formatMoney(num(o.deal_value), currency) : "Won", badge: "Won", cls: "bg-emerald-50 text-emerald-700", href: `/opportunities/${o.id}`, icon: "won" } : null;
    }).filter((a): a is Act => !!a),
  ]
    .filter((a) => a.at)
    .sort((a, b) => t(b.at) - t(a.at))
    .slice(0, 6);

  const fuBlocks = [
    { label: "Overdue", n: overdue.length, color: "#e11d48" },
    { label: "Due today", n: dueToday.length, color: "#f59e0b" },
    { label: "This week", n: thisWeek.length, color: "#38bdf8" },
    { label: "Later", n: later.length, color: "#94a3b8" },
    { label: "Done", n: done, color: "#10b981" },
  ];
  const isNew = suppliers.length === 0 && opportunities.length === 0;

  return (
    <main className="flex-1 space-y-6 p-6 md:p-8">
      {!isSupabaseConfigured && <SetupNotice />}

      <div className="flex flex-wrap items-start gap-3">
        <div className="mr-auto">
          <Greeting
            firstName={firstName}
            note={
              overdue.length > 0 ? (
                <><Link href="/follow-ups" className="font-semibold text-amber-600 hover:underline">{overdue.length} {overdue.length === 1 ? "follow-up" : "follow-ups"} overdue</Link> need your attention</>
              ) : (
                "You are up to date on follow-ups"
              )
            }
          />
        </div>
        <Link href="/connections/new" className={ADD_BUTTON}>
          <span className="text-base leading-none">+</span> Add connection
        </Link>
      </div>

      {isNew && <WelcomeCard />}

      <section className="rounded-2xl border border-ink-200 bg-white px-5 py-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400">Deal value</p>
        <HeadlineStrip items={dealHeadlines} />
        {barTotal > 0 && (
          <>
            <div className="mt-4 flex h-2.5 gap-[3px] overflow-hidden rounded-full bg-slate-100" aria-hidden>
              {openValue > 0 && <div style={{ flexGrow: openValue, flexBasis: 0, background: "#0f172a" }} />}
              {wonValue > 0 && <div style={{ flexGrow: wonValue, flexBasis: 0, background: "#10b981" }} />}
              {lostValue > 0 && <div style={{ flexGrow: lostValue, flexBasis: 0, background: "#fb7185" }} />}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-ink-500">
              <span><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-slate-900" />Open {share(openValue)}%</span>
              <span><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500" />Won {share(wonValue)}%</span>
              <span><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-rose-400" />Lost {share(lostValue)}%</span>
            </div>
          </>
        )}
      </section>

      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400">Activity</p>
        <HeadlineStrip items={activity} cols={6} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className={card}>
          <div className={head}>
            <CardIcon><LineChart size={16} /></CardIcon>
            <h2 className="text-sm font-semibold text-ink-900">Pipeline growth</h2>
            <Link href="/reports" className="ml-auto text-xs font-semibold text-emerald-700 hover:underline">Reports</Link>
          </div>
          <div className="px-4 py-4">
            {hasDealValues ? (
              <>
                <div className="flex flex-wrap items-baseline gap-2.5">
                  <span className="text-[26px] font-semibold tracking-tight tabular-nums text-ink-900">{formatMoney(points[points.length - 1]?.current ?? 0, currency)}</span>
                  <DeltaChip value={pctChange(addedValue30, addedValuePrev)} />
                  <span className="text-[12.5px] text-ink-500">total deal value, open and won · +{formatMoney(addedValue30, currency)} added in 30 days</span>
                </div>
                <div className="mt-3"><PipelineGrowthChart points={points} currency={currency} /></div>
              </>
            ) : (
              <p className="py-14 text-center text-sm text-ink-400">Add a deal value to your opportunities and your pipeline growth will show here.</p>
            )}
          </div>
        </div>

        <div className={card}>
          <div className={head}>
            <CardIcon tone="amber"><Bell size={16} /></CardIcon>
            <h2 className="text-sm font-semibold text-ink-900">Follow-up status</h2>
            <Link href="/follow-ups" className="ml-auto text-xs font-semibold text-emerald-700 hover:underline">View all</Link>
          </div>
          <div className="px-4 py-4">
            <div className="flex items-center gap-2 rounded-full border border-ink-200 bg-slate-50 px-3.5 py-2 text-[13px] text-ink-700">
              Overdue follow-ups: <b className="text-base text-ink-900">{overdue.length}</b>
              {dueToday.length > 0 && <span className="ml-auto rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">{dueToday.length} due today</span>}
            </div>
            <div className="my-4 flex h-20 gap-1.5">
              {fuBlocks.map((b) => (
                <div
                  key={b.label}
                  title={`${b.label}: ${b.n}`}
                  className="rounded-lg"
                  style={{
                    flexGrow: Math.max(b.n, 0.6),
                    flexBasis: 0,
                    backgroundColor: b.color,
                    opacity: b.n ? 1 : 0.25,
                    backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,.2) 0 2px, transparent 2px 7px)",
                  }}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12.5px] text-ink-500">
              {fuBlocks.map((b) => (
                <div key={b.label} className="flex items-center justify-between">
                  <span><span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: b.color }} />{b.label}</span>
                  <b className="text-base font-semibold tabular-nums text-ink-900">{b.n}</b>
                </div>
              ))}
            </div>
            {nextDue && (
              <Link href={nextDue.href} className="mt-4 block border-t border-ink-100 pt-3 text-[12.5px] text-ink-500 hover:text-ink-800">
                Next up: <b className="text-ink-900">{nextDue.label}</b> · {new Date(nextDue.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className={card}>
        <div className={head}>
          <CardIcon><Globe size={16} /></CardIcon>
          <h2 className="text-sm font-semibold text-ink-900">Where your connections are</h2>
          <Link href="/reports" className="ml-auto rounded-full border border-ink-200 px-3 py-1 text-xs font-medium text-ink-600 hover:bg-slate-50">See more in Reports ›</Link>
        </div>
        {countryRows.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-ink-400">Add a country to your connections and they will appear on the map.</p>
        ) : (
          <div className="grid items-center gap-6 p-4 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
            <WorldMap points={countryRows.map(([c, v]) => ({ country: c, value: v.n, label: `${v.n} ${v.n === 1 ? "connection" : "connections"}` }))} ariaLabel="Map of your connections by country" />
            <div>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-[26px] font-semibold tracking-tight text-ink-900">{countryRows.length}</span>
                <span className="text-[12.5px] text-ink-500">{countryRows.length === 1 ? "country" : "countries"}</span>
                {newCountries > 0 && <DeltaChip value={newCountries} unit="" suffix="new" />}
              </div>
              <p className="mb-3 mt-0.5 text-[11.5px] text-ink-400">New means a first connection in the last 30 days</p>
              {top6.map(([c, v]) => (
                <div key={c} className="grid grid-cols-[minmax(0,1fr)_70px_28px] items-center gap-3 py-1.5 text-sm">
                  <span className="truncate text-ink-800">{c}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${(v.n / top6[0][1].n) * 100}%` }} /></div>
                  <span className="text-right tabular-nums text-ink-700">{v.n}</span>
                </div>
              ))}
              {countryRows.length > 6 && <p className="mt-2 text-[11.5px] text-ink-400">{top6Share}% of connections come from these 6 countries</p>}
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className={card}>
          <div className={head}>
            <CardIcon><Calendar size={16} /></CardIcon>
            <h2 className="text-sm font-semibold text-ink-900">Exhibition ROI</h2>
            <Link href="/exhibitions" className="ml-auto grid h-7 w-7 place-items-center rounded-full border border-ink-200 text-ink-500 hover:bg-slate-50" aria-label="Exhibitions"><ArrowUpRight size={14} /></Link>
          </div>
          <div className="px-4 py-4">
            {roi.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-400">Add what each show cost on <Link href="/exhibitions" className="font-medium text-emerald-700 hover:underline">Exhibitions</Link> to see cost per connection.</p>
            ) : (
              <>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-[26px] font-semibold tracking-tight tabular-nums text-ink-900">{formatMoney(roiAvg, currency)}</span>
                  <span className="text-[12.5px] text-ink-500">per connection, all shows</span>
                </div>
                <div className="mt-3">
                  {roi.slice(0, 5).map((e) => (
                    <div key={e.name} className="grid grid-cols-[minmax(0,120px)_1fr_auto] items-center gap-3 py-1.5 text-sm">
                      <span className="truncate text-ink-800" title={e.name}>{e.name}</span>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full" style={{ width: `${(e.cpc / roiMax) * 100}%`, background: roiAvg !== null && e.cpc <= roiAvg ? "#10b981" : "#f59e0b" }} />
                      </div>
                      <span className="text-right tabular-nums text-ink-700">{formatMoney(e.cpc, currency)}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11.5px] text-ink-400">Show cost divided by connections captured. Lower is better.</p>
              </>
            )}
          </div>
        </div>

        <div className={card}>
          <div className={head}>
            <CardIcon tone="dark"><Sparkles size={15} /></CardIcon>
            <h2 className="text-sm font-semibold text-ink-900">Insights</h2>
            {insightCount > 0 && <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">{insightCount} new</span>}
          </div>
          <div className="space-y-2.5 px-4 py-4">
            {insightCount === 0 && <p className="py-8 text-center text-sm text-ink-400">Nothing needs your attention right now.</p>}
            {coldTop && (
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-600"><AlertTriangle size={13} /> Going cold · {coldTop[0]}</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-800">
                  {coldTop[1].length} {coldTop[1].length === 1 ? "connection has" : "connections have"} had no follow-up for 7 days or more. Interest fades fast after a show.
                </p>
                <div className="my-3 grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-ink-200 px-3 py-2"><b className="block text-base text-ink-900">{coldTop[1].length}</b><span className="text-[11.5px] text-ink-500">Connections</span></div>
                  <div className="rounded-xl border border-ink-200 px-3 py-2"><b className="block truncate text-base text-ink-900">{coldPipeline ? formatMoney(coldPipeline, currency) : "—"}</b><span className="text-[11.5px] text-ink-500">Open pipeline</span></div>
                  <div className="rounded-xl border border-ink-200 px-3 py-2"><b className="block text-base text-ink-900">{coldSince !== null ? `${coldSince} days` : "—"}</b><span className="text-[11.5px] text-ink-500">Since the show</span></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/connections" className="inline-flex h-9 items-center rounded-full border border-ink-200 px-3.5 text-[12.5px] font-semibold text-ink-700 hover:bg-slate-50">View connections</Link>
                  <Link href="/follow-ups" className="inline-flex h-9 items-center rounded-full border border-emerald-200 bg-emerald-50 px-3.5 text-[12.5px] font-semibold text-emerald-700 hover:bg-emerald-100">Plan follow-ups</Link>
                </div>
              </div>
            )}
            {bestShow && (
              <div className="flex items-center gap-3 rounded-xl border border-ink-200 px-3 py-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><Trophy size={15} /></span>
                <div className="min-w-0"><p className="text-[11.5px] font-semibold text-emerald-700">Best show · Cost per connection</p><p className="text-[13px] text-ink-800">{bestShow.name} cost {formatMoney(bestShow.cpc, currency)} per connection, your best so far</p></div>
              </div>
            )}
            {watch && (
              <Link href={`/opportunities/${watch.id}`} className="flex items-center gap-3 rounded-xl border border-ink-200 px-3 py-2.5 hover:bg-slate-50">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-600"><Target size={15} /></span>
                <div className="min-w-0"><p className="truncate text-[11.5px] font-semibold text-sky-700">Deal to watch · {watch.supplier?.company_name ?? watch.name}</p><p className="text-[13px] text-ink-800">{formatMoney(num(watch.deal_value), currency)} {watch.next_follow_up_date ? "with an overdue follow-up" : "with no follow-up set"}</p></div>
              </Link>
            )}
          </div>
        </div>

        <div className={card}>
          <div className={head}>
            <CardIcon tone="slate"><Clock size={15} /></CardIcon>
            <h2 className="text-sm font-semibold text-ink-900">Recent activity</h2>
          </div>
          <div className="px-4 py-1">
            {acts.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink-400">Your latest connections and deals will show here.</p>
            ) : (
              acts.map((a, i) => (
                <Link key={`${a.href}-${i}`} href={a.href} className="flex items-start gap-3 border-b border-ink-100 py-3 last:border-0">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-ink-200 text-ink-500">
                    {a.icon === "conn" ? <UserPlus size={14} /> : a.icon === "won" ? <Trophy size={14} /> : <Target size={14} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-ink-900">{a.title}</p>
                    <p className="truncate text-[11.5px] text-ink-400">{a.meta} · {ago(a.at, now)}</p>
                  </div>
                  <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${a.cls}`}>{a.badge}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function SetupNotice() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <span className="font-medium">Supabase not connected.</span> Add your keys
      to <code className="rounded bg-amber-100 px-1 py-0.5">.env.local</code> and
      run <code className="rounded bg-amber-100 px-1 py-0.5">supabase/schema.sql</code>{" "}
      to start saving real data.
    </div>
  );
}
