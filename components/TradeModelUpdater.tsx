"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { TRADE_MODELS } from "@/lib/types";

// Inline multi-select for a connection's trade models (private label, own brand,
// distribution, etc.). Toggling saves immediately, matching ClassificationUpdater.
export default function TradeModelUpdater({
  supplierId,
  current,
}: {
  supplierId: string;
  current: string[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(current ?? []);
  const [saving, setSaving] = useState(false);

  async function toggle(v: string) {
    const next = selected.includes(v)
      ? selected.filter((x) => x !== v)
      : [...selected, v];
    setSelected(next);
    if (!isSupabaseConfigured) return;
    setSaving(true);
    await createClient().from("suppliers").update({ trade_models: next }).eq("id", supplierId);
    setSaving(false);
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {TRADE_MODELS.map((t) => {
          const on = selected.includes(t.value);
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => toggle(t.value)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${on ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-ink-200 bg-white text-ink-500 hover:border-ink-300"}`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {saving && <span className="mt-1 block text-xs text-ink-400">saving…</span>}
    </div>
  );
}
