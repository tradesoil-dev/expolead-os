"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useToast } from "@/components/useToast";
import Select from "@/components/Select";
import { QUANTITY_UNITS, formatGroupedVolume } from "@/lib/quantity-units";
import type { OpportunityProduct } from "@/lib/types";

type Line = { product: string; quantity: string; unit: string };

// Edit an opportunity's product line items. Saving replaces the whole set,
// which is simple and correct for the handful of lines an order has.
export default function OpportunityLinesEditor({
  opportunityId,
  initial,
  workspaceUnit = "MT",
}: {
  opportunityId: string;
  initial: OpportunityProduct[];
  workspaceUnit?: string;
}) {
  const router = useRouter();
  const { showToast, ToastUI } = useToast();
  const emptyLine = (): Line => ({ product: "", quantity: "", unit: workspaceUnit });
  const [lines, setLines] = useState<Line[]>(
    initial.length
      ? initial.map((p) => ({ product: p.product, quantity: p.quantity == null ? "" : String(p.quantity), unit: p.quantity_unit || workspaceUnit }))
      : [emptyLine()]
  );
  const [saving, setSaving] = useState(false);

  function updateLine(i: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function addLine() { setLines((ls) => [...ls, emptyLine()]); }
  function removeLine(i: number) { setLines((ls) => (ls.length === 1 ? ls : ls.filter((_, idx) => idx !== i))); }

  async function save() {
    if (!isSupabaseConfigured) return;
    const cleanLines = lines.filter((l) => l.product.trim());
    setSaving(true);
    const supabase = createClient();
    const { error: delErr } = await supabase.from("opportunity_products").delete().eq("opportunity_id", opportunityId);
    if (delErr) {
      showToast("Could not save products. Please try again.", "error");
      setSaving(false);
      return;
    }
    if (cleanLines.length > 0) {
      const { error: insErr } = await supabase.from("opportunity_products").insert(
        cleanLines.map((l) => ({
          opportunity_id: opportunityId,
          product: l.product.trim(),
          quantity: l.quantity.trim() === "" ? null : Number(l.quantity),
          quantity_unit: l.unit || workspaceUnit,
        }))
      );
      if (insErr) {
        showToast("Could not save products. Please try again.", "error");
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    showToast("Products saved.", "success");
    router.refresh();
  }

  // No w-full — these sit in a flex row and size via flex-1 / fixed widths.
  const inputClass = "rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";
  const totalVolume = formatGroupedVolume(
    lines.map((l) => ({ quantity: l.quantity, quantity_unit: l.unit })),
    workspaceUnit
  );

  return (
    <div>
      {ToastUI}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Products &amp; quantities</h2>
        <span className="text-xs font-medium text-slate-500">Total: {totalVolume}</span>
      </div>

      <div className="space-y-2">
        {lines.map((l, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={l.product}
              onChange={(e) => updateLine(i, { product: e.target.value })}
              placeholder="Product, e.g. Black tea"
              className={`${inputClass} min-w-0 flex-1`}
            />
            <input
              value={l.quantity}
              onChange={(e) => updateLine(i, { quantity: e.target.value.replace(/[^\d.]/g, "") })}
              inputMode="decimal"
              placeholder="Qty"
              className={`${inputClass} w-20 shrink-0`}
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

      <div className="mt-3 flex items-center gap-3">
        <button type="button" onClick={addLine} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
          + Add another product
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="ml-auto rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save products"}
        </button>
      </div>
    </div>
  );
}
