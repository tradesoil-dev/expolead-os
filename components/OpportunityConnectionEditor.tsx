"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import Select from "@/components/Select";

// Link/relink an opportunity to a connection from the detail page, so existing
// opportunities (created before linking existed) can be tied in for reports.
export default function OpportunityConnectionEditor({
  opportunityId,
  current,
  connections,
}: {
  opportunityId: string;
  current: string | null;
  connections: { id: string; company_name: string; exhibition_name: string | null }[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(current ?? "");
  const [saving, setSaving] = useState(false);

  async function update(next: string) {
    setValue(next);
    if (!isSupabaseConfigured) return;
    setSaving(true);
    await createClient().from("opportunities").update({ supplier_id: next || null }).eq("id", opportunityId);
    setSaving(false);
    router.refresh();
  }

  return (
    <div>
      <Select
        value={value}
        onChange={update}
        size="sm"
        options={[
          { value: "", label: "Not linked" },
          ...connections.map((c) => ({ value: c.id, label: c.exhibition_name ? `${c.company_name} · ${c.exhibition_name}` : c.company_name })),
        ]}
      />
      {value && (
        <Link href={`/connections/${value}`} className="mt-1.5 inline-block text-xs font-medium text-emerald-600 hover:underline">
          View connection →
        </Link>
      )}
      {saving && <span className="ml-2 text-xs text-ink-400">saving…</span>}
    </div>
  );
}
