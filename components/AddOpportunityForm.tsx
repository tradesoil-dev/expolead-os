"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { saveErrorMessage } from "@/lib/errors";
import { useToast } from "@/components/useToast";
import Select from "@/components/Select";
import { QUANTITY_UNITS } from "@/lib/quantity-units";
import type { Exhibition } from "@/lib/types";

export default function AddOpportunityForm({ exhibitions, isLocked, quantityUnit = "MT" }: { exhibitions: Exhibition[]; isLocked?: boolean; quantityUnit?: string }) {
  const router = useRouter();
  const { showToast, ToastUI } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    product: "",
    quantity: "",
    quantity_unit: quantityUnit,
    destination_market: "",
    priority: "medium",
    status: "researching",
    notes: "",
exhibition: "",
booth: "",

  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    if (!isSupabaseConfigured) return;
    if (!form.name.trim() || !form.product.trim()) return;

    setSaving(true);

    const supabase = createClient();

const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  showToast("Please login again.", "error");
  setSaving(false);
  return;
}

const { error } = await supabase.from("opportunities").insert({
  user_id: user.id,
  name: form.name.trim(),
  product: form.product.trim(),
  quantity: form.quantity || null,
  quantity_unit: form.quantity_unit || null,
  destination_market: form.destination_market || null,
  priority: form.priority,
  status: form.status,
  notes: form.notes || null,
exhibition: form.exhibition || null,
booth: form.booth || null,
});

if (error) {
  showToast(saveErrorMessage(error, "opportunity", "Could not save opportunity."), "error");
  setSaving(false);
  return;
}

    setSaving(false);
    setOpen(false);
    setForm({
      name: "",
      product: "",
      quantity: "",
      quantity_unit: quantityUnit,
      destination_market: "",
      priority: "medium",
      status: "researching",
      notes: "",
exhibition: "",
booth: "",

    });

    router.refresh();
  }

  if (isLocked) {
    return (
      <a href="/pricing" className="inline-flex items-center gap-1.5 rounded-lg bg-ink-100 px-3.5 py-2 text-sm font-medium text-ink-400" title="Your trial has ended — upgrade to continue">
        🔒 New Opportunity
      </a>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-ink-700"
      >
        + New Opportunity
      </button>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

  return (
    <div className="space-y-3">
      {ToastUI}
      <button
        onClick={() => setOpen(false)}
        className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
      >
        ← Back to opportunities
      </button>
      <div className="flex flex-col lg:flex-row gap-4 items-start">
    <div className="w-full max-w-2xl rounded-xl border border-ink-200 bg-white p-5 shadow-card space-y-4">
      <h2 className="text-sm font-semibold">New Opportunity</h2>

      <input
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder="Opportunity name, e.g. UCO Korea Program"
        className={inputClass}
      />

      <input
        value={form.product}
        onChange={(e) => set("product", e.target.value)}
        placeholder="Product, e.g. Used Cooking Oil"
        className={inputClass}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex gap-2">
          <input
            value={form.quantity}
            onChange={(e) => set("quantity", e.target.value)}
            placeholder="Quantity, e.g. 500"
            className={`${inputClass} flex-1`}
          />
          <div className="w-32 shrink-0">
            <Select
              value={form.quantity_unit}
              onChange={(v) => set("quantity_unit", v)}
              options={QUANTITY_UNITS.map((u) => ({ value: u.value, label: u.value }))}
            />
          </div>
        </div>

<Select
  value={form.exhibition}
  onChange={(v) => set("exhibition", v)}
  placeholder="Select exhibition"
  options={[{ value: "", label: "Select exhibition" }, ...exhibitions.map((ex) => ({ value: ex.name, label: ex.name }))]}
/>
        <input
          value={form.destination_market}
          onChange={(e) => set("destination_market", e.target.value)}
          placeholder="Destination market, e.g. South Korea"
          className={inputClass}
        />
        <input
  value={form.booth}
  onChange={(e) => set("booth", e.target.value)}
  placeholder="Booth, e.g. E3.K15"
  className={inputClass}
/>
      
        <Select
          value={form.priority}
          onChange={(v) => set("priority", v)}
          options={[
            { value: "high", label: "High priority" },
            { value: "medium", label: "Medium priority" },
            { value: "low", label: "Low priority" },
          ]}
        />

        <Select
          value={form.status}
          onChange={(v) => set("status", v)}
          options={[
            { value: "researching", label: "Qualified" },
            { value: "contacted", label: "Pricing" },
            { value: "evaluating", label: "Evaluation" },
            { value: "negotiating", label: "Negotiating" },
            { value: "won", label: "Won" },
            { value: "lost", label: "Lost" },
          ]}
        />
      </div>

      <textarea
        value={form.notes}
        onChange={(e) => set("notes", e.target.value)}
        placeholder="Notes, requirements, buyer expectations, target price..."
        rows={4}
        className={`${inputClass} resize-y`}
      />

      <div className="flex items-center gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save opportunity"}
        </button>

        <button
          onClick={() => setOpen(false)}
          className="text-sm text-ink-500 hover:text-ink-900"
        >
          Cancel
        </button>
      </div>
    </div>

    {/* Guide note — coaches first-time users */}
    <div className="w-full max-w-sm rounded-xl border border-emerald-100 bg-emerald-50 p-5">
      <p className="text-sm font-bold text-emerald-900 mb-3">New here? Tracking an opportunity</p>
      <div className="space-y-2.5">
        <div className="flex gap-2.5 items-start">
          <span className="flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">1</span>
          <p className="text-xs leading-relaxed text-emerald-800">Name the opportunity and product — e.g. &ldquo;UCO Korea Program&rdquo;, Used Cooking Oil.</p>
        </div>
        <div className="flex gap-2.5 items-start">
          <span className="flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">2</span>
          <p className="text-xs leading-relaxed text-emerald-800">Add quantity and destination market, and link the exhibition where it started.</p>
        </div>
        <div className="flex gap-2.5 items-start">
          <span className="flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">3</span>
          <p className="text-xs leading-relaxed text-emerald-800">Set priority and stage, add notes (target price, buyer expectations), then save.</p>
        </div>
      </div>
    </div>
    </div>
    </div>
  );
}