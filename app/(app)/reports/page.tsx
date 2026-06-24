import PageHeader from "@/components/PageHeader";

export const metadata = { title: "Reports — ExpoLead OS" };

const METRICS = [
  { label: "Connections captured", value: "63", color: "text-slate-900" },
  { label: "Follow-up rate", value: "87%", color: "text-emerald-600" },
  { label: "Open opportunities", value: "11", color: "text-slate-900" },
  { label: "Pipeline volume", value: "2,400 MT", color: "text-slate-900" },
];

const STAGES = [
  { label: "Qualified", h: "h-20", bg: "bg-indigo-500" },
  { label: "Samples", h: "h-14", bg: "bg-amber-500" },
  { label: "Quotation", h: "h-12", bg: "bg-emerald-500" },
  { label: "Won", h: "h-6", bg: "bg-slate-900" },
];

export default function ReportsPage() {
  return (
    <>
      <PageHeader title="Reports" subtitle="How your exhibitions are performing" />
      <main className="flex-1 p-6 md:p-8 space-y-5 max-w-5xl">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">Reports</h2>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">Coming soon</span>
        </div>

        {/* Coming soon banner */}
        <div className="flex items-center gap-3 rounded-xl bg-slate-900 px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 14l3-3 3 3 4-5"/></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-white">Reports are on the way</p>
            <p className="text-xs text-slate-400 mt-0.5">A preview of what you&rsquo;ll see. Real numbers appear here once you capture leads and follow-ups at a show.</p>
          </div>
        </div>

        {/* Dimmed sample preview */}
        <div className="relative select-none opacity-55 pointer-events-none">
          <span className="absolute right-2 top-2 z-10 rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">Sample data</span>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {METRICS.map((m) => (
              <div key={m.label} className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">{m.label}</p>
                <p className={`mt-1 text-2xl font-extrabold ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-bold text-slate-900">Follow-up status</p>
            <div className="space-y-2.5">
              <div>
                <div className="mb-1 flex justify-between text-[11px]"><span className="text-slate-600">Followed up</span><span className="font-bold text-emerald-600">55</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[87%] bg-emerald-500" /></div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-[11px]"><span className="text-slate-600">Still pending</span><span className="font-bold text-amber-600">8</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[13%] bg-amber-500" /></div>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-bold text-slate-900">Opportunities by stage</p>
            <div className="flex h-24 items-end gap-2">
              {STAGES.map((s) => (
                <div key={s.label} className="flex-1 text-center">
                  <div className={`${s.h} ${s.bg} rounded-t-md`} />
                  <p className="mt-1 text-[9px] text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
