"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { saveErrorMessage } from "@/lib/errors";
import { useToast } from "@/components/useToast";
import Select from "@/components/Select";
import ConnectionPicker, { type ConnOption } from "@/components/ConnectionPicker";
import { QUANTITY_UNITS } from "@/lib/quantity-units";
import type { Exhibition } from "@/lib/types";

type Line = { product: string; quantity: string; unit: string };

export default function AddOpportunityForm({ exhibitions, connections = [], isLocked, quantityUnit = "MT", currency = "USD", onOpenChange }: { exhibitions: Exhibition[]; connections?: ConnOption[]; isLocked?: boolean; quantityUnit?: string; currency?: string; onOpenChange?: (open: boolean) => void }) {
  const router = useRouter();
  const { showToast, ToastUI } = useToast();
  const [open, setOpenState] = useState(false);
  const [saving, setSaving] = useState(false);
  const [conn, setConn] = useState<ConnOption | null>(null);

  const emptyLine = (): Line => ({ product: "", quantity: "", unit: quantityUnit });

  const [form, setForm] = useState({
    name: "",
    deal_value: "",
    destination_market: "",
    priority: "medium",
    status: "researching",
    notes: "",
    exhibition: "",
    booth: "",
  });
  const [lines, setLines] = useState<Line[]>([emptyLine()]);

  function setOpen(v: boolean) {
    setOpenState(v);
    onOpenChange?.(v);
  }

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  // Booth only applies when the user visited the connection's booth (buyer
  // case). Hidden when they came to the user's own stand, or shown for manual
  // (no-connection) entries.
  const showBooth = !conn || conn.visited_their_booth;

  function pickConnection(c: ConnOption | null) {
    setConn(c);
    if (!c) return;
    setForm((f) => ({
      ...f,
      exhibition: f.exhibition || (c.exhibition_name ?? ""),
      booth: c.visited_their_booth ? (f.booth || (c.booth_number ?? "")) : "",
      name: f.name || (c.exhibition_name ? `${c.company_name} — ${c.exhibition_name}` : c.company_name),
    }));
    // Pull the connection's captured products in as ready-to-fill lines.
    if (c.products.length > 0) {
      setLines(c.products.map((p) => ({ product: p, quantity: "", unit: quantityUnit })));
    }
  }

  function updateLine(i: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function addLine() {
    setLines((ls) => [...ls, emptyLine()]);
  }
  function removeLine(i: number) {
    setLines((ls) => (ls.length === 1 ? ls : ls.filter((_, idx) => idx !== i)));
  }

  function resetAll() {
    setConn(null);
    setForm({ name: "", deal_value: "", destination_market: "", priority: "medium", status: "researching", notes: "", exhibition: "", booth: "" });
    setLines([emptyLine()]);
  }

  async function save() {
    if (!isSupabaseConfigured) return;
    if (!form.name.trim()) {
      showToast("Add an opportunity name.", "error");
      return;
    }
    const cleanLines = lines.filter((l) => l.product.trim());
    if (cleanLines.length === 0) {
      showToast("Add at least one product.", "error");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showToast("Please login again.", "error");
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("opportunities")
      .insert({
        user_id: user.id,
        name: form.name.trim(),
        // Legacy summary column, kept for back-compat; line items are the source of truth.
        product: cleanLines.map((l) => l.product.trim()).join(", "),
        quantity: null,
        quantity_unit: null,
        deal_value: form.deal_value.trim() === "" ? null : Number(form.deal_value),
        destination_market: form.destination_market || null,
        priority: form.priority,
        status: form.status,
        notes: form.notes || null,
        exhibition: form.exhibition || null,
        booth: showBooth ? (form.booth || null) : null,
        supplier_id: conn?.id ?? null,
      })
      .select("id")
      .single();

    if (error || !data) {
      showToast(saveErrorMessage(error, "opportunity", "Could not save opportunity."), "error");
      setSaving(false);
      return;
    }

    const { error: lineErr } = await supabase.from("opportunity_products").insert(
      cleanLines.map((l) => ({
        opportunity_id: data.id,
        product: l.product.trim(),
        quantity: l.quantity.trim() === "" ? null : Number(l.quantity),
        quantity_unit: l.unit || quantityUnit,
      }))
    );
    if (lineErr) {
      showToast("Saved, but some product lines did not save.", "error");
    }

    setSaving(false);
    setOpen(false);
    resetAll();
    router.refresh();
  }

  if (isLocked) {
    return (
      <a href="/upgrade" className="inline-flex items-center gap-1.5 rounded-lg bg-ink-100 px-3.5 py-2 text-sm font-medium text-ink-400" title="Your trial has ended, upgrade to continue">
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
  // No w-full here — these sit in a flex row and size via flex-1 / fixed widths.
  const lineInputClass =
    "rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

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

          {/* Connection first — it drives the rest of the form */}
          <div>
            <span className="mb-1.5 block text-sm font-semibold text-emerald-700">Start with the connection</span>
            <ConnectionPicker connections={connections} value={conn} onSelect={pickConnection} />
            <p className="mt-1 text-xs text-ink-400">
              {conn ? "Products, exhibition and booth below are pulled from this connection — adjust as needed." : "Pick the buyer/supplier you spoke to and this fills in from what you captured. Or leave blank to enter manually."}
            </p>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-700">Opportunity name</span>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Auto-fills from the connection — edit if needed"
              className={inputClass}
            />
          </div>

          {/* Product lines — one order, many products, each with its own quantity */}
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-700">Products &amp; quantities</span>
            <div className="space-y-2">
              {lines.map((l, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={l.product}
                    onChange={(e) => updateLine(i, { product: e.target.value })}
                    placeholder="Product, e.g. Black tea"
                    className={`${lineInputClass} min-w-0 flex-1`}
                  />
                  <input
                    value={l.quantity}
                    onChange={(e) => updateLine(i, { quantity: e.target.value.replace(/[^\d.]/g, "") })}
                    inputMode="decimal"
                    placeholder="Qty"
                    className={`${lineInputClass} w-20 shrink-0`}
                  />
                  <div className="w-24 shrink-0">
                    <Select
                      value={l.unit}
                      onChange={(v) => updateLine(i, { unit: v })}
                      size="sm"
                      options={QUANTITY_UNITS.map((u) => ({ value: u.value, label: u.value }))}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    disabled={lines.length === 1}
                    aria-label="Remove product"
                    className="shrink-0 rounded-lg border border-ink-200 px-2.5 text-ink-400 hover:bg-ink-50 hover:text-rose-600 disabled:opacity-30"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addLine}
              className="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              + Add another product
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              value={form.deal_value}
              onChange={(e) => set("deal_value", e.target.value.replace(/[^\d.]/g, ""))}
              inputMode="decimal"
              placeholder={`Total deal value in ${currency}, optional`}
              title="Optional. The value of the whole order. Used to work out the return on each exhibition."
              className={inputClass}
            />
            {showBooth && (
              <input
                value={form.booth}
                onChange={(e) => set("booth", e.target.value)}
                placeholder="Their booth, e.g. E3.K15"
                className={inputClass}
              />
            )}

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

        {/* Guide note, coaches first-time users */}
        <div className="w-full max-w-sm rounded-xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-sm font-bold text-emerald-900 mb-3">New here? Tracking an opportunity</p>
          <div className="space-y-2.5">
            <div className="flex gap-2.5 items-start">
              <span className="flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">1</span>
              <p className="text-xs leading-relaxed text-emerald-800">Start by picking the connection you spoke to. Their products, exhibition and booth fill in automatically.</p>
            </div>
            <div className="flex gap-2.5 items-start">
              <span className="flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">2</span>
              <p className="text-xs leading-relaxed text-emerald-800">Tick the products in this order and set a quantity for each. One order can have several products.</p>
            </div>
            <div className="flex gap-2.5 items-start">
              <span className="flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">3</span>
              <p className="text-xs leading-relaxed text-emerald-800">Add the total deal value if a quotation came up at the booth. Optional, and it is what turns this show into a return figure on Reports.</p>
            </div>
            <div className="flex gap-2.5 items-start">
              <span className="flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">4</span>
              <p className="text-xs leading-relaxed text-emerald-800">Set priority and stage, add notes such as target price or buyer expectations, then save.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
