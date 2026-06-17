"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
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
      <select
        value={status}
        onChange={(e) => update(e.target.value as FollowUpStatus)}
        className="rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-brand-500"
      >
        {FOLLOW_UP_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      {saving && <span className="text-xs text-ink-400">saving…</span>}
    </div>
  );
}
