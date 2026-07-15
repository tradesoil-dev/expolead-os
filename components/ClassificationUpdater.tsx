"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import Select from "@/components/Select";
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
      <div className="min-w-[160px]">
        <Select
          value={value}
          onChange={(v) => update(v as InterestType)}
          size="sm"
          options={INTEREST_TYPES.map((c) => ({ value: c.value, label: c.label }))}
        />
      </div>
      {saving && <span className="text-xs text-ink-400">saving…</span>}
    </div>
  );
}
