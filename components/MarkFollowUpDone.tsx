"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/useToast";

// Marks a follow-up as handled, removing it from the due list.
// Opportunity: sets next_follow_up_completed = true.
// Connection: clears follow_up_date (no next follow-up scheduled).
export default function MarkFollowUpDone({
  kind,
  id,
}: {
  kind: "Connection" | "Opportunity";
  id: string;
}) {
  const router = useRouter();
  const { showToast, ToastUI } = useToast();
  const [saving, setSaving] = useState(false);

  async function markDone() {
    setSaving(true);
    const supabase = createClient();
    const { error } =
      kind === "Opportunity"
        ? await supabase.from("opportunities").update({ next_follow_up_completed: true }).eq("id", id)
        : await supabase.from("suppliers").update({ follow_up_date: null }).eq("id", id);
    setSaving(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    showToast("Follow-up marked done.", "success");
    window.dispatchEvent(new Event("expolead:followups-changed"));
    router.refresh();
  }

  return (
    <>
      {ToastUI}
      <button
        type="button"
        onClick={markDone}
        disabled={saving}
        className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-60"
        title="Mark this follow-up as done"
      >
        {saving ? "…" : "Mark done"}
      </button>
    </>
  );
}
