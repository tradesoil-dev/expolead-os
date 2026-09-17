"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/useToast";
import type { Pricing, PlanPricing } from "@/lib/pricing";
import type { PlanId } from "@/lib/plans";

type Draft = {
  monthly: string;
  annual: string;
  introEnabled: boolean;
  introMonthly: string;
  introMonths: string;
  introLabel: string;
};

function toDraft(p: PlanPricing): Draft {
  return {
    monthly: String(p.monthly),
    annual: String(p.annual),
    introEnabled: p.introEnabled,
    introMonthly: String(p.introMonthly),
    introMonths: String(p.introMonths),
    introLabel: p.introLabel ?? "",
  };
}

const PLAN_META: { id: PlanId; name: string; note?: string }[] = [
  { id: "starter", name: "Starter" },
  { id: "growth", name: "Growth", note: "Still under development (Coming soon on the pricing page)." },
];

const inputClass =
  "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition";

const n = (s: string) => {
  const v = parseInt(s, 10);
  return Number.isFinite(v) && v >= 0 ? v : 0;
};

export default function AdminPricing({ pricing }: { pricing: Pricing }) {
  const router = useRouter();
  const { showToast, ToastUI } = useToast();
  const [drafts, setDrafts] = useState<Record<PlanId, Draft>>({
    starter: toDraft(pricing.starter),
    growth: toDraft(pricing.growth),
  });
  const [savingPlan, setSavingPlan] = useState<PlanId | null>(null);

  function upd(id: PlanId, patch: Partial<Draft>) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));
  }

  async function save(id: PlanId) {
    const d = drafts[id];
    setSavingPlan(id);
    const supabase = createClient();
    const { error } = await supabase.rpc("admin_update_pricing", {
      p_plan: id,
      p_monthly: n(d.monthly),
      p_annual: n(d.annual),
      p_intro_enabled: d.introEnabled,
      p_intro_monthly: n(d.introMonthly),
      p_intro_months: Math.max(n(d.introMonths), 1),
      p_intro_label: d.introLabel.trim() || null,
    });
    setSavingPlan(null);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    showToast(`${id === "starter" ? "Starter" : "Growth"} pricing saved. Live across the site.`, "success");
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-4">
      {ToastUI}

      <p className="rounded-lg bg-ink-50 px-4 py-3 text-sm text-ink-600">
        Changes go live on the pricing page and the in-app upgrade screen as soon as you save. The charged
        amount is always the standard price shown here. The introductory offer is a first-period price that a
        customer sees clearly (&ldquo;$X for your first month, then $Y/month&rdquo;); the automatic recurring
        charge for it lands with the payment gateway.
      </p>

      {PLAN_META.map(({ id, name, note }) => {
        const d = drafts[id];
        const saving = savingPlan === id;
        const showIntroPreview = d.introEnabled && n(d.introMonthly) < n(d.monthly);
        return (
          <div key={id} className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink-900">{name}</h2>
              {note && <span className="text-[11px] font-medium text-amber-600">{note}</span>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Base price, monthly (USD)">
                <input type="number" min={0} value={d.monthly} onChange={(e) => upd(id, { monthly: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Base price, annual (USD)">
                <input type="number" min={0} value={d.annual} onChange={(e) => upd(id, { annual: e.target.value })} className={inputClass} />
                <p className="mt-1 text-[11px] text-ink-400">Convention: 12x monthly, not a discount.</p>
              </Field>
            </div>

            <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/60 p-3.5">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={d.introEnabled}
                  onChange={(e) => upd(id, { introEnabled: e.target.checked })}
                  className="h-4 w-4 rounded border-ink-300"
                />
                <span className="text-sm font-semibold text-emerald-900">Introductory offer (monthly only)</span>
              </label>

              {d.introEnabled && (
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Intro price / month (USD)">
                    <input type="number" min={0} value={d.introMonthly} onChange={(e) => upd(id, { introMonthly: e.target.value })} className={inputClass} />
                  </Field>
                  <Field label="For how many months">
                    <input type="number" min={1} value={d.introMonths} onChange={(e) => upd(id, { introMonths: e.target.value })} className={inputClass} />
                  </Field>
                  <Field label="Label">
                    <input type="text" value={d.introLabel} onChange={(e) => upd(id, { introLabel: e.target.value })} placeholder="e.g. Launch offer" className={inputClass} />
                  </Field>
                </div>
              )}

              {showIntroPreview && (
                <p className="mt-3 text-xs font-semibold text-emerald-700">
                  Customers will see: {d.introLabel.trim() ? `${d.introLabel.trim()}: ` : ""}${n(d.introMonthly)} for your first{" "}
                  {n(d.introMonths) > 1 ? `${n(d.introMonths)} months` : "month"}, then ${n(d.monthly)}/month
                </p>
              )}
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => save(id)}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Saving…" : `Save ${name}`}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-700">{label}</span>
      {children}
    </label>
  );
}
