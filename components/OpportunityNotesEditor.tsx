"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/useToast";

export default function OpportunityNotesEditor({
  opportunityId,
  initialNotes,
}: {
  opportunityId: string;
  initialNotes: string | null;
}) {
  const router = useRouter();
  const { showToast, ToastUI } = useToast();
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saving, setSaving] = useState(false);

  async function saveNotes() {
    setSaving(true);

    const supabase = createClient();

    const { error } = await supabase
      .from("opportunities")
      .update({ notes })
      .eq("id", opportunityId);

    setSaving(false);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    setEditing(false);
    showToast("Notes saved.", "success");
    router.refresh();
  }

  if (editing) {
    return (
      <div className="space-y-3">
        {ToastUI}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-32 w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-emerald-400"
        />

        <div className="flex gap-2">
          <button
            onClick={saveNotes}
            disabled={saving}
            className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          <button
            onClick={() => {
              setNotes(initialNotes ?? "");
              setEditing(false);
            }}
            className="rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {ToastUI}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Discussion Notes</h2>

        <button
          onClick={() => setEditing(true)}
          className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
        >
          Edit
        </button>
      </div>

      <p className="text-sm">{initialNotes || "No notes added yet."}</p>
    </div>
  );
}