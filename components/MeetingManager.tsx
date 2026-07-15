"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/useToast";
import DatePicker from "@/components/DatePicker";
import Select from "@/components/Select";
import type { Exhibition, Meeting } from "@/lib/types";

export default function MeetingManager({
  meeting,
  exhibitions,
}: {
  meeting: Meeting;
  exhibitions: Exhibition[];
}) {
  const router = useRouter();
  const { showToast, ToastUI } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    met_on: meeting.met_on,
    exhibition_id: meeting.exhibition_id ?? "",
    notes: meeting.notes ?? "",
  });

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function save() {
    setSaving(true);
    const { error } = await createClient()
      .from("meetings")
      .update({ met_on: form.met_on, exhibition_id: form.exhibition_id || null, notes: form.notes || null })
      .eq("id", meeting.id);
    setSaving(false);
    if (error) { showToast(error.message, "error"); return; }
    setEditing(false);
    showToast("Meeting updated.", "success");
    router.refresh();
  }

  async function remove() {
    if (!window.confirm("Delete this meeting?")) return;
    const { error } = await createClient().from("meetings").delete().eq("id", meeting.id);
    if (error) { showToast(error.message, "error"); return; }
    showToast("Meeting deleted.", "success");
    router.refresh();
  }

  if (editing) {
    return (
      <li className="rounded-xl border border-ink-200 bg-ink-50/40 p-3 space-y-2">
        {ToastUI}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="mb-1 block text-xs font-medium text-ink-500">Date</span>
            <DatePicker value={form.met_on} onChange={(v) => set("met_on", v)} />
          </div>
          <div>
            <span className="mb-1 block text-xs font-medium text-ink-500">Exhibition</span>
            <Select
              value={form.exhibition_id}
              onChange={(v) => set("exhibition_id", v)}
              size="sm"
              options={[{ value: "", label: "— None —" }, ...exhibitions.map((ex) => ({ value: ex.id, label: ex.name }))]}
            />
          </div>
        </div>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          placeholder="What was discussed?"
          className="w-full resize-y rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400"
        />
        <div className="flex items-center gap-2">
          <button onClick={save} disabled={saving} className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
          <button onClick={() => setEditing(false)} className="rounded-full border border-ink-200 px-4 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-50">Cancel</button>
        </div>
      </li>
    );
  }

  return (
    <li className="rounded-xl border border-ink-100 p-3">
      {ToastUI}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
          </span>
          <span className="text-sm font-semibold text-ink-900">{meeting.met_on}</span>
          {meeting.exhibition?.name && <span className="text-xs text-ink-500">· {meeting.exhibition.name}</span>}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <button onClick={() => setEditing(true)} className="font-medium text-brand-600 hover:text-brand-700">Edit</button>
          <button onClick={remove} className="font-medium text-rose-600 hover:text-rose-700">Delete</button>
        </div>
      </div>
      {meeting.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-ink-700">{meeting.notes}</p>}
    </li>
  );
}
