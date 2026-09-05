"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/useToast";
import EditButton from "@/components/EditButton";
import RichNotes from "@/components/RichNotes";

// One editor for either the Notes or the Summary field on a connection. View
// mode renders with RichNotes (bold dated headers, bullets); edit mode is a
// plain textarea that writes back to the chosen column.
export default function SupplierNotesEditor({
  supplierId,
  initial,
  field = "notes",
  title = "Notes",
  description,
  placeholder,
}: {
  supplierId: string;
  initial: string | null;
  field?: "notes" | "summary";
  title?: string;
  description?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const { showToast, ToastUI } = useToast();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initial ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { error } = await createClient().from("suppliers").update({ [field]: value }).eq("id", supplierId);
    setSaving(false);
    if (error) { showToast(error.message, "error"); return; }
    setEditing(false);
    showToast(`${title} saved.`, "success");
    router.refresh();
  }

  return (
    <div>
      {ToastUI}
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        {!editing && <EditButton onClick={() => setEditing(true)} />}
      </div>
      {description && <p className="mb-3 text-xs text-ink-400">{description}</p>}

      {editing ? (
        <div className="space-y-3">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={5}
            placeholder={placeholder ?? "What did you discuss? Products, pricing, next steps…"}
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
              onClick={() => { setValue(initial ?? ""); setEditing(false); }}
              className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <RichNotes text={initial} empty={`No ${title.toLowerCase()} yet.`} />
      )}
    </div>
  );
}
