import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import WelcomeCard from "@/components/WelcomeCard";
import { PriorityBadge } from "@/components/Badge";
import { getSuppliers, getOpportunities } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const suppliers = await getSuppliers();
  const opportunities = await getOpportunities();

  let firstName = "";
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      firstName = (profile?.full_name ?? "").trim().split(" ")[0] ?? "";
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

  const pipelineVolume = opportunities.reduce(
    (total, opportunity) => total + Number(opportunity.quantity || 0),
    0
  );

  const activeOpportunities = opportunities.filter(
    (opportunity) =>
      opportunity.status !== "won" && opportunity.status !== "lost"
  ).length;

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
          />
          <StatCard
            label="Connections Captured"
            value={met.length}
            hint="Captured at booths"
          />
          <StatCard
            label="Active Opportunities"
            value={activeOpportunities}
            hint="Open business opportunities"
            accent="emerald"
          />
          <StatCard
            label="Visited Booths"
            value={visitedBooths}
            hint="Booths already visited"
          />
        </section>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Due Today"
            value={dueTodayFollowUps.length}
            hint="Follow-ups requiring action"
          />
          <StatCard
            label="Overdue"
            value={overdueFollowUps.length}
            hint="Missed follow-up actions"
          />
          <StatCard
            label="Unvisited Booths"
            value={unvisitedBooths}
            hint="Booths still to visit"
          />
          <StatCard
            label="Pipeline Volume"
            value={`${pipelineVolume.toLocaleString()} MT`}
            hint="Total potential volume"
            accent="emerald"
          />
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

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel
            title="Recent opportunities"
            href="/opportunities"
            linkLabel="View all"
          >
            {recentOpportunities.length === 0 ? (
              <EmptyRow text="No opportunities created yet." />
            ) : (
              <ul className="divide-y divide-ink-100">
                {recentOpportunities.map((opportunity) => (
                  <li key={opportunity.id}>
                    <Link
                      href={`/opportunities/${opportunity.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-ink-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {opportunity.name}
                        </p>
                        <p className="truncate text-xs text-ink-500">
                          {opportunity.product || "No product added"}
                        </p>
                      </div>
                      <PriorityBadge priority={opportunity.priority} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Recently added connections" href="/suppliers" linkLabel="View all">
            {suppliers.length === 0 ? (
              <EmptyRow text="No connections yet — add your first one." />
            ) : (
              <ul className="divide-y divide-ink-100">
                {suppliers.slice(0, 5).map((supplier) => (
                  <li key={supplier.id}>
                    <Link
                      href={`/suppliers/${supplier.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-ink-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {supplier.company_name}
                        </p>
                        <p className="truncate text-xs text-ink-500">
                          {supplier.country ?? "—"}
                        </p>
                      </div>
                      <PriorityBadge priority={supplier.priority} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
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