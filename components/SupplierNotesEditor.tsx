"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/useToast";
import EditButton from "@/components/EditButton";

export default function SupplierNotesEditor({
  supplierId,
  initialNotes,
}: {
  supplierId: string;
  initialNotes: string | null;
}) {
  const router = useRouter();
  const { showToast, ToastUI } = useToast();
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { error } = await createClient().from("suppliers").update({ notes }).eq("id", supplierId);
    setSaving(false);
    if (error) { showToast(error.message, "error"); return; }
    setEditing(false);
    showToast("Notes saved.", "success");
    router.refresh();
  }

  return (
    <div>
      {ToastUI}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Notes</h2>
        {!editing && <EditButton onClick={() => setEditing(true)} />}
      </div>

      {editing ? (
        <div className="space-y-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="What did you discuss? Products, pricing, next steps…"
            className="w-full resize-y rounded-xl border border-ink-200 p-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => { setNotes(initialNotes ?? ""); setEditing(false); }}
              className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-sm text-ink-700">
          {initialNotes?.trim() ? initialNotes : <span className="text-ink-400">No notes yet.</span>}
        </p>
      )}
    </div>
  );
}
