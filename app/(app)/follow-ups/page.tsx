import PageHeader from "@/components/PageHeader";

export const metadata = { title: "Follow-ups — ExpoLead OS" };

const SAMPLE = [
  { name: "UCO China", note: "Send spec sheet", due: "Due tomorrow", tone: "text-amber-600" },
  { name: "Residue FAME", note: "Confirm sample quantity", due: "Due in 2 days", tone: "text-emerald-600" },
  { name: "Palm Supplier", note: "Share updated quotation", due: "Due in 3 days", tone: "text-emerald-600" },
];

export default function FollowUpsPage() {
  return (
    <>
      <PageHeader title="Follow-ups" subtitle="Every lead you owe an action, in one place" />
      <main className="flex-1 space-y-5 p-6 md:p-8 max-w-4xl">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">Follow-ups</h2>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">Coming soon</span>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-slate-900 px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-white">One list for everything you need to chase</p>
            <p className="mt-0.5 text-xs text-slate-400">Soon this page will pull every overdue, due, and upcoming follow-up from your connections and opportunities into a single actionable list. For now, follow-ups live on each opportunity and on your dashboard.</p>
          </div>
        </div>

        <div className="relative select-none rounded-xl border border-slate-200 bg-white opacity-55 pointer-events-none">
          <span className="absolute right-2 top-2 z-10 rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">Sample</span>
          <ul className="divide-y divide-slate-100">
            {SAMPLE.map((s) => (
              <li key={s.name} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.note}</p>
                </div>
                <span className={`text-xs font-semibold ${s.tone}`}>{s.due}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
