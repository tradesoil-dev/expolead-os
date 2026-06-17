"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { INTEREST_TYPES, type InterestType } from "@/lib/types";

export default function ClassificationUpdater({
  supplierId,
  current,
}: {
  supplierId: string;
  current: InterestType;
}) {
  const router = useRouter();
  const [value, setValue] = useState<InterestType>(current);
  const [saving, setSaving] = useState(false);

  async function update(next: InterestType) {
    setValue(next);
    if (!isSupabaseConfigured) return;
    setSaving(true);
    await createClient().from("suppliers").update({ interest_type: next }).eq("id", supplierId);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={(e) => update(e.target.value as InterestType)}
        className="rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-brand-500"
      >
        {INTEREST_TYPES.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>
      {saving && <span className="text-xs text-ink-400">saving…</span>}
    </div>
  );
}
