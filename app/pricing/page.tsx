import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import PricingPlans from "@/components/PricingPlans";

export const metadata: Metadata = {
  title: "Pricing — ExpoLead OS",
  description: "Start free for 14 days, no credit card. Solo from $15/month billed annually ($190/year), or $19 monthly. One recovered exhibition lead pays for ExpoLead OS for years. No contracts, no sales calls.",
};

const TRUST = [
  { title: "Isolated & private", desc: "No other user sees your records" },
  { title: "Encrypted", desc: "HTTPS/TLS in transit" },
  { title: "Exportable anytime", desc: "CSV export on every plan" },
  { title: "No lock-in", desc: "Cancel anytime" },
];

const SHOWS = ["ANUGA", "SIAL CHINA", "CHINACOAT", "GULFOOD"];

const FAQ = [
  { q: "What happens after my 14-day trial?", a: "You keep viewing all your data. To add new records, upgrade to a paid plan." },
  { q: "Do I need a credit card to start?", a: "No — full access for 14 days, no card required." },
  { q: "Can I switch between monthly and annual?", a: "Yes, anytime from your billing settings." },
  { q: "Can I export my data?", a: "Yes — CSV export on all plans, during and after trial. Your data is always yours." },
  { q: "When will the Team plan launch?", a: "Soon — join the waitlist and we'll notify you the moment it's live." },
];

const GRADIENT = "linear-gradient(115deg, #0f172a 0%, #065f46 48%, #10b981 100%)";
const GRADIENT_STRIP = "linear-gradient(100deg, #0f172a 0%, #065f46 60%, #10b981 100%)";

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-slate-900 px-6 py-4 shadow-sm shadow-black/20 lg:px-16">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="grid grid-cols-2 gap-[3.5px] shrink-0">
            <div className="w-[10px] h-[10px] rounded-[2px] border-[1.8px] border-white" />
            <div className="w-[10px] h-[10px] rounded-[2px] border-[1.8px] border-white" />
            <div className="w-[10px] h-[10px] rounded-[2px] border-[1.8px] border-white" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-500" />
          </div>
          <span className="flex items-center text-[16px] tracking-tight leading-none">
            <span className="font-semibold text-white">Expo</span>
            <span className="font-semibold text-emerald-400">Lead</span>
            <span className="font-normal text-slate-400"> OS</span>
          </span>
        </Link>
        {user ? (
          <Link href="/dashboard" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors">
            ← Back to dashboard
          </Link>
        ) : (
          <Link href="/login?mode=signup" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors">
            Start free trial
          </Link>
        )}
      </header>

      {/* GRADIENT HERO */}
      <div style={{ background: GRADIENT }} className="pb-16 pt-12">
        <div className="px-6 text-center lg:px-16">
          <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-white md:text-5xl">
            Pricing built for the<br />exhibition floor
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/85">
            Find the plan that fits how you work the show — and everything after it.
          </p>
        </div>
      </div>

      {/* WHITE SECTION */}
      <div className="relative -mt-8 rounded-t-[28px] bg-slate-50 px-6 pb-20 pt-8 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-7 text-center text-sm font-semibold text-emerald-600">
            → Larger team or many shows a year?{" "}
            <a href="mailto:hello.expolead@tradesoil.com?subject=ExpoLead%20OS%20custom%20plan" className="underline hover:text-emerald-700">Contact us</a>{" "}
            for a tailored plan.
          </p>

          <PricingPlans />

          {/* Trust / security strip */}
          <div className="mt-12">
            <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Your data, your control</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TRUST.map((t) => (
                <div key={t.title} className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <p className="text-sm font-bold text-slate-900">{t.title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Exhibition association */}
          <div className="mt-12 text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Built for the world&rsquo;s leading trade exhibitions</p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {SHOWS.map((s) => (
                <span key={s} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">{s}</span>
              ))}
            </div>
          </div>

          {/* Trust line — gradient */}
          <div style={{ background: GRADIENT_STRIP }} className="mt-12 rounded-2xl px-8 py-6 text-center">
            <p className="text-base font-black text-white">One recovered lead pays for ExpoLead OS for years.</p>
            <p className="mt-1.5 text-xs text-white/80">No $6k contracts. No sales calls. Just start.</p>
          </div>

          {/* FAQ */}
          <div className="mt-12">
            <h2 className="mb-5 text-center text-xl font-bold text-slate-900">Common questions</h2>
            <div className="space-y-2">
              {FAQ.map(({ q, a }) => (
                <div key={q} className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                  <p className="text-sm font-bold text-slate-900">{q}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-12 text-center">
            <Link href="/login?mode=signup" className="inline-block rounded-xl bg-emerald-600 px-8 py-4 text-base font-semibold text-white hover:bg-emerald-500 transition-colors">
              Start your free 14-day trial →
            </Link>
            <p className="mt-3 text-sm text-slate-500">No credit card required.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
