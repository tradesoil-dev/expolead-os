import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import WelcomeCard from "@/components/WelcomeCard";
import { PriorityBadge, StatusBadge } from "@/components/Badge";
import { getSuppliers, getOpportunities } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_QUANTITY_UNIT, formatGroupedVolume } from "@/lib/quantity-units";
import { DEFAULT_CURRENCY, formatMoney, calcRoi } from "@/lib/currencies";
import { Calendar, Users, Target, CircleCheck, Clock, AlertTriangle, MapPin, BarChart3, Trophy, XCircle } from "lucide-react";

const ICON = { size: 17, strokeWidth: 2 } as const;

const PIPELINE_STAGES = [
  { key: "researching", label: "Qualified", box: "bg-slate-50 border-slate-200", num: "text-slate-700" },
  { key: "contacted", label: "Pricing", box: "bg-amber-50 border-amber-200", num: "text-amber-600" },
  { key: "evaluating", label: "Evaluation", box: "bg-sky-50 border-sky-200", num: "text-sky-600" },
  { key: "negotiating", label: "Negotiating", box: "bg-violet-50 border-violet-200", num: "text-violet-600" },
  { key: "won", label: "Won", box: "bg-emerald-50 border-emerald-200", num: "text-emerald-600" },
  { key: "lost", label: "Lost", box: "bg-rose-50 border-rose-200", num: "text-rose-600" },
];

export default async function DashboardPage() {
  // These three are independent, so run them together rather than in a line.
  // Each used to wait for the last to finish, which is most of why the
  // dashboard felt slow right after login.
  const [suppliers, opportunities, profileResult] = await Promise.all([
    getSuppliers(),
    getOpportunities(),
    (async () => {
      if (!isSupabaseConfigured) return null;
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, quantity_unit, currency")
        .eq("id", user.id)
        .single();
      return data;
    })(),
  ]);

  const firstName = (profileResult?.full_name ?? "").trim().split(" ")[0] ?? "";
  const quantityUnit = profileResult?.quantity_unit || DEFAULT_QUANTITY_UNIT;
  const currency = profileResult?.currency || DEFAULT_CURRENCY;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayString = today.toISOString().slice(0, 10);

  const met = suppliers.filter((s) => !s.is_target);
  const targets = suppliers.filter((s) => s.is_target);
  const highPriority = suppliers.filter((s) => s.priority === "high").length;
  const visitedBooths = suppliers.filter((s) => s.visited).length;

  const unvisitedBooths = suppliers.filter(
    (s) => s.exhibition_id && !s.visited
  ).length;

  const exhibitionsCount = new Set(
    suppliers.filter((s) => s.exhibition_id).map((s) => s.exhibition_id)
  ).size;

  // Open pipeline only: exclude won (already closed) and lost deals, so the
  // volume matches the Reports page and the "active opportunities" count.
  const activeOpps = opportunities.filter(
    (opportunity) =>
      opportunity.status !== "won" && opportunity.status !== "lost"
  );

  const pipelineVolume = formatGroupedVolume(activeOpps, quantityUnit);

  const activeOpportunities = activeOpps.length;

  // Total deal value, same split the Reports/ROI panel uses: open pipeline
  // (everything not yet won or lost) headlines the card, won sits beside it.
  const dealTotals = calcRoi(opportunities, 0);

  // Follow-ups shown on the dashboard mirror the Follow-ups tab exactly:
  // connections (with a follow-up date, not closed) AND opportunities (with a
  // next follow-up, not completed). Anything due lands you on the Follow-ups
  // tab at the specific item.
  type FollowUp = {
    key: string;
    label: string;
    date: string;
    note: string;
    href: string;
    kind: "Connection" | "Opportunity";
  };

  const followUps: FollowUp[] = [];
  for (const s of suppliers) {
    if (!s.follow_up_date || s.follow_up_status === "closed") continue;
    followUps.push({
      key: `s-${s.id}`,
      label: s.company_name,
      date: s.follow_up_date,
      note: s.follow_up_note?.trim() || s.country || "Connection follow-up",
      href: `/follow-ups#fu-s-${s.id}`,
      kind: "Connection",
    });
  }
  for (const o of opportunities) {
    if (!o.next_follow_up_date || o.next_follow_up_completed) continue;
    followUps.push({
      key: `o-${o.id}`,
      label: o.name,
      date: o.next_follow_up_date,
      note: o.next_follow_up_note || o.product || "Opportunity follow-up",
      href: `/follow-ups#fu-o-${o.id}`,
      kind: "Opportunity",
    });
  }

  const dayOf = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const byDate = (a: FollowUp, b: FollowUp) => (a.date < b.date ? -1 : 1);

  const overdueFollowUps = followUps
    .filter((f) => dayOf(f.date) < today.getTime())
    .sort(byDate);
  const dueTodayFollowUps = followUps
    .filter((f) => dayOf(f.date) === today.getTime())
    .sort(byDate);
  const upcomingFollowUps = followUps
    .filter((f) => dayOf(f.date) > today.getTime())
    .sort(byDate);

  const recentOpportunities = opportunities.slice(0, 5);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={firstName ? `Welcome back, ${firstName}. Here's your exhibition pipeline and follow-up command center.` : "Your exhibition pipeline and follow-up command center"}
      />

      <main className="flex-1 space-y-8 p-6 md:p-8">
        {!isSupabaseConfigured && <SetupNotice />}
        <WelcomeCard />

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Active Exhibitions"
            value={exhibitionsCount}
            hint="Shows with saved leads"
            accent="emerald"
            icon={<Calendar {...ICON} />}
          />
          <StatCard
            label="Connections Captured"
            value={met.length}
            hint="Captured at booths"
            icon={<Users {...ICON} />}
          />
          <StatCard
            label="Active Opportunities"
            value={activeOpportunities}
            hint="Open business opportunities"
            accent="emerald"
            icon={<Target {...ICON} />}
          />
          <StatCard
            label="Visited Booths"
            value={visitedBooths}
            hint="Booths already visited"
            icon={<CircleCheck {...ICON} />}
          />
        </section>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Due Today"
            value={dueTodayFollowUps.length}
            hint="Follow-ups requiring action"
            accent="amber"
            icon={<Clock {...ICON} />}
          />
          <StatCard
            label="Overdue"
            value={overdueFollowUps.length}
            hint="Missed follow-up actions"
            accent="rose"
            icon={<AlertTriangle {...ICON} />}
          />
          <StatCard
            label="Unvisited Booths"
            value={unvisitedBooths}
            hint="Booths still to visit"
            icon={<MapPin {...ICON} />}
          />
          <StatCard
            label="Pipeline Volume"
            value={pipelineVolume}
            hint="Total potential volume"
            accent="emerald"
            icon={<BarChart3 {...ICON} />}
          />
        </section>

        {/* Pipeline value — total deal value entered on opportunities */}
        <section className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-600 text-2xl font-semibold text-white">
                $
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">Pipeline value</p>
                <p className="text-3xl font-bold tabular-nums text-emerald-900">{formatMoney(dealTotals.open, currency)}</p>
                <p className="mt-0.5 text-xs text-emerald-700/80">
                  Total deal value across {activeOpportunities} open {activeOpportunities === 1 ? "opportunity" : "opportunities"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-white px-3.5 py-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Trophy size={15} strokeWidth={2} />
                </span>
                <div>
                  <p className="text-[11px] text-ink-500">Won</p>
                  <p className="text-base font-bold tabular-nums text-emerald-700">{formatMoney(dealTotals.won, currency)}</p>
                </div>
              </div>
              {dealTotals.lost > 0 && (
                <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-rose-100 text-rose-700">
                    <XCircle size={15} strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-[11px] text-ink-500">Lost</p>
                    <p className="text-base font-bold tabular-nums text-rose-600">{formatMoney(dealTotals.lost, currency)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <DonutCard
            title="Deal value by outcome"
            centerLabel={currency}
            centerValue={compactNumber(dealTotals.open + dealTotals.won + dealTotals.lost)}
            segments={[
              { label: "Open", value: dealTotals.open, color: "#3b82f6" },
              { label: "Won", value: dealTotals.won, color: "#10b981" },
              { label: "Lost", value: dealTotals.lost, color: "#ef4444" },
            ]}
            currency={currency}
          />

          <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card lg:col-span-2">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-ink-900">Pipeline at a glance</h2>
              <Link href="/opportunities" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                View pipeline →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {PIPELINE_STAGES.map((s) => (
                <div key={s.key} className={`rounded-xl border ${s.box} p-3 text-center`}>
                  <p className={`text-2xl font-bold tabular-nums ${s.num}`}>
                    {opportunities.filter((o) => o.status === s.key).length}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-ink-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Panel
            title="Overdue follow-ups"
            count={overdueFollowUps.length}
            href="/follow-ups"
            linkLabel="View follow-ups"
          >
            {overdueFollowUps.length === 0 ? (
              <EmptyRow text="No overdue follow-ups. You're up to date." />
            ) : (
              <FollowUpList items={overdueFollowUps} tone="red" />
            )}
          </Panel>

          <Panel
            title="Due today"
            count={dueTodayFollowUps.length}
            href="/follow-ups"
            linkLabel="View follow-ups"
          >
            {dueTodayFollowUps.length === 0 ? (
              <EmptyRow text="No follow-ups due today." />
            ) : (
              <FollowUpList items={dueTodayFollowUps} tone="amber" />
            )}
          </Panel>

          <Panel
            title="Upcoming follow-ups"
            count={upcomingFollowUps.length}
            href="/follow-ups"
            linkLabel="View follow-ups"
          >
            {upcomingFollowUps.length === 0 ? (
              <EmptyRow text="Nothing scheduled yet." />
            ) : (
              <FollowUpList items={upcomingFollowUps} tone="emerald" />
            )}
          </Panel>
        </section>

        {/* Newest connections — live feed table */}
        <section className="rounded-xl border border-ink-200 bg-white shadow-card">
          <div className="flex items-center justify-between gap-2 border-b border-ink-100 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><Users size={16} strokeWidth={2} /></span>
              <h2 className="text-[15px] font-semibold text-ink-900">Newest connections</h2>
            </div>
            <Link href="/connections" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">View all →</Link>
          </div>
          {suppliers.length === 0 ? (
            <EmptyRow text="No connections yet, add your first one." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="border-b border-ink-100 bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                    <th className="px-5 py-2.5">Company</th>
                    <th className="px-3 py-2.5">Country</th>
                    <th className="px-3 py-2.5">Exhibition</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-5 py-2.5 text-right">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.slice(0, 6).map((s) => {
                    const primary = s.contacts?.find((c) => c.is_primary) ?? s.contacts?.[0];
                    return (
                      <tr key={s.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50">
                        <td className="px-5 py-3">
                          <Link href={`/connections/${s.id}`} className="font-medium text-ink-900 hover:text-emerald-700">{s.company_name}</Link>
                          {primary?.full_name && <p className="text-xs text-ink-400">{primary.full_name}</p>}
                        </td>
                        <td className="px-3 py-3 text-ink-500">{s.country ?? "—"}</td>
                        <td className="px-3 py-3 text-ink-500">{s.exhibition?.name ?? "—"}</td>
                        <td className="px-3 py-3"><StatusBadge status={s.follow_up_status} /></td>
                        <td className="px-5 py-3 text-right text-ink-400">{s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Recent opportunities — live feed table */}
        <section className="rounded-xl border border-ink-200 bg-white shadow-card">
          <div className="flex items-center justify-between gap-2 border-b border-ink-100 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><Target size={16} strokeWidth={2} /></span>
              <h2 className="text-[15px] font-semibold text-ink-900">Recent opportunities</h2>
            </div>
            <Link href="/opportunities" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">View all →</Link>
          </div>
          {recentOpportunities.length === 0 ? (
            <EmptyRow text="No opportunities created yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-ink-100 bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                    <th className="px-5 py-2.5">Opportunity</th>
                    <th className="px-3 py-2.5">Product</th>
                    <th className="px-3 py-2.5">Exhibition</th>
                    <th className="px-3 py-2.5">Priority</th>
                    <th className="px-5 py-2.5 text-right">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOpportunities.map((o) => (
                    <tr key={o.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50">
                      <td className="px-5 py-3">
                        <Link href={`/opportunities/${o.id}`} className="font-medium text-ink-900 hover:text-emerald-700">{o.name}</Link>
                      </td>
                      <td className="px-3 py-3 text-ink-500">{o.product || "—"}</td>
                      <td className="px-3 py-3 text-ink-500">{o.exhibition || "—"}</td>
                      <td className="px-3 py-3"><PriorityBadge priority={o.priority} /></td>
                      <td className="px-5 py-3 text-right text-ink-400">{o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function FollowUpList({
  items,
  tone,
}: {
  items: { key: string; label: string; date: string; note: string; href: string; kind: "Connection" | "Opportunity" }[];
  tone: "red" | "amber" | "emerald";
}) {
  const toneClass =
    tone === "red"
      ? "bg-red-50 text-red-700"
      : tone === "amber"
      ? "bg-amber-50 text-amber-700"
      : "bg-emerald-50 text-emerald-700";

  return (
    <ul className="max-h-[228px] divide-y divide-ink-100 overflow-y-auto">
      {items.map((item) => (
        <li key={item.key}>
          <Link
            href={item.href}
            className="block px-4 py-3 transition-colors hover:bg-ink-50"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate text-sm font-medium">{item.label}</p>
                <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">{item.kind}</span>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${toneClass}`}>
                {new Date(item.date).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-1 truncate text-xs text-ink-500">{item.note}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Panel({
  title,
  count,
  href,
  linkLabel,
  children,
}: {
  title: string;
  count?: number;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
        <h2 className="text-sm font-semibold">
          {title}
          {count !== undefined && count > 0 && (
            <span className="ml-1.5 font-medium text-ink-400">({count})</span>
          )}
        </h2>
        <Link
          href={href}
          className="text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          {linkLabel}
        </Link>
      </div>
      {children}
    </div>
  );
}

// A compact number for the donut centre: 373500 -> "374k", 1_200_000 -> "1.2M".
function compactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return `${Math.round(value)}`;
}

// A pure-SVG donut (no client JS): normalised with pathLength="100" so each
// segment's dasharray is just its percentage. Rotated -90° to start at 12 o'clock.
function DonutCard({
  title,
  segments,
  centerLabel,
  centerValue,
  currency,
}: {
  title: string;
  segments: { label: string; value: number; color: string }[];
  centerLabel: string;
  centerValue: string;
  currency: string;
}) {
  const shown = segments.filter((s) => s.value > 0);
  const total = shown.reduce((sum, s) => sum + s.value, 0);
  let acc = 0;

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
      <h2 className="mb-4 text-sm font-semibold text-ink-900">{title}</h2>
      {total === 0 ? (
        <p className="py-8 text-center text-sm text-ink-400">No deal values recorded yet.</p>
      ) : (
        <div className="flex items-center gap-5">
          <svg viewBox="0 0 120 120" className="h-28 w-28 shrink-0">
            <g transform="rotate(-90 60 60)">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#eef2f0" strokeWidth="12" pathLength="100" />
              {shown.map((s) => {
                const len = (s.value / total) * 100;
                const off = -acc;
                acc += len;
                return (
                  <circle
                    key={s.label}
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke={s.color}
                    strokeWidth="12"
                    pathLength="100"
                    strokeDasharray={`${len} ${100 - len}`}
                    strokeDashoffset={off}
                  />
                );
              })}
            </g>
            <text x="60" y="56" textAnchor="middle" fontSize="11" fill="#6b7280">{centerLabel}</text>
            <text x="60" y="73" textAnchor="middle" fontSize="14" fontWeight="600" fill="#0f172a">{centerValue}</text>
          </svg>
          <ul className="min-w-0 flex-1 space-y-2 text-xs">
            {shown.map((s) => (
              <li key={s.label} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} />
                <span className="text-ink-700">{s.label}</span>
                <span className="ml-auto font-semibold tabular-nums text-ink-900">{formatMoney(s.value, currency)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <p className="px-4 py-8 text-center text-sm text-ink-400">{text}</p>;
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