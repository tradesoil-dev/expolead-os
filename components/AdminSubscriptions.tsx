"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type UpgradeRow = {
  id: string;
  reference: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  plan: string;
  billing_cycle: string;
  amount_usd: number;
  status: "pending" | "payment_claimed" | "confirmed" | "cancelled";
  requested_at: string;
  payment_claimed_at: string | null;
  confirmed_at: string | null;
  early_access: boolean;
};

const STATUS = {
  payment_claimed: { label: "Says they have paid", cls: "bg-amber-100 text-amber-800" },
  pending: { label: "Chose a plan", cls: "bg-slate-100 text-slate-600" },
  confirmed: { label: "Confirmed", cls: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelled", cls: "bg-rose-50 text-rose-600" },
} as const;

function when(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminSubscriptions({ rows }: { rows: UpgradeRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<UpgradeRow | null>(null);

  const totals = useMemo(() => {
    const received = rows
      .filter((r) => r.status === "confirmed")
      .reduce((s, r) => s + Number(r.amount_usd), 0);
    const awaiting = rows
      .filter((r) => r.status === "payment_claimed")
      .reduce((s, r) => s + Number(r.amount_usd), 0);
    const interested = rows
      .filter((r) => r.status === "pending")
      .reduce((s, r) => s + Number(r.amount_usd), 0);
    return {
      received, awaiting, interested,
      receivedCount: rows.filter((r) => r.status === "confirmed").length,
      awaitingCount: rows.filter((r) => r.status === "payment_claimed").length,
      interestedCount: rows.filter((r) => r.status === "pending").length,
    };
  }, [rows]);

  /** Confirm goes through the API so the customer gets their receipt email. */
  async function confirmPayment(reference: string) {
    setBusy(reference);
    setError(null);
    try {
      const res = await fetch("/api/upgrade-request/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      if (data.emailSent === false) {
        setError(`${reference} is confirmed and the account is unlocked, but the confirmation email did not send. Let them know directly.`);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(null);
      setConfirmTarget(null);
    }
  }

  /** Cancel changes nothing for the customer, so it stays a direct call. */
  async function cancelRequest(reference: string) {
    setBusy(reference);
    setError(null);
    const { error } = await createClient().rpc("admin_cancel_upgrade", { p_reference: reference });
    setBusy(null);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Received and confirmed" value={totals.received} count={totals.receivedCount} tone="text-emerald-600" />
        <Stat label="They say they have paid, check your bank" value={totals.awaiting} count={totals.awaitingCount} tone="text-amber-600" />
        <Stat label="Chose a plan, have not paid yet" value={totals.interested} count={totals.interestedCount} tone="text-ink-500" />
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      {confirmTarget && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-ink-900">
              Confirm {confirmTarget.reference}?
            </h3>
            <p className="mt-2 text-sm text-ink-500">
              Only do this once <strong>USD {Number(confirmTarget.amount_usd).toFixed(2)}</strong> from{" "}
              {confirmTarget.full_name || confirmTarget.email} has actually arrived in your account.
              This unlocks their {confirmTarget.plan} plan immediately and emails them a receipt.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmTarget(null)}
                className="flex-1 rounded-lg border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmPayment(confirmTarget.reference)}
                disabled={busy === confirmTarget.reference}
                className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {busy === confirmTarget.reference ? "Working…" : "Money received, unlock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 p-8 text-center">
          <p className="text-base font-semibold text-ink-700">No upgrade requests yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
            When someone picks a plan on the upgrade page, they appear here with a reference to
            match against your bank statement.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 text-left text-[11px] uppercase tracking-wide text-ink-400">
                <th className="px-4 py-3 font-semibold">Reference</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Dates</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 font-mono font-semibold text-ink-900">{r.reference}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">{r.full_name || "—"}</p>
                    <p className="text-xs text-ink-500">{r.email}</p>
                    {r.company_name && <p className="text-xs text-ink-400">{r.company_name}</p>}
                  </td>
                  <td className="px-4 py-3 capitalize text-ink-700">
                    {r.plan}
                    <span className="block text-xs text-ink-400">{r.billing_cycle}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-ink-900">
                    {Number(r.amount_usd).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS[r.status].cls}`}>
                      {STATUS[r.status].label}
                    </span>
                    {r.status === "confirmed" && !r.early_access && (
                      <span className="mt-1 block text-[11px] font-semibold text-rose-600">
                        Account still locked, tell Claude
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-500">
                    <span className="block">Asked {when(r.requested_at)}</span>
                    {r.payment_claimed_at && <span className="block">Said paid {when(r.payment_claimed_at)}</span>}
                    {r.confirmed_at && <span className="block text-emerald-700">Confirmed {when(r.confirmed_at)}</span>}
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "confirmed" || r.status === "cancelled" ? (
                      <span className="text-xs text-ink-400">Done</span>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmTarget(r)}
                          disabled={busy === r.reference}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => cancelRequest(r.reference)}
                          disabled={busy === r.reference}
                          className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-500 hover:bg-ink-50 disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs leading-relaxed text-ink-400">
        Confirming marks the payment received and unlocks the account in one step, so the two can
        never disagree. Only confirm after the money is actually in your account.
      </p>
    </div>
  );
}

function Stat({ label, value, count, tone }: { label: string; value: number; count: number; tone: string }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4">
      <p className={`text-2xl font-black ${tone}`}>USD {Math.round(value).toLocaleString()}</p>
      <p className="mt-0.5 text-xs text-ink-500">{label}</p>
      <p className="mt-1 text-[11px] text-ink-400">{count} {count === 1 ? "request" : "requests"}</p>
    </div>
  );
}
