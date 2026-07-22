"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Inline editor for what a show cost. Until this existed there was no way to
 * edit an exhibition at all, so shows created before the ROI layer could never
 * get a cost and their return could never be worked out.
 */
export default function ExhibitionCostEditor({
  exhibitionId,
  current,
  currency,
}: {
  exhibitionId: string;
  current: number | null;
  currency: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(current === null || current === undefined ? "" : String(current));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    const original = current === null || current === undefined ? "" : String(current);
    if (value === original) return;
    setSaving(true);
    setError(null);
    // Empty means "not recorded", which must be null rather than 0 so the
    // return is hidden instead of being divided by zero.
    const payload = value.trim() === "" ? null : Number(value);
    const { error } = await createClient()
      .from("exhibitions")
      .update({ cost: payload })
      .eq("id", exhibitionId);
    setSaving(false);
    if (error) {
      setValue(original);
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="rounded-xl border-2 border-slate-300 bg-white p-4 text-center">
      <div className="flex items-center justify-center gap-1">
        <span className="text-sm font-semibold text-ink-400">{currency}</span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^\d.]/g, ""))}
          onBlur={save}
          disabled={saving}
          inputMode="decimal"
          placeholder="0"
          aria-label={`Cost of attending in ${currency}`}
          className="w-24 border-0 border-b border-dashed border-ink-300 bg-transparent p-0 text-center text-2xl font-bold text-ink-900 outline-none focus:border-emerald-500 disabled:opacity-50"
        />
      </div>
      <p className="mt-1 text-sm text-ink-500">Cost of attending</p>
      {error ? (
        <p className="mt-1 text-[11px] text-rose-600">{error}</p>
      ) : (
        <p className="mt-1 text-[11px] text-ink-400">Optional. Stand, travel, staff, samples.</p>
      )}
    </div>
  );
}
