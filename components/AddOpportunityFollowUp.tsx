"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AddOpportunityFollowUp({
  opportunityId,
}: {
  opportunityId: string;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveFollowUp() {
    if (!note.trim()) return;

    setSaving(true);

    const supabase = createClient();

    const { error } = await supabase.from("opportunity_followups").insert({
      opportunity_id: opportunityId,
      note: note.trim(),
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setNote("");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add follow-up note..."
        className="min-h-24 w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-emerald-400"
      />

      <button
        onClick={saveFollowUp}
        disabled={saving}
        className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {saving ? "Saving..." : "+ Add Follow-up"}
      </button>
    </div>
  );
}