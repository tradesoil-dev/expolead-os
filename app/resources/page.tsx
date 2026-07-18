import Link from "next/link";
import { ARTICLES } from "@/lib/articles";

export const metadata = {
  title: "Resources — The exhibition lead playbook | ExpoLead OS",
  description:
    "Practical guides on capturing, qualifying, and following up on leads from trade shows and exhibitions. Written for product exporters and traders.",
  alternates: { canonical: "https://expolead.tradesoil.com/resources" },
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

const TOPIC_ORDER = ["Exhibitions", "Sales", "Marketing", "Follow-up"] as const;

export default function ResourcesPage() {
  const featured = ARTICLES.find((a) => a.featured) ?? ARTICLES[0];
  const rest = ARTICLES.filter((a) => a.slug !== featured.slug);

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
            <Link href="/resources" className="hidden text-sm font-medium text-white md:block">Resources</Link>
            <Link href="/pricing" className="hidden text-sm font-medium text-slate-400 hover:text-white md:block">Pricing</Link>
            <Link href="/login?mode=signup" className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500">Start free trial</Link>
          </div>
        </header>
      </div>

      {/* Hero */}
      <section className="px-6 py-16 text-center text-white lg:px-16" style={{ background: "linear-gradient(115deg, #0f172a 0%, #065f46 48%, #10b981 100%)" }}>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Resources</p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight md:text-5xl">The exhibition lead playbook</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85">Practical guides on capturing, qualifying, and following up on the leads you meet at trade shows. Written for product exporters and traders.</p>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14 lg:px-8">
        {/* Featured */}
        <Link href={`/resources/${featured.slug}`} className="group grid overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-emerald-300 md:grid-cols-2">
          <div className="flex h-48 items-center justify-center bg-emerald-100 text-emerald-700 md:h-auto">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8" /><rect x="3" y="5" width="18" height="14" rx="2" /></svg>
          </div>
          <div className="p-7">
            <span className="text-xs font-bold uppercase tracking-wide text-emerald-600">Featured · {featured.topic}</span>
            <h2 className="mt-2 text-2xl font-black leading-tight tracking-tight text-slate-900 group-hover:text-emerald-700">{featured.title}</h2>
            <p className="mt-3 text-[15px] leading-7 text-slate-600">{featured.excerpt}</p>
            <p className="mt-4 text-xs font-medium text-slate-400">{featured.readMinutes} min read</p>
          </div>
        </Link>

        {/* Grid */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((a) => (
            <Link key={a.slug} href={`/resources/${a.slug}`} className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-emerald-300">
              <span className="text-xs font-bold uppercase tracking-wide text-emerald-600">{a.topic}</span>
              <h3 className="mt-2 text-lg font-bold leading-snug tracking-tight text-slate-900 group-hover:text-emerald-700">{a.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{a.excerpt}</p>
              <p className="mt-auto pt-4 text-xs font-medium text-slate-400">{a.readMinutes} min read</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20 lg:px-16">
        <div className="mx-auto max-w-3xl rounded-3xl px-8 py-12 text-center text-white" style={{ background: "linear-gradient(115deg, #0f172a 0%, #065f46 48%, #10b981 100%)" }}>
          <h2 className="text-2xl font-black tracking-tight md:text-3xl">Stop losing leads after the show ends</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/85">ExpoLead OS captures every connection you make on the floor and reminds you exactly when to follow up.</p>
          <Link href="/login?mode=signup" className="mt-6 inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">Start free trial</Link>
        </div>
      </section>

      <footer className="bg-slate-900 px-6 py-8 text-center text-sm text-slate-400 lg:px-16">
        © 2026 Tradesoil International. Built for exhibitions. Designed for revenue growth.
      </footer>
    </main>
  );
}
