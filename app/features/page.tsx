"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";

const AVATARS = [
  { src: "/avatars/avatar-1.png", pos: { left: "50%", top: "8.75%" } },
  { src: "/avatars/avatar-2.png", pos: { left: "85.7%", top: "29.4%" } },
  { src: "/avatars/avatar-3.png", pos: { left: "85.7%", top: "70.6%" } },
  { src: "/avatars/avatar-4.png", pos: { left: "50%", top: "91.25%" } },
  { src: "/avatars/avatar-5.png", pos: { left: "14.3%", top: "70.6%" } },
  { src: "/avatars/avatar-6.png", pos: { left: "14.3%", top: "29.4%" } },
];

const TABS = [
  {
    key: "capture",
    label: "lead capture",
    title: "lead capture",
    desc: "Capturing the lead is the first step, and the one most people get wrong. ExpoLead OS makes on-the-floor capture fast enough to do while you are still talking.",
    points: [
      ["Connection, contact, and product in one form", "record the company, the person, and what they deal in, all in a single quick entry at the booth."],
      ["Booth and exhibition context", "tag each lead with the show, hall, and booth so you remember exactly where and when you met."],
      ["Notes while it is fresh", "jot samples promised, pricing hints, and next steps before the conversation blurs into the next forty."],
    ],
  },
  {
    key: "pipeline",
    label: "qualify and pipeline",
    title: "qualify and pipeline",
    desc: "Not all leads are equal. Score and sort them while the exhibition is still live, so your best opportunities never sit idle.",
    points: [
      ["Priority and interest type", "mark each connection as high, medium, or low, and whether they are a buyer, supplier, or partner."],
      ["Move through stages", "push conversations from qualified to pricing to negotiation to won across a clear pipeline board."],
      ["Quantity, not guesswork", "track the volumes discussed so your pipeline reflects real potential, not vague interest."],
    ],
  },
  {
    key: "followup",
    label: "follow-up",
    title: "follow-up",
    desc: "The transition from show floor to closed deal is where most leads die. ExpoLead OS keeps every one moving so nothing slips through the cracks.",
    points: [
      ["Due-date reminders", "set a next follow-up date on any lead and see what is due today, this week, or overdue."],
      ["At-risk flags", "leads that go quiet surface automatically, so your team reaches out before the opportunity cools."],
      ["Mark it done", "log each follow-up as completed and schedule the next, keeping a full activity trail per connection."],
    ],
  },
  {
    key: "data",
    label: "own your data",
    title: "own your data",
    desc: "Your leads are your business. ExpoLead OS keeps them private, portable, and yours, with no lock-in and no data sold on.",
    points: [
      ["Strictly private", "row-level security at the database means no other user can ever see your records."],
      ["Export on any paid plan", "take everything with you as CSV, connections and opportunities included. Export is a paid feature, not part of the free trial."],
      ["No lock-in", "we never sell or share your business data with third parties. Leave whenever you like."],
    ],
  },
];

const FEATURES = [
  ["fast lead capture", "Log every connection, contact, and product the moment you meet them. No paper, no shoebox of business cards, no chaos back at the hotel."],
  ["products and quantity", "Capture what they trade and the quantities discussed, the real negotiation lever in product trade, not just a name and a title."],
  ["priority and follow-up health", "Flag hot leads by priority and see follow-up health at a glance, so your team knows exactly who to chase first after the show."],
];

function BoxLogo({ size = "sm" }: { size?: "sm" | "lg" }) {
  const box = size === "lg" ? "w-[11px] h-[11px] border-[3px] rounded-[3px]" : "w-[10px] h-[10px] border-[1.8px] rounded-[2px]";
  const border = size === "lg" ? "border-slate-800" : "border-white";
  const gap = size === "lg" ? "gap-[5px]" : "gap-[3.5px]";
  return (
    <div className={`grid grid-cols-2 ${gap} shrink-0`}>
      <div className={`${box} ${border}`} />
      <div className={`${box} ${border}`} />
      <div className={`${box} ${border}`} />
      <div className={`${box.replace("border-[3px]", "").replace("border-[1.8px]", "")} bg-emerald-500`} />
    </div>
  );
}

export default function FeaturesPage() {
  const [tab, setTab] = useState(0);
  const active = TABS[tab];

  // Scale the laptop mockup to fit its column so it stays a real laptop
  // (same proportions as desktop) even on a narrow phone, content in order.
  const lapWrapRef = useRef<HTMLDivElement>(null);
  const lapInnerRef = useRef<HTMLDivElement>(null);
  const [lap, setLap] = useState({ scale: 1, h: 0 });
  useEffect(() => {
    const wrap = lapWrapRef.current;
    const inner = lapInnerRef.current;
    if (!wrap || !inner) return;
    const DESIGN = 540;
    const compute = () => {
      const s = Math.min(1, wrap.clientWidth / DESIGN);
      setLap({ scale: s, h: inner.offsetHeight * s });
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-950">
      <style>{`
        @keyframes spinOrbit { to { transform: rotate(360deg); } }
        @keyframes counterOrbit { to { transform: rotate(-360deg); } }
        .spin-orbit { animation: spinOrbit 26s linear infinite; }
        .counter-orbit { animation: counterOrbit 26s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .spin-orbit, .counter-orbit { animation: none; } }
      `}</style>

      {/* HEADER */}
      <PublicHeader />

      {/* HERO */}
      <section className="relative overflow-hidden px-6 py-16 lg:px-16 lg:py-20">
        <div className="pointer-events-none absolute right-[-120px] top-10 h-[560px] w-[780px] rounded-full opacity-70 blur-2xl" style={{ background: "radial-gradient(closest-side, rgba(16,185,129,0.20), rgba(59,130,246,0.08), transparent)" }} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-600">The exhibition workspace</p>
            <h1 className="mt-3 text-4xl font-black leading-[1.02] tracking-tight text-slate-900 md:text-5xl lg:text-[3.4rem]">capture every booth lead and follow it to a closed deal</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600">From the first handshake at your booth to the signed order months later, ExpoLead OS keeps every conversation, product, and follow-up in one place.</p>
            <div className="mt-7 flex gap-3">
              <Link href="/login?mode=signup" className="rounded-full bg-emerald-600 px-7 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors">Start free trial</Link>
              <Link href="/pricing" className="rounded-full border border-slate-300 px-7 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">See pricing</Link>
            </div>
          </div>

          {/* Laptop — fixed design width scaled to fit, so it stays a real laptop on mobile too */}
          <div ref={lapWrapRef} className="relative w-full" style={{ height: lap.h || undefined, minHeight: lap.h ? undefined : 320 }}>
          <div ref={lapInnerRef} className="absolute left-1/2 top-0 w-[540px] origin-top" style={{ transform: `translateX(-50%) scale(${lap.scale})` }}>
            <div className="rounded-2xl bg-slate-950 p-3 shadow-2xl">
              <div className="overflow-hidden rounded-lg bg-white">
                <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-100 px-3 py-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 h-4 flex-1 rounded border border-slate-200 bg-white" />
                </div>
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">Events dashboard</span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">● CHINACOAT 2026</span>
                  </div>
                  <div className="mb-2.5 grid grid-cols-3 gap-2">
                    {[["142", "Connections"], ["38", "Qualified"], ["12", "Follow-ups due"]].map(([n, l]) => (
                      <div key={l} className="rounded-xl bg-slate-50 px-3 py-2.5">
                        <b className="block text-lg font-bold text-slate-900">{n}</b>
                        <span className="text-[10px] text-slate-500">{l}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="min-h-[120px] rounded-xl bg-slate-50 p-2">
                      <h4 className="mb-2 text-[10px] font-bold uppercase text-slate-500">Prospects</h4>
                      <div className="mb-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5"><b className="block text-[10px] font-semibold">Jiangsu Oleo</b><span className="text-[8px] text-slate-500">Oleic Acid</span></div>
                      <div className="rounded-lg border border-slate-200 bg-white px-2 py-1.5"><b className="block text-[10px] font-semibold">Anhui Trd.</b><span className="text-[8px] text-slate-500">Glycerine</span></div>
                    </div>
                    <div className="min-h-[120px] rounded-xl bg-slate-50 p-2">
                      <h4 className="mb-2 text-[10px] font-bold uppercase text-slate-500">Qualified</h4>
                      <div className="rounded-lg border border-slate-200 bg-white px-2 py-1.5"><b className="block text-[10px] font-semibold">Guangzhou Ct.</b><span className="text-[8px] text-slate-500">TiO₂ 200 MT</span><br /><span className="mt-1 inline-block rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] text-emerald-700">Healthy</span></div>
                    </div>
                    <div className="min-h-[120px] rounded-xl bg-slate-50 p-2">
                      <h4 className="mb-2 text-[10px] font-bold uppercase text-slate-500">Samples</h4>
                      <div className="rounded-lg border border-slate-200 bg-white px-2 py-1.5"><b className="block text-[10px] font-semibold">Shanghai Fd.</b><span className="text-[8px] text-slate-500">Coconut Oil</span><br /><span className="mt-1 inline-block rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] text-amber-700">Due today</span></div>
                    </div>
                    <div className="min-h-[120px] rounded-xl bg-slate-50 p-2">
                      <h4 className="mb-2 text-[10px] font-bold uppercase text-slate-500">Quotation</h4>
                      <div className="rounded-lg border border-slate-200 bg-white px-2 py-1.5"><b className="block text-[10px] font-semibold">Delta Impex</b><span className="text-[8px] text-slate-500">500 MT</span><br /><span className="mt-1 inline-block rounded-full bg-rose-100 px-1.5 py-0.5 text-[8px] text-rose-700">At risk</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Laptop base — wider deck with a trackpad notch */}
            <div className="mx-auto w-[112%] -translate-x-[5.3%]">
              <div className="relative h-4 w-full rounded-b-xl bg-gradient-to-b from-slate-300 to-slate-400">
                <div className="absolute left-1/2 top-0 h-2 w-28 -translate-x-1/2 rounded-b-lg bg-slate-500/60" />
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* ORBIT */}
      <section className="px-6 py-20 lg:px-16">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-600">It all starts at the booth</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">connect with every booth visitor</h2>
            <p className="mt-3 max-w-md text-base text-slate-600">At a busy exhibition, the difference between a won deal and a lost one is whether you captured the conversation while it was still fresh. ExpoLead OS makes that effortless.</p>
            <div className="relative mx-auto mt-8 aspect-square w-full max-w-[380px]">
              <div className="absolute inset-9 rounded-full border border-dashed border-slate-300" />
              <div className="spin-orbit absolute inset-0">
                {AVATARS.map((a) => (
                  <div key={a.src} className="counter-orbit absolute -m-[31px] h-[62px] w-[62px] overflow-hidden rounded-full border-[3px] border-white shadow-lg [will-change:transform] [backface-visibility:hidden]" style={a.pos}>
                    <img src={a.src} alt="" className="absolute left-1/2 top-1/2 h-[165%] w-[165%] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain" />
                  </div>
                ))}
              </div>
              <div className="absolute left-1/2 top-1/2 z-10 -ml-[59px] -mt-[59px] flex h-[118px] w-[118px] items-center justify-center rounded-full border border-slate-100 bg-white shadow-xl">
                <BoxLogo size="lg" />
              </div>
            </div>
          </div>
          <div>
            {FEATURES.map(([title, desc], i) => (
              <div key={title} className={`border-b border-slate-200 py-5 ${i === 0 ? "border-t" : ""}`}>
                <h3 className="mb-1.5 text-lg font-bold text-emerald-700">{title}</h3>
                <p className="max-w-xl text-sm leading-6 text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TABS */}
      <section className="bg-slate-50 px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mx-auto max-w-2xl text-center text-3xl font-black leading-tight tracking-tight text-slate-900 md:text-4xl">why ExpoLead OS for exhibitions</h2>
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap gap-1 rounded-2xl border border-slate-200 bg-white p-1.5">
            {TABS.map((t, i) => (
              <button
                key={t.key}
                onClick={() => setTab(i)}
                className={`flex-1 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${i === tab ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:text-slate-700"}`}
                style={{ flexBasis: "40%" }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-12 md:grid-cols-[1fr_1.15fr]">
            <div>
              <h3 className="text-2xl font-bold text-emerald-700">{active.title}</h3>
              <p className="mt-4 max-w-sm text-base text-slate-600">{active.desc}</p>
            </div>
            <ul className="flex flex-col gap-4">
              {active.points.map(([b, rest]) => (
                <li key={b} className="text-sm leading-6 text-slate-600">
                  <b className="font-bold text-slate-900">{b}:</b> {rest}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center lg:px-16">
        <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">ready to keep every booth lead alive?</h2>
        <p className="mx-auto mt-3 max-w-md text-base text-slate-600">Start a 14-day free trial. No credit card, no sales call, cancel anytime.</p>
        <Link href="/login?mode=signup" className="mt-6 inline-block rounded-xl bg-emerald-600 px-7 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors">Start free trial</Link>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 px-6 py-10 text-center text-sm text-slate-400 lg:px-16">
        © 2026 ExpoLead OS · Built for exhibitions. Designed for revenue growth.
      </footer>
    </main>
  );
}
