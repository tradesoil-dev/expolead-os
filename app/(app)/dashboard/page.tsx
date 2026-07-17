import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import WelcomeCard from "@/components/WelcomeCard";
import { PriorityBadge, StatusBadge } from "@/components/Badge";
import { getSuppliers, getOpportunities } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_QUANTITY_UNIT, formatGroupedVolume } from "@/lib/quantity-units";
import { Calendar, Users, Target, CircleCheck, Clock, AlertTriangle, MapPin, BarChart3 } from "lucide-react";

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
  const suppliers = await getSuppliers();
  const opportunities = await getOpportunities();

  let firstName = "";
  let quantityUnit = DEFAULT_QUANTITY_UNIT;
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("full_name, quantity_unit").eq("id", user.id).single();
      firstName = (profile?.full_name ?? "").trim().split(" ")[0] ?? "";
      quantityUnit = profile?.quantity_unit || DEFAULT_QUANTITY_UNIT;
    }
  }

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

  const opportunityFollowUps = opportunities.filter(
    (opportunity) =>
      opportunity.next_follow_up_date &&
      !opportunity.next_follow_up_completed
  );

  const overdueFollowUps = opportunityFollowUps.filter((opportunity) => {
    const date = new Date(opportunity.next_follow_up_date!);
    date.setHours(0, 0, 0, 0);
    return date.getTime() < today.getTime();
  });

  const dueTodayFollowUps = opportunityFollowUps.filter((opportunity) => {
    const date = new Date(opportunity.next_follow_up_date!);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  });

  const upcomingFollowUps = opportunityFollowUps
    .filter((opportunity) => {
      const date = new Date(opportunity.next_follow_up_date!);
      date.setHours(0, 0, 0, 0);
      return date.getTime() > today.getTime();
    })
    .sort((a, b) =>
      a.next_follow_up_date! < b.next_follow_up_date! ? -1 : 1
    )
    .slice(0, 5);

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

        <section className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-ink-900">Pipeline at a glance</h2>
            <Link href="/opportunities" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
              View pipeline →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
            {PIPELINE_STAGES.map((s) => (
              <div key={s.key} className={`rounded-xl border ${s.box} p-3 text-center`}>
                <p className={`text-2xl font-bold tabular-nums ${s.num}`}>
                  {opportunities.filter((o) => o.status === s.key).length}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-ink-500">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Panel
            title="Overdue follow-ups"
            href="/opportunities"
            linkLabel="View pipeline"
          >
            {overdueFollowUps.length === 0 ? (
              <EmptyRow text="No overdue follow-ups. You're up to date." />
            ) : (
              <OpportunityList
                opportunities={overdueFollowUps.slice(0, 5)}
                tone="red"
              />
            )}
          </Panel>

          <Panel
            title="Due today"
            href="/opportunities"
            linkLabel="View pipeline"
          >
            {dueTodayFollowUps.length === 0 ? (
              <EmptyRow text="No follow-ups due today." />
            ) : (
              <OpportunityList
                opportunities={dueTodayFollowUps.slice(0, 5)}
                tone="amber"
              />
            )}
          </Panel>

          <Panel
            title="Upcoming follow-ups"
            href="/opportunities"
            linkLabel="View pipeline"
          >
            {upcomingFollowUps.length === 0 ? (
              <EmptyRow text="Nothing scheduled yet." />
            ) : (
              <OpportunityList opportunities={upcomingFollowUps} tone="emerald" />
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
            <Link href="/suppliers" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">View all →</Link>
          </div>
          {suppliers.length === 0 ? (
            <EmptyRow text="No connections yet — add your first one." />
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
                          <Link href={`/suppliers/${s.id}`} className="font-medium text-ink-900 hover:text-emerald-700">{s.company_name}</Link>
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

function OpportunityList({
  opportunities,
  tone,
}: {
  opportunities: Awaited<ReturnType<typeof getOpportunities>>;
  tone: "red" | "amber" | "emerald";
}) {
  const toneClass =
    tone === "red"
      ? "bg-red-50 text-red-700"
      : tone === "amber"
      ? "bg-amber-50 text-amber-700"
      : "bg-emerald-50 text-emerald-700";

  return (
    <ul className="divide-y divide-ink-100">
      {opportunities.map((opportunity) => (
        <li key={opportunity.id}>
          <Link
            href={`/opportunities/${opportunity.id}`}
            className="block px-4 py-3 transition-colors hover:bg-ink-50"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-medium">{opportunity.name}</p>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${toneClass}`}>
                {new Date(opportunity.next_follow_up_date!).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-1 truncate text-xs text-ink-500">
              {opportunity.next_follow_up_note || "No reminder note"}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Panel({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
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