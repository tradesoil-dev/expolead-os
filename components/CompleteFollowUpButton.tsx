"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/useToast";

export default function CompleteFollowUpButton({
  opportunityId,
}: {
  opportunityId: string;
}) {
  const router = useRouter();
  const { showToast, ToastUI } = useToast();
  const [saving, setSaving] = useState(false);

  async function markCompleted() {
    setSaving(true);

    const supabase = createClient();

    const { error } = await supabase
      .from("opportunities")
      .update({
        next_follow_up_completed: true,
      })
      .eq("id", opportunityId);

    setSaving(false);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    showToast("Follow-up marked as completed.", "success");
    window.dispatchEvent(new Event("expolead:followups-changed"));
    router.refresh();
  }

  return (
    <>
      {ToastUI}
      <button
        type="button"
        onClick={markCompleted}
        disabled={saving}
        className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Mark Completed"}
      </button>
    </>
  );
}