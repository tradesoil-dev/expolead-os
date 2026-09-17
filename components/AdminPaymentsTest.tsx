"use client";

import { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { useToast } from "@/components/useToast";

type Plan = "starter" | "growth";
type Cycle = "monthly" | "annual";

const inputClass =
  "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition";

export default function AdminPaymentsTest({ configured }: { configured: boolean }) {
  const { showToast, ToastUI } = useToast();
  const [plan, setPlan] = useState<Plan>("starter");
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [loading, setLoading] = useState(false);

  async function openCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billingCycle: cycle }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        showToast(data?.error ?? "Could not create the checkout.", "error");
        setLoading(false);
        return;
      }
      // Off to the payments.lk hosted page.
      window.location.href = data.url as string;
    } catch {
      showToast("Could not reach the checkout.", "error");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      {ToastUI}

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-semibold">Sandbox test only</p>
        <p className="mt-1 leading-relaxed">
          This uses the sandbox key, so no real money moves. The amount is charged in LKR for now
          (the API is LKR-only; USD is pending confirmation), converted from the USD price with a
          placeholder rate. It opens the same hosted checkout a customer would see.
        </p>
      </div>

      {!configured ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <p className="font-semibold">Not configured</p>
          <p className="mt-1">
            Set <code>PAYMENTS_LK_SECRET_KEY</code> in Vercel (sandbox <code>sk_test_</code> key) and
            redeploy, then this test will work.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">Plan</span>
              <select value={plan} onChange={(e) => setPlan(e.target.value as Plan)} className={inputClass}>
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">Billing cycle</span>
              <select value={cycle} onChange={(e) => setCycle(e.target.value as Cycle)} className={inputClass}>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={openCheckout}
            disabled={loading}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            {loading ? "Opening checkout…" : "Open sandbox checkout"}
          </button>

          <p className="mt-3 text-xs leading-relaxed text-ink-500">
            On the hosted page, pay with a sandbox test card: expiry <strong>01/39</strong> approves,
            <strong> 05/39</strong> declines, CVV 100. On success, payments.lk calls our webhook and
            the account is marked confirmed. Sandbox checkouts only open once your merchant
            application is submitted.
          </p>
        </div>
      )}
    </div>
  );
}
