import Link from "next/link";

export const metadata = {
  title: "About — ExpoLead OS",
  description: "Why ExpoLead OS exists, who it is for, and the people behind it.",
};

function BoxLogo() {
  return (
    <div className="grid grid-cols-2 gap-[3.5px] shrink-0">
      <div className="h-[10px] w-[10px] rounded-[2px] border-[1.8px] border-white" />
      <div className="h-[10px] w-[10px] rounded-[2px] border-[1.8px] border-white" />
      <div className="h-[10px] w-[10px] rounded-[2px] border-[1.8px] border-white" />
      <div className="h-[10px] w-[10px] rounded-[2px] bg-emerald-500" />
    </div>
  );
}

const VALUES = [
  ["Booth-first", "Fast enough to use one-handed at a busy stand. If it needs a manual, it does not belong here."],
  ["Products and quantity", "Built for physical trade, food, chemicals, apparel, machinery, where the deal is about volume, not a sales script."],
  ["Your data stays yours", "Private by default, exportable anytime, no lock-in. We never sell it."],
  ["Not a generic CRM", "Designed for the exhibition cycle, capture on the floor, follow up after, meet the same buyers again next year."],
];

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-950">
      <div className="sticky top-0 z-50">
        <header className="flex items-center justify-between bg-slate-900 px-4 py-3 shadow-sm shadow-black/20 lg:px-16 lg:py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <BoxLogo />
            <span className="text-[16px] leading-none tracking-tight">
              <span className="font-semibold text-white">Expo</span><span className="font-semibold text-emerald-400">Lead</span><span className="font-normal text-slate-400"> OS</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/features" className="hidden text-sm font-medium text-slate-400 hover:text-white md:block">Product</Link>
            <Link href="/pricing" className="hidden text-sm font-medium text-slate-400 hover:text-white md:block">Pricing</Link>
            <Link href="/login" className="hidden text-sm font-medium text-slate-400 hover:text-white md:block">Log in</Link>
            <Link href="/login?mode=signup" className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500">Start free trial</Link>
          </div>
        </header>
      </div>

      {/* Hero */}
      <section className="px-6 py-20 text-center text-white lg:px-16" style={{ background: "linear-gradient(115deg, #0f172a 0%, #065f46 48%, #10b981 100%)" }}>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">About ExpoLead OS</p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight md:text-5xl">Exhibitions are where deals begin. We make sure none of them are lost.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85">A company exhibits at a show, meets dozens of buyers and suppliers, then loses half of them in a notebook or an inbox. ExpoLead OS exists to close that gap.</p>
      </section>

      {/* Mission */}
      <section className="px-6 py-16 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Why we built it</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">Serious trade professionals deserve serious tools.</h2>
          <div className="mt-5 space-y-4 text-[15px] leading-8 text-slate-600">
            <p>Generic CRMs are built for software sales teams. They are heavy, need setup and training, and have no idea that exhibitions repeat every year and that you meet the same companies again. Momencio and the enterprise tools price out the very people who need this most: solo exhibitors, SME exporters, and the buyers who walk the halls.</p>
            <p>ExpoLead OS is the opposite. It is simple enough to use at the booth, priced for real businesses, and shaped entirely around the way product trade actually works, capture the connection, note what they deal in and in what quantity, follow up on time, and pick up the same relationship at next year&rsquo;s show.</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-slate-50 px-6 py-16 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">What we believe</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {VALUES.map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-base font-bold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="px-6 py-16 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">The people behind it</p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 bg-slate-900 text-xs font-semibold text-emerald-500">GG</div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Gladwin Gerald</p>
                  <p className="text-xs text-slate-500">Founder, ExpoLead OS</p>
                </div>
              </div>
              <p className="text-[13px] leading-[1.9] text-slate-600">Gladwin has worked in international trade and knows the exhibition floor first-hand. ExpoLead OS is the tool he wished he had: built for the way trade professionals actually work, on the floor, across borders, under time pressure.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 bg-slate-900 text-xs font-semibold text-emerald-500">GD</div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Gayan Dias</p>
                  <p className="text-xs text-slate-500">Co-Founder · Strategic Adviser</p>
                </div>
              </div>
              <p className="text-[13px] leading-[1.9] text-slate-600">Gayan is the strategic mind behind the business model. A business analyst and adviser by background, he keeps every product decision grounded in commercial reality, from how we price, to how we grow, to who we serve.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center lg:px-16">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">See it for yourself</h2>
        <p className="mx-auto mt-2 max-w-md text-slate-600">Start a free trial, or take a look at the product.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/login?mode=signup" className="rounded-full bg-emerald-600 px-7 py-3 text-sm font-semibold text-white hover:bg-emerald-500">Start free trial</Link>
          <Link href="/features" className="rounded-full border border-slate-300 px-7 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">See the product</Link>
        </div>
      </section>

      <footer className="bg-slate-900 px-6 py-8 text-center text-sm text-slate-400 lg:px-16">
        © 2026 ExpoLead OS. Built for exhibitions. Designed for revenue growth.
      </footer>
    </main>
  );
}
