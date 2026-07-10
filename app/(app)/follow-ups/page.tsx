import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import MarkFollowUpDone from "@/components/MarkFollowUpDone";
import { getSuppliers, getOpportunities } from "@/lib/data";

export const metadata = { title: "Follow-ups — ExpoLead OS" };

type Item = {
  key: string;
  rawId: string;
  label: string;
  note: string;
  date: string;
  href: string;
  kind: "Connection" | "Opportunity";
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default async function FollowUpsPage() {
  const [suppliers, opportunities] = await Promise.all([getSuppliers(), getOpportunities()]);

  const today = startOfDay(new Date());

  const items: Item[] = [];

  for (const s of suppliers) {
    if (!s.follow_up_date || s.follow_up_status === "closed") continue;
    items.push({
      key: `s-${s.id}`,
      rawId: s.id,
      label: s.company_name,
      note: s.country ?? "Connection follow-up",
      date: s.follow_up_date,
      href: `/suppliers/${s.id}`,
      kind: "Connection",
    });
  }

  for (const o of opportunities) {
    if (!o.next_follow_up_date || o.next_follow_up_completed) continue;
    items.push({
      key: `o-${o.id}`,
      rawId: o.id,
      label: o.name,
      note: o.next_follow_up_note || o.product || "Opportunity follow-up",
      date: o.next_follow_up_date,
      href: `/opportunities/${o.id}`,
      kind: "Opportunity",
    });
  }

  const overdue: Item[] = [];
  const dueToday: Item[] = [];
  const upcoming: Item[] = [];

  for (const it of items) {
    const d = startOfDay(new Date(it.date));
    if (d.getTime() < today.getTime()) overdue.push(it);
    else if (d.getTime() === today.getTime()) dueToday.push(it);
    else upcoming.push(it);
  }

  const byDate = (a: Item, b: Item) => (a.date < b.date ? -1 : 1);
  overdue.sort(byDate);
  dueToday.sort(byDate);
  upcoming.sort(byDate);

  const total = items.length;

  return (
    <>
      <PageHeader title="Follow-ups" subtitle="Every lead you owe an action, in one place" />
      <main className="flex-1 space-y-6 p-6 md:p-8">
        <section className="grid grid-cols-3 gap-4 max-w-2xl">
          <Stat label="Overdue" value={overdue.length} tone="red" />
          <Stat label="Due today" value={dueToday.length} tone="amber" />
          <Stat label="Upcoming" value={upcoming.length} tone="emerald" />
        </section>

        {total === 0 ? (
          <div className="rounded-xl border border-ink-200 bg-white px-4 py-16 text-center">
            <p className="text-sm font-semibold text-slate-900">You&rsquo;re all caught up</p>
            <p className="mt-1 text-sm text-slate-500">
              No follow-ups scheduled. Set a next follow-up date on any connection or opportunity and it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl">
            <Group title="Overdue" items={overdue} tone="red" empty="Nothing overdue. Nice." />
            <Group title="Due today" items={dueToday} tone="amber" empty="Nothing due today." />
            <Group title="Upcoming" items={upcoming} tone="emerald" empty="Nothing scheduled ahead yet." />
          </div>
        )}
      </main>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "red" | "amber" | "emerald" }) {
  const color = tone === "red" ? "text-rose-600" : tone === "amber" ? "text-amber-600" : "text-emerald-600";
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}

function Group({ title, items, tone, empty }: { title: string; items: Item[]; tone: "red" | "amber" | "emerald"; empty: string }) {
  const dot = tone === "red" ? "bg-rose-500" : tone === "amber" ? "bg-amber-500" : "bg-emerald-500";
  const pill = tone === "red" ? "bg-rose-50 text-rose-700" : tone === "amber" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700";
  return (
    <div className="rounded-xl border border-ink-200 bg-white shadow-card">
      <div className="flex items-center gap-2 border-b border-ink-100 px-4 py-3">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <span className="text-xs text-slate-400">({items.length})</span>
      </div>
      {items.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-ink-400">{empty}</p>
      ) : (
        <ul className="divide-y divide-ink-100">
          {items.map((it) => (
            <li key={it.key} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-ink-50">
              <Link href={it.href} className="flex min-w-0 flex-1 items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-slate-900">{it.label}</p>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{it.kind}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{it.note}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${pill}`}>
                  {new Date(it.date).toLocaleDateString()}
                </span>
              </Link>
              <MarkFollowUpDone kind={it.kind} id={it.rawId} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
