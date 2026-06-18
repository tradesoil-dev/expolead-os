import Link from "next/link";
import PageHeader from "@/components/PageHeader";

const STEPS = [
  {
    number: 1,
    title: "Add your first exhibition",
    description: "Everything in ExpoLead OS starts with an exhibition. Add the show you're attending — name, location, and dates. All your connections and follow-ups will connect back to it.",
    cta: { label: "Go to Exhibitions →", href: "/exhibitions" },
    mockup: <ExhibitionMockup />,
    tip: "Tip: You can add multiple exhibitions — one for CHINACOAT, one for Canton Fair, and so on.",
  },
  {
    number: 2,
    title: "Capture a connection",
    description: "When you visit a booth or meet someone at the show, add them as a connection. Record their company, country, interest type, and the booth they're at. Do it while the conversation is fresh.",
    cta: { label: "Add a Connection →", href: "/suppliers/new" },
    mockup: <SupplierMockup />,
    tip: "Tip: Mark high-value contacts as High priority so they rise to the top of your follow-up list.",
  },
  {
    number: 3,
    title: "Set a follow-up date",
    description: "After capturing a connection, set a follow-up date. This is the most important step — it's what separates leads that convert from leads that go cold. ExpoLead OS will surface overdue follow-ups on your dashboard.",
    cta: { label: "View your Connections →", href: "/suppliers" },
    mockup: <FollowUpMockup />,
    tip: "Tip: Set follow-up dates before you leave the exhibition hall. Tomorrow is always too late.",
  },
  {
    number: 4,
    title: "Track your opportunities",
    description: "When a connection becomes a real business opportunity — a sample request, a quotation, a negotiation — add it as an opportunity. Track it through your pipeline from Qualified to Won.",
    cta: { label: "Go to Opportunities →", href: "/opportunities" },
    mockup: <OpportunityMockup />,
    tip: "Tip: Link your opportunity to the exhibition it came from so you know which shows deliver the best ROI.",
  },
  {
    number: 5,
    title: "Export your data",
    description: "When the show ends, export all your connections or opportunities to CSV. Share with your team, import into another system, or keep as a record of every show you've attended.",
    cta: { label: "Go to Connections →", href: "/suppliers" },
    mockup: <ExportMockup />,
    tip: "Tip: Export is available even after your trial ends — your data is always yours.",
  },
];

export default function GettingStartedPage() {
  return (
    <>
      <PageHeader
        title="Getting Started"
        subtitle="Everything you need to know to capture your first exhibition lead"
      />
      <main className="flex-1 p-6 md:p-8 max-w-4xl space-y-6">

        {/* Intro */}
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-6 py-5">
          <p className="text-sm font-semibold text-emerald-800">Welcome to ExpoLead OS</p>
          <p className="mt-1 text-sm text-emerald-700 leading-relaxed">
            ExpoLead OS is built for one thing — helping you turn exhibition conversations into revenue.
            Follow the 5 steps below and you'll be set up in under 10 minutes.
          </p>
        </div>

        {/* Steps */}
        {STEPS.map((step) => (
          <div key={step.number} className="rounded-2xl border border-ink-200 bg-white overflow-hidden shadow-sm">
            <div className="p-6 md:grid md:grid-cols-2 md:gap-8 md:items-start">
              {/* Left: content */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                    {step.number}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">{step.title}</h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                <div className="mt-3 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                  <p className="text-xs text-slate-500">{step.tip}</p>
                </div>
                <Link
                  href={step.cta.href}
                  className="mt-4 inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  {step.cta.label}
                </Link>
              </div>

              {/* Right: mockup */}
              <div className="mt-6 md:mt-0">
                {step.mockup}
              </div>
            </div>
          </div>
        ))}

        {/* Done */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-600 px-6 py-8 text-center text-white">
          <p className="text-2xl font-bold">You're all set.</p>
          <p className="mt-2 text-emerald-100 text-sm">
            Go capture your first lead. Every conversation is a potential opportunity.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-block rounded-xl bg-white px-6 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition-colors"
          >
            Go to Dashboard →
          </Link>
        </div>

      </main>
    </>
  );
}

/* ── Mockup Components ────────────────────────────── */

function MockupShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
      {children}
    </div>
  );
}

function ExhibitionMockup() {
  return (
    <MockupShell>
      <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px] mb-3">Exhibitions</p>
      {[
        { name: "CHINACOAT 2026", location: "Guangzhou, China", date: "Nov 18–20", suppliers: 12 },
        { name: "Canton Fair 2026", location: "Guangzhou, China", date: "Oct 23–27", suppliers: 8 },
      ].map((ex) => (
        <div key={ex.name} className="mb-2 rounded-lg border border-slate-200 bg-white p-3">
          <p className="font-semibold text-slate-800">{ex.name}</p>
          <p className="text-slate-500 mt-0.5">{ex.location} · {ex.date}</p>
          <div className="mt-2 flex gap-3">
            <span className="text-emerald-600 font-semibold">{ex.suppliers} connections</span>
          </div>
        </div>
      ))}
      <div className="mt-2 rounded-lg border border-dashed border-emerald-300 bg-emerald-50 p-2 text-center text-emerald-600 font-medium">
        + New exhibition
      </div>
    </MockupShell>
  );
}

function SupplierMockup() {
  return (
    <MockupShell>
      <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px] mb-3">Add Connection</p>
      <div className="space-y-2">
        {[
          { label: "Company name", value: "Guangzhou Resin Co. Ltd." },
          { label: "Country", value: "China" },
          { label: "Interest type", value: "Supplier / Buyer / Trader" },
          { label: "Priority", value: "High" },
          { label: "Booth", value: "Hall 3 · B204" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded border border-slate-200 bg-white px-2.5 py-1.5">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="text-slate-700 font-medium mt-0.5">{value}</p>
          </div>
        ))}
        <div className="rounded-lg bg-emerald-600 py-1.5 text-center text-white font-semibold">
          Save connection
        </div>
      </div>
    </MockupShell>
  );
}

function FollowUpMockup() {
  return (
    <MockupShell>
      <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px] mb-3">Follow-up Tracker</p>
      {[
        { company: "Guangzhou Resin Co.", date: "2026-11-25", status: "Contacted", color: "bg-blue-100 text-blue-700" },
        { company: "Sino Pigment Intl.", date: "2026-11-28", status: "New", color: "bg-slate-100 text-slate-600" },
        { company: "Delta Chemicals", date: "2026-12-01", status: "New", color: "bg-slate-100 text-slate-600" },
      ].map((f) => (
        <div key={f.company} className="mb-2 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
          <div>
            <p className="font-semibold text-slate-800">{f.company}</p>
            <p className="text-slate-400 mt-0.5">Follow up: {f.date}</p>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${f.color}`}>{f.status}</span>
        </div>
      ))}
    </MockupShell>
  );
}

function OpportunityMockup() {
  return (
    <MockupShell>
      <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px] mb-3">Pipeline</p>
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { stage: "Qualified", items: ["UCO Korea", "Palm Oil Deal"], color: "border-slate-200" },
          { stage: "Samples", items: ["FAME Supply"], color: "border-amber-200" },
          { stage: "Won", items: ["China UCO"], color: "border-emerald-200" },
        ].map((col) => (
          <div key={col.stage} className={`rounded-lg border ${col.color} bg-white p-2`}>
            <p className="font-bold text-[9px] uppercase tracking-wide text-slate-500 mb-1.5">{col.stage}</p>
            {col.items.map((item) => (
              <div key={item} className="mb-1 rounded border border-slate-100 bg-slate-50 px-1.5 py-1 text-[10px] font-medium text-slate-700">
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
    </MockupShell>
  );
}

function ExportMockup() {
  return (
    <MockupShell>
      <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px] mb-3">Export CSV</p>
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 px-2 py-1">
          {["Company", "Country", "Status"].map((h) => (
            <p key={h} className="font-bold text-[9px] uppercase tracking-wide text-slate-400">{h}</p>
          ))}
        </div>
        {[
          ["Guangzhou Resin", "China", "Contacted"],
          ["Sino Pigment", "China", "New"],
          ["Delta Chemicals", "China", "New"],
        ].map(([co, cn, st]) => (
          <div key={co} className="grid grid-cols-3 border-b border-slate-100 px-2 py-1.5">
            <p className="text-slate-700 font-medium truncate">{co}</p>
            <p className="text-slate-500">{cn}</p>
            <p className="text-slate-500">{st}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 py-1.5 text-center text-emerald-700 font-semibold">
        ↓ Export CSV
      </div>
    </MockupShell>
  );
}
