"use client";

import { useState } from "react";
import Link from "next/link";
import { PLAN_PRICES, PLAN_LABELS, BANK_DETAILS, type PlanId, type BillingCycle } from "@/lib/plans";

type Props = {
  daysLeft: number;
  isExpired: boolean;
  usage: { connections: number; opportunities: number; exhibitions: number };
  limits: { connections: number; opportunities: number; exhibitions: number };
};

const PLAN_FEATURES: Record<PlanId, string[]> = {
  starter: [
    "Unlimited exhibitions, connections and opportunities",
    "CSV export",
    "Reports and ROI view",
    "“Met before” year-over-year memory",
  ],
  growth: [
    "Everything in Starter",
    "Up to 5 users (soon)",
    "Shared workspace (soon)",
    "Priority email support",
  ],
};

export default function UpgradeFlow({ daysLeft, isExpired, usage, limits }: Props) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [plan, setPlan] = useState<PlanId>("starter");
  const [step, setStep] = useState<1 | 2>(1);
  const [reference, setReference] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = PLAN_PRICES[plan][cycle];

  async function requestUpgrade() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/upgrade-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billingCycle: cycle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setReference(data.reference);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function claimPayment() {
    if (!reference) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/upgrade-request/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setConfirmed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <p className="text-lg font-bold text-emerald-900">Thank you, we are on it</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-emerald-800">
          We will check for your transfer quoting <strong>{reference}</strong> and unlock your
          account within one business day. You will get an email as soon as it is done.
        </p>
        <Link href="/dashboard" className="mt-6 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (step === 2 && reference) {
    return (
      <div className="rounded-2xl border border-ink-200 bg-white p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">Step 2 of 2</p>
        <h2 className="mt-1 text-xl font-bold text-ink-900">Pay by bank transfer</h2>

        <div className="mt-5 space-y-0 text-sm">
          <div className="flex justify-between border-b border-ink-100 py-2.5">
            <span className="text-ink-500">Plan</span>
            <span className="font-medium text-ink-900">{PLAN_LABELS[plan].name}, {cycle}</span>
          </div>
          <div className="flex justify-between border-b border-ink-100 py-2.5">
            <span className="text-ink-500">Amount</span>
            <span className="font-medium text-ink-900">USD {amount.toFixed(2)}</span>
          </div>
          {BANK_DETAILS.map((d) => (
            <div key={d.label} className="flex justify-between border-b border-ink-100 py-2.5">
              <span className="text-ink-500">{d.label}</span>
              <span className="font-mono font-medium text-ink-900">{d.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Quote reference <strong className="font-mono">{reference}</strong> on your transfer so we can match your payment.
        </div>

        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

        <button
          onClick={claimPayment}
          disabled={submitting}
          className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? "Just a moment…" : "I have made the payment"}
        </button>
        <button
          onClick={() => setStep(1)}
          disabled={submitting}
          className="mt-2 w-full rounded-lg border border-ink-200 px-4 py-3 text-sm font-medium text-ink-600 hover:bg-ink-50 disabled:opacity-60"
        >
          Choose a different plan
        </button>

        <p className="mt-4 text-xs leading-relaxed text-ink-400">
          Your request is saved. We unlock your account within one business day of the transfer
          arriving and email you to confirm. Questions, reply to any of our emails.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6 md:p-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">Step 1 of 2</p>
      <h2 className="mt-1 text-xl font-bold text-ink-900">Choose your plan</h2>

      <div className="mt-4 rounded-lg bg-ink-50 px-4 py-3 text-sm text-ink-600">
        {isExpired
          ? "Your trial has ended. You can still view and edit everything you captured."
          : `Trial, ${daysLeft} ${daysLeft === 1 ? "day" : "days"} left.`}{" "}
        Used {usage.connections} of {limits.connections} connections, {usage.opportunities} of{" "}
        {limits.opportunities} opportunities, {usage.exhibitions} of {limits.exhibitions} exhibition.
      </div>

      <div className="mt-5 inline-flex rounded-full border border-ink-200 p-0.5 text-sm">
        {(["monthly", "annual"] as BillingCycle[]).map((c) => (
          <button
            key={c}
            onClick={() => setCycle(c)}
            className={`rounded-full px-4 py-1.5 font-medium capitalize transition-colors ${
              cycle === c ? "bg-emerald-600 text-white" : "text-ink-500 hover:text-ink-700"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-400">Annual is billed as twelve months up front. It is not a discounted rate.</p>

      <div className="mt-4 space-y-3">
        {(Object.keys(PLAN_PRICES) as PlanId[]).map((id) => (
          <button
            key={id}
            onClick={() => setPlan(id)}
            className={`w-full rounded-xl border p-4 text-left transition-colors ${
              plan === id ? "border-emerald-500 bg-emerald-50" : "border-ink-200 hover:border-ink-300"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-ink-900">{PLAN_LABELS[id].name}</p>
                <p className="mt-0.5 text-xs text-ink-500">{PLAN_LABELS[id].tagline}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-lg font-bold text-ink-900">${PLAN_PRICES[id][cycle]}</p>
                <p className="text-xs text-ink-400">/{cycle === "monthly" ? "month" : "year"}</p>
              </div>
            </div>
            <ul className="mt-3 space-y-1">
              {PLAN_FEATURES[id].map((f) => (
                <li key={f} className="flex gap-2 text-xs text-ink-600">
                  <span className="text-emerald-600">&#10003;</span>
                  {f}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

      <button
        onClick={requestUpgrade}
        disabled={submitting}
        className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {submitting ? "Just a moment…" : "Continue to payment"}
      </button>
      <p className="mt-3 text-center text-xs text-ink-400">
        Card payment is coming soon. For now we take bank transfer and unlock your account manually.
      </p>
    </div>
  );
}
