import Link from "next/link";
import type { Metadata } from "next";
import PricingPlans from "@/components/PricingPlans";
import PublicHeader from "@/components/PublicHeader";

export const metadata: Metadata = {
  title: "Pricing — ExpoLead OS",
  description: "Free 14-day trial, no credit card. Paid plans from $29/month ($348/year Starter). One recovered exhibition lead pays for ExpoLead OS for years. No contracts, no sales calls.",
};

const TRUST = [
  { title: "Isolated & private", desc: "No other user sees your records" },
  { title: "Encrypted", desc: "HTTPS/TLS in transit" },
  { title: "Exportable anytime", desc: "CSV export on Starter & Growth" },
  { title: "No lock-in", desc: "Cancel anytime" },
];

const SHOWS = ["ANUGA", "SIAL CHINA", "CHINACOAT", "GULFOOD"];

const FAQ = [
  { q: "Is this just another CRM?", a: "No. A CRM is built for a sales team working a pipeline all year from a desk. ExpoLead OS is built for three days on a show floor, on your feet, meeting fifty people. It captures connections, products and quantities the way exhibition work actually happens, and there is nothing to configure before you can use it." },
  { q: "What is the difference between Trial and Starter?", a: "Trial is free and lets you capture one show (1 exhibition, up to 25 connections, up to 25 opportunities) to see the value. Starter unlocks unlimited exhibitions, connections and opportunities, plus reports and CSV export." },
  { q: "Do I need a credit card to start?", a: "No. Every account starts on a free 14-day trial with no card, so you can capture a real show before paying anything." },
  { q: "What happens after the 14 days?", a: "Nothing disappears. You keep full access to every connection, opportunity and follow-up you captured, and you can still view and edit them. To add new records after day 14, move to Starter or Growth." },
  { q: "Can I switch between monthly and annual?", a: "Yes, anytime from your billing settings." },
  { q: "Can I export my data?", a: "CSV export is a paid feature, available on Starter and Growth. It is not included in the trial. Your data is always yours and there is no lock-in, so you can export it in full the moment you upgrade." },
  { q: "When do the Growth team features launch?", a: "Soon. Start on Trial or Starter now, and team features (up to 5 users, shared workspace, team reporting) are on the way." },
  { q: "Which industries is it built for?", a: "Companies that exhibit and sell products: food and beverage, tea, spices, chemicals and coatings, apparel and textiles, machinery, packaging, building materials, gems and jewellery. If you negotiate in quantities, it fits. If you sell services, it will feel half empty." },
  { q: "Does it work on my phone at the show?", a: "Yes, it runs in your phone browser, which is where most capture happens. You do need a connection in the hall, so it is worth checking the wifi at your stand on day one." },
];

const GRADIENT = "linear-gradient(115deg, #0f172a 0%, #065f46 48%, #10b981 100%)";
const GRADIENT_STRIP = "linear-gradient(100deg, #0f172a 0%, #065f46 60%, #10b981 100%)";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* STICKY HEADER */}
      <PublicHeader />

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
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: FAQ.map(({ q, a }) => ({
                    "@type": "Question",
                    name: q,
                    acceptedAnswer: { "@type": "Answer", text: a },
                  })),
                }),
              }}
            />
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
            <Link href="/login?mode=signup" className="inline-block rounded-full bg-emerald-600 px-8 py-4 text-base font-semibold text-white hover:bg-emerald-500 transition-colors">
              Get started free →
            </Link>
            <p className="mt-3 text-sm text-slate-500">Free for 14 days. No credit card required.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
