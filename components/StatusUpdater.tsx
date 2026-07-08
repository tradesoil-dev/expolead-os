"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import Select from "@/components/Select";
import { FOLLOW_UP_STATUSES, type FollowUpStatus } from "@/lib/types";

export default function StatusUpdater({
  supplierId,
  current,
}: {
  supplierId: string;
  current: FollowUpStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<FollowUpStatus>(current);
  const [saving, setSaving] = useState(false);

  async function update(next: FollowUpStatus) {
    setStatus(next);
    if (!isSupabaseConfigured) return;
    setSaving(true);
    await createClient().from("suppliers").update({ follow_up_status: next }).eq("id", supplierId);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <div className="min-w-[160px]">
        <Select
          value={status}
          onChange={(v) => update(v as FollowUpStatus)}
          className="py-2"
          options={FOLLOW_UP_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
        />
      </div>
      {saving && <span className="text-xs text-ink-400">saving…</span>}
    </div>
  );
}
