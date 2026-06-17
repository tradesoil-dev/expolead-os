"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Exhibition } from "@/lib/types";

export default function AddOpportunityForm({ exhibitions, isLocked }: { exhibitions: Exhibition[]; isLocked?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    product: "",
    quantity: "",
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
  alert("Please login again.");
  setSaving(false);
  return;
}

const { error } = await supabase.from("opportunities").insert({
  user_id: user.id,
  name: form.name.trim(),
  product: form.product.trim(),
  quantity: form.quantity || null,
  destination_market: form.destination_market || null,
  priority: form.priority,
  status: form.status,
  notes: form.notes || null,
exhibition: form.exhibition || null,
booth: form.booth || null,
});

if (error) {
  alert(error.message);
  setSaving(false);
  return;
}

    setSaving(false);
    setOpen(false);
    setForm({
      name: "",
      product: "",
      quantity: "",
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
    <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card space-y-4">
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
        <input
          value={form.quantity}
          onChange={(e) => set("quantity", e.target.value)}
          placeholder="Quantity, e.g. 500 MT/month"
          className={inputClass}
        />

<select
  value={form.exhibition}
  onChange={(e) => set("exhibition", e.target.value)}
  className={inputClass}
>
  <option value="">Select exhibition</option>
  {exhibitions.map((ex) => (
    <option key={ex.id} value={ex.name}>{ex.name}</option>
  ))}
</select>
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
      
        <select
          value={form.priority}
          onChange={(e) => set("priority", e.target.value)}
          className={inputClass}
        >
          <option value="high">High priority</option>
          <option value="medium">Medium priority</option>
          <option value="low">Low priority</option>
        </select>

        <select
          value={form.status}
          onChange={(e) => set("status", e.target.value)}
          className={inputClass}
        >
          <option value="researching">Qualified</option>
<option value="contacted">Pricing</option>
<option value="evaluating">Evaluation</option>
<option value="negotiating">Negotiating</option>
<option value="won">Won</option>
<option value="lost">Lost</option>
        </select>
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
  );
}