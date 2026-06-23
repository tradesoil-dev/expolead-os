import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Pricing — ExpoLead OS",
  description: "Start free for 14 days, no credit card required. Starter at $19/month for solo traders. Professional at $49/month for teams. One missed lead at an exhibition pays for months.",
};

const STARTER_FEATURES = [
  { text: "1 user", included: true },
  { text: "Unlimited exhibitions", included: true },
  { text: "Unlimited connections", included: true },
  { text: "Unlimited opportunities", included: true },
  { text: "Follow-up tracking", included: true },
  { text: "CSV export", included: true },
  { text: "Email support", included: true },
];

const PRO_FEATURES = [
  { text: "Everything in Starter", included: true },
  { text: "Up to 5 users", included: true },
  { text: "Shared exhibition workspace", included: true },
  { text: "Team activity timeline", included: true, soon: true },
  { text: "AI Booth Visit Summaries", included: true, soon: true },
  { text: "Priority support", included: true },
];

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-emerald-50/60 to-sky-50 text-slate-950">
      {/* HEADER */}
      <header className="flex items-center justify-between bg-slate-800 px-8 py-4 lg:px-16">
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
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              ← Back to dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                Log in
              </Link>
              <Link href="/login?mode=signup" className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors">
                Start free trial
              </Link>
            </>
          )}
        </div>
      </header>

      {/* HERO */}
      <section className="px-8 py-16 text-center lg:px-16">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">
          Simple Pricing
        </p>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
          Start free. Upgrade when ready.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          14-day free trial, no credit card required. One missed lead at an exhibition pays for months of ExpoLead OS.
        </p>
      </section>

      {/* PRICING CARDS */}
      <section className="mx-auto max-w-4xl px-8 pb-20 lg:px-16">
        <div className="grid gap-8 md:grid-cols-2">

          {/* STARTER */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Starter</p>
            <div className="mt-3 flex items-end gap-1">
              <span className="text-5xl font-black text-slate-900">$19</span>
              <span className="mb-1.5 text-slate-500">/month</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              For solo buyers, sourcing managers, traders and consultants.
            </p>

            <Link
              href="/login?mode=signup"
              className="mt-6 block w-full rounded-xl bg-emerald-600 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
            >
              Start free trial
            </Link>

            <ul className="mt-8 space-y-3">
              {STARTER_FEATURES.map((f) => (
                <li key={f.text} className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckIcon className="h-4 w-4 shrink-0 text-emerald-500" />
                  {f.text}
                </li>
              ))}
            </ul>
          </div>

          {/* PROFESSIONAL */}
          <div className="relative rounded-2xl border-2 border-emerald-500 bg-white p-8 shadow-md">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-emerald-600 px-4 py-1 text-xs font-bold text-white">
                For Teams
              </span>
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Professional</p>
            <div className="mt-3 flex items-end gap-1">
              <span className="text-5xl font-black text-slate-900">$49</span>
              <span className="mb-1.5 text-slate-500">/month</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              For trading companies, sourcing teams and exporters attending multiple shows.
            </p>

            <Link
              href="/login?mode=signup"
              className="mt-6 block w-full rounded-xl bg-emerald-600 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
            >
              Start free trial
            </Link>

            <ul className="mt-8 space-y-3">
              {PRO_FEATURES.map((f) => (
                <li key={f.text} className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckIcon className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{f.text}</span>
                  {f.soon && (
                    <span className="ml-auto rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                      Soon
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* TRUST LINE */}
        <div className="mt-12 rounded-2xl bg-slate-800 border border-slate-700 px-8 py-6 text-center">
          <p className="text-sm font-semibold text-white">
            A return flight to any major trade show costs $800+. One recovered lead pays for ExpoLead OS for years.
          </p>
          <p className="mt-1 text-sm text-slate-400">
            No annual lock-in. Cancel anytime. Your data is always exportable.
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-14">
          <h2 className="text-xl font-bold text-slate-900 text-center mb-8">Common questions</h2>
          <div className="space-y-0 max-w-2xl mx-auto rounded-2xl border border-slate-200 overflow-hidden">
            {[
              {
                q: "What happens after my 14-day trial?",
                a: "You can still log in and view all your data. To add new connections, exhibitions or opportunities, upgrade to a paid plan.",
              },
              {
                q: "Do I need a credit card to start?",
                a: "No. Sign up and get full access for 14 days, no card required.",
              },
              {
                q: "Can I export my data?",
                a: "Yes. CSV export is available on all plans, including during and after trial.",
              },
              {
                q: "What is the Professional team feature?",
                a: "Multiple team members can log into the same workspace, see each other's connections, and collaborate on exhibitions in real time. Launching soon.",
              },
            ].map(({ q, a }, i, arr) => (
              <div key={q} className={`px-6 py-5 bg-white ${i < arr.length - 1 ? "border-b border-slate-100" : ""}`}>
                <p className="font-semibold text-slate-800">{q}</p>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/login?mode=signup"
            className="inline-block rounded-xl bg-emerald-600 px-8 py-4 text-base font-semibold text-white hover:bg-emerald-500 transition-colors"
          >
            Start your free 14-day trial →
          </Link>
          <p className="mt-3 text-sm text-slate-500">No credit card required.</p>
        </div>
      </section>
    </main>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
