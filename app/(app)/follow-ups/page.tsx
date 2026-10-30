import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import MarkFollowUpDone from "@/components/MarkFollowUpDone";
import FollowUpItem, { type FollowUpMeeting } from "@/components/FollowUpItem";
import AddFollowUpButton from "@/components/AddFollowUpButton";
import { getSuppliers, getOpportunities } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { HeadlineStrip, type Headline } from "@/components/ReportsOverview";

export const metadata = { title: "Follow-ups | ExpoLead OS" };

type Item = {
  key: string;
  rawId: string;
  label: string;
  note: string;
  noteRaw?: string;
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
      note: s.follow_up_note?.trim() || s.country || "Connection follow-up",
      noteRaw: s.follow_up_note ?? "",
      date: s.follow_up_date,
      href: `/connections/${s.id}`,
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

  // Interaction history (meetings) for the connections that have a follow-up due.
  const connIds = items.filter((i) => i.kind === "Connection").map((i) => i.rawId);
  const meetingsById = new Map<string, FollowUpMeeting[]>();
  if (isSupabaseConfigured && connIds.length) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("meetings")
      .select("id, supplier_id, met_on, notes, meeting_type")
      .in("supplier_id", connIds)
      .order("met_on", { ascending: false });
    for (const m of (data ?? []) as { id: string; supplier_id: string; met_on: string; notes: string | null; meeting_type: string | null }[]) {
      const arr = meetingsById.get(m.supplier_id) ?? [];
      arr.push({ id: m.id, met_on: m.met_on, notes: m.notes, meeting_type: m.meeting_type });
      meetingsById.set(m.supplier_id, arr);
    }
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

  // Headline numbers.
  const DAY = 86400000;
  const dayMs = (s: string) => startOfDay(new Date(s)).getTime();
  const overdueThisWeek = overdue.filter((i) => dayMs(i.date) >= today.getTime() - 7 * DAY).length;
  const oldestLate = overdue.length ? Math.round((today.getTime() - dayMs(overdue[0].date)) / DAY) : 0;
  const next7 = upcoming.filter((i) => dayMs(i.date) <= today.getTime() + 7 * DAY);
  const next7Conns = next7.filter((i) => i.kind === "Connection").length;
  const completed =
    suppliers.filter((s) => (s as any).follow_up_completed).length + opportunities.filter((o) => o.next_follow_up_completed).length;
  const donePct = completed + total ? Math.round((completed / (completed + total)) * 100) : null;
  const headlines: Headline[] = [
    {
      label: "Overdue",
      value: String(overdue.length),
      valueTone: overdue.length ? "bad" : undefined,
      delta: null,
      chip: overdue.length ? (overdueThisWeek ? { text: `${overdueThisWeek} this week`, tone: "bad" } : undefined) : { text: "All clear", tone: "good" },
      sub: overdue.length ? <>Oldest is <b className="font-semibold text-ink-700">{oldestLate} {oldestLate === 1 ? "day" : "days"}</b> late</> : "Nothing overdue",
    },
    { label: "Due today", value: String(dueToday.length), delta: null, chip: dueToday.length ? undefined : { text: "All clear", tone: "good" }, sub: dueToday.length ? "Waiting for you today" : "Nothing waiting for today" },
    {
      label: "Next 7 days",
      value: String(next7.length),
      delta: null,
      sub: <><b className="font-semibold text-ink-700">{next7Conns}</b> {next7Conns === 1 ? "connection" : "connections"} · <b className="font-semibold text-ink-700">{next7.length - next7Conns}</b> {next7.length - next7Conns === 1 ? "opportunity" : "opportunities"}</>,
    },
    { label: "Completed", value: String(completed), delta: null, chip: donePct !== null ? { text: `${donePct}% done`, tone: "good" } : undefined, sub: "Of all follow-ups you scheduled" },
  ];

  return (
    <>
      <PageHeader
        title="Follow-ups"
        subtitle="Every lead you owe an action, in one place"
        action={
          <AddFollowUpButton
            connections={suppliers.map((s) => ({
              id: s.id,
              company_name: s.company_name,
              follow_up_date: s.follow_up_date ?? null,
              follow_up_note: s.follow_up_note ?? null,
            }))}
          />
        }
      />
      <main className="flex-1 space-y-6 p-4 sm:p-6 md:p-8">
        <HeadlineStrip items={headlines} />

        {/* Guide note — coaches first-time users, mirrors the connection form guide */}
        <div className="w-full max-w-3xl rounded-xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-sm font-bold text-emerald-900 mb-3">New here? Working your follow-ups</p>
          <div className="space-y-2.5">
            <div className="flex gap-2.5 items-start">
              <span className="flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">1</span>
              <p className="text-xs leading-relaxed text-emerald-800">Anything with a next follow-up date lands here automatically, pulled from your connections and opportunities and sorted into Overdue, Due today and Upcoming.</p>
            </div>
            <div className="flex gap-2.5 items-start">
              <span className="flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">2</span>
              <p className="text-xs leading-relaxed text-emerald-800">Open a row to see the contact and your past interactions, and add a quick note to record what happened.</p>
            </div>
            <div className="flex gap-2.5 items-start">
              <span className="flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">3</span>
              <p className="text-xs leading-relaxed text-emerald-800">Once you have actioned a lead, mark it done to clear it. To add more, set a next follow-up date on any connection or opportunity.</p>
            </div>
          </div>
        </div>

        {total === 0 ? (
          <div className="rounded-xl border border-ink-200 bg-white px-4 py-16 text-center">
            <p className="text-sm font-semibold text-slate-900">You&rsquo;re all caught up</p>
            <p className="mt-1 text-sm text-slate-500">
              No follow-ups scheduled. Set a next follow-up date on any connection or opportunity and it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl">
            <Group title="Overdue" items={overdue} tone="red" empty="Nothing overdue. Nice." meetings={meetingsById} />
            <Group title="Due today" items={dueToday} tone="amber" empty="Nothing due today." meetings={meetingsById} />
            <Group title="Upcoming" items={upcoming} tone="emerald" empty="Nothing scheduled ahead yet." meetings={meetingsById} />
          </div>
        )}
      </main>
    </>
  );
}

function Group({ title, items, tone, empty, meetings }: { title: string; items: Item[]; tone: "red" | "amber" | "emerald"; empty: string; meetings: Map<string, FollowUpMeeting[]> }) {
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
          {items.map((it) =>
            it.kind === "Connection" ? (
              <FollowUpItem
                key={it.key}
                anchorId={`fu-${it.key}`}
                supplierId={it.rawId}
                label={it.label}
                href={it.href}
                date={it.date}
                noteInitial={it.noteRaw ?? ""}
                meetings={meetings.get(it.rawId) ?? []}
                pill={pill}
              />
            ) : (
              <li key={it.key} id={`fu-${it.key}`} className="scroll-mt-24 px-4 py-3 transition-colors hover:bg-ink-50">
                <div className="flex items-center gap-3">
                  <Link href={it.href} className="flex min-w-0 flex-1 items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-sm font-medium text-slate-900">{it.label}</p>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{it.kind}</span>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${pill}`}>
                      {new Date(it.date).toLocaleDateString()}
                    </span>
                  </Link>
                  <MarkFollowUpDone kind={it.kind} id={it.rawId} />
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-500">{it.note}</p>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
