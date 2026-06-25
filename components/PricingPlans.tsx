"use client";

import { useState } from "react";
import Link from "next/link";

export default function PricingPlans() {
  const [annual, setAnnual] = useState(true);

  return (
    <div>
      {/* Billing toggle */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
          <button
            onClick={() => setAnnual(false)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${!annual ? "bg-emerald-600 text-white" : "text-slate-500 hover:text-slate-800"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${annual ? "bg-emerald-600 text-white" : "text-slate-500 hover:text-slate-800"}`}
          >
            Annual · save 2 months
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* SOLO */}
        <div className="relative rounded-2xl border-2 border-emerald-500 bg-white p-6">
          <span className="absolute -top-3 left-6 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold text-white">Available now</span>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Solo</p>
          <div className="mt-2 flex items-end gap-1.5">
            <span className="text-4xl font-black text-slate-900">{annual ? "$190" : "$19"}</span>
            <span className="mb-1.5 text-sm text-slate-500">{annual ? "/year" : "/month"}</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {annual ? "≈ $15.83/mo · 2 months free vs monthly" : "billed monthly · or $190/yr to save"}
          </p>
          <Link href="/login?mode=signup" className="mt-5 block rounded-lg bg-emerald-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-500 transition-colors">
            Start free trial
          </Link>
          <p className="mt-5 text-xs font-bold text-slate-600">For solo buyers, traders &amp; sourcing managers</p>
          <ul className="mt-3 space-y-2.5">
            {[
              "Unlimited exhibitions",
              "Unlimited connections & opportunities",
              "Follow-up tracking & reminders",
              "Exhibition library & directory",
              "CSV export",
              "Email support",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700">
                <CheckIcon /> {f}
              </li>
            ))}
            <li className="flex items-center gap-2.5 text-sm text-slate-400">
              <CheckIcon muted /> <span>AI booth summaries</span>
              <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700">Soon</span>
            </li>
          </ul>
        </div>

        {/* TEAM */}
        <div className="relative rounded-2xl border border-slate-200 bg-white p-6">
          <span className="absolute -top-3 left-6 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold text-amber-700">Coming soon</span>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Team</p>
          <div className="mt-2 flex items-end gap-1.5">
            <span className="text-4xl font-black text-slate-900">{annual ? "$490" : "$49"}</span>
            <span className="mb-1.5 text-sm text-slate-500">{annual ? "/year" : "/month"}</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {annual ? "≈ $40.83/mo · 2 months free vs monthly" : "billed monthly · or $490/yr to save"}
          </p>
          <a href="mailto:hello.expolead@tradesoil.com?subject=ExpoLead%20OS%20Team%20plan%20waitlist" className="mt-5 block rounded-lg border border-slate-300 py-2.5 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Join the waitlist
          </a>
          <p className="mt-5 text-xs font-bold text-slate-600">For trading companies &amp; sourcing teams</p>
          <ul className="mt-3 space-y-2.5">
            <li className="flex items-center gap-2.5 text-sm text-slate-700"><CheckIcon /> Everything in Solo</li>
            <li className="flex items-center gap-2.5 text-sm text-slate-700"><CheckIcon /> Up to 5 users</li>
            <li className="flex items-center gap-2.5 text-sm text-slate-400">
              <CheckIcon muted /> <span>Shared workspace</span>
              <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700">Soon</span>
            </li>
            <li className="flex items-center gap-2.5 text-sm text-slate-400">
              <CheckIcon muted /> <span>Team activity &amp; reporting</span>
              <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700">Soon</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function CheckIcon({ muted }: { muted?: boolean }) {
  return (
    <svg className={`h-4 w-4 shrink-0 ${muted ? "text-slate-300" : "text-emerald-500"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
