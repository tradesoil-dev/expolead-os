"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/useToast";

export default function NextFollowUpForm({
  opportunityId,
  initialDate,
  initialNote,
}: {
  opportunityId: string;
  initialDate?: string | null;
  initialNote?: string | null;
}) {
  const router = useRouter();
  const { showToast, ToastUI } = useToast();

  const [date, setDate] = useState(initialDate || "");
  const [note, setNote] = useState(initialNote || "");
  const [saving, setSaving] = useState(false);

  async function saveReminder() {
    setSaving(true);

    const supabase = createClient();

    const { error } = await supabase
      .from("opportunities")
      .update({
  next_follow_up_date: date || null,
  next_follow_up_note: note || null,
  next_follow_up_completed: false,
})
      .eq("id", opportunityId);

    setSaving(false);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    showToast("Reminder saved.", "success");
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      {ToastUI}
      <h2 className="mb-3 font-semibold">Next Follow-up</h2>

      <div className="grid gap-3 md:grid-cols-[220px_1fr_auto] md:items-center">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Reminder
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Call supplier about pricing..."
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <button
          type="button"
          onClick={saveReminder}
          disabled={saving}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}