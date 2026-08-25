"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// Inline edit of a connection's follow-up note straight from the Follow-ups tab.
export default function FollowUpNoteEditor({ supplierId, initial }: { supplierId: string; initial: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!isSupabaseConfigured) { setEditing(false); return; }
    setSaving(true);
    await createClient().from("suppliers").update({ follow_up_note: value.trim() || null }).eq("id", supplierId);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="mt-1 flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          placeholder="What's the next action?"
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") { setEditing(false); setValue(initial); }
          }}
          className="w-full rounded-lg border border-emerald-300 px-2.5 py-1 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        <button type="button" onClick={save} disabled={saving} className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
          {saving ? "…" : "Save"}
        </button>
        <button type="button" onClick={() => { setEditing(false); setValue(initial); }} className="shrink-0 text-xs text-ink-400 hover:text-ink-700">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button type="button" onClick={() => setEditing(true)} className="mt-0.5 block max-w-full truncate text-left text-xs text-slate-500 transition-colors hover:text-emerald-700">
      {value?.trim() ? value : <span className="italic text-slate-400">Add a follow-up note…</span>}
    </button>
  );
}
