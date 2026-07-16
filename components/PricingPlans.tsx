"use client";

import { useState } from "react";
import Link from "next/link";

type Feature = { label: string; soon?: boolean };

type Plan = {
  name: string;
  tagline: string;
  monthly: number;
  annual: number;
  outcome: string;
  cta: { label: string; href: string };
  featured?: boolean;
  badge?: { label: string; tone: "emerald" | "amber" };
  features: Feature[];
  inheritsFrom?: string;
};

const PLANS: Plan[] = [
  {
    name: "Trial",
    tagline: "Try it on a real show",
    monthly: 0,
    annual: 0,
    outcome: "Capture your first show and see the value",
    cta: { label: "Start free", href: "/login?mode=signup" },
    features: [
      { label: "1 exhibition" },
      { label: "Up to 25 connections" },
      { label: "Up to 10 opportunities" },
      { label: "Follow-up tracking & reminders" },
      { label: "Exhibition library" },
    ],
  },
  {
    name: "Starter",
    tagline: "Everything one person needs",
    monthly: 29,
    annual: 290,
    outcome: "Never lose a lead, run your full pipeline solo",
    cta: { label: "Start free trial", href: "/login?mode=signup" },
    features: [
      { label: "Unlimited exhibitions" },
      { label: "Unlimited connections & opportunities" },
      { label: "Follow-up tracking & reminders" },
      { label: "Exhibition library" },
      { label: "“Met before” year-over-year memory" },
      { label: "Reports & insights" },
      { label: "CSV export" },
      { label: "Email support" },
    ],
  },
  {
    name: "Growth",
    tagline: "For teams working shows together",
    monthly: 99,
    annual: 990,
    outcome: "Your whole team, one shared exhibition memory",
    cta: { label: "Start free trial", href: "/login?mode=signup" },
    featured: true,
    badge: { label: "Most popular", tone: "emerald" },
    inheritsFrom: "Starter",
    features: [
      { label: "Up to 5 users", soon: true },
      { label: "Shared workspace", soon: true },
      { label: "Team activity & reporting", soon: true },
      { label: "Priority email support" },
    ],
  },
];

export default function PricingPlans() {
  const [annual, setAnnual] = useState(true);

  return (
    <div>
      {/* Billing toggle */}
      <div className="mb-8 flex justify-center">
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

      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const free = plan.monthly === 0;
          const priceLabel = free ? "$0" : annual ? `$${plan.annual}` : `$${plan.monthly}`;
          const perLabel = free ? "" : annual ? "/year" : "/month";
          const subLabel = free
            ? "No card required to start"
            : annual
            ? `≈ $${Math.round((plan.annual / 12) * 10) / 10}/mo · 2 months free`
            : `or $${plan.annual}/yr to save 2 months`;

          return (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl bg-white p-6 ${plan.featured ? "border-2 border-emerald-500 shadow-lg" : "border border-slate-200"}`}
            >
              {plan.badge && (
                <span className={`absolute -top-3 left-6 rounded-full px-3 py-1 text-[10px] font-bold ${plan.badge.tone === "emerald" ? "bg-emerald-600 text-white" : "bg-amber-100 text-amber-700"}`}>
                  {plan.badge.label}
                </span>
              )}

              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{plan.name}</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{plan.tagline}</p>

              <div className="mt-4 flex items-end gap-1.5">
                <span className="text-4xl font-black text-slate-900">{priceLabel}</span>
                {perLabel && <span className="mb-1.5 text-sm text-slate-500">{perLabel}</span>}
              </div>
              <p className="mt-1 text-xs text-slate-400">{subLabel}</p>

              {/* What that covers */}
              <div className="mt-4 rounded-lg border-l-[3px] border-emerald-500 bg-emerald-50/60 px-3 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">What that covers</p>
                <p className="mt-0.5 text-[13px] font-medium leading-snug text-slate-700">{plan.outcome}</p>
              </div>

              <Link
                href={plan.cta.href}
                className={`mt-5 block rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${plan.featured ? "bg-emerald-600 text-white hover:bg-emerald-500" : "border border-slate-300 text-slate-700 hover:bg-slate-50"}`}
              >
                {plan.cta.label}
              </Link>

              <ul className="mt-5 space-y-2.5">
                {plan.inheritsFrom && (
                  <li className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                    <CheckIcon /> Everything in {plan.inheritsFrom}
                  </li>
                )}
                {plan.features.map((f) => (
                  <li key={f.label} className={`flex items-center gap-2.5 text-sm ${f.soon ? "text-slate-400" : "text-slate-700"}`}>
                    <CheckIcon muted={f.soon} />
                    <span>{f.label}</span>
                    {f.soon && <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700">Soon</span>}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        14-day free trial on paid plans. No credit card required to start.
      </p>
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
