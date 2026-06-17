"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function AddExhibitionForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({ name: "", location: "", start_date: "", end_date: "" });

  function set<K extends keyof typeof f>(k: K, v: string) {
    setF((p) => ({ ...p, [k]: v }));
  }

  async function save() {
    setError(null);
    if (!isSupabaseConfigured) {
      setError("Connect Supabase to save exhibitions.");
      return;
    }
    if (!f.name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    const { error } = await createClient().from("exhibitions").insert({
      name: f.name.trim(),
      location: f.location || null,
      start_date: f.start_date || null,
      end_date: f.end_date || null,
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setF({ name: "", location: "", start_date: "", end_date: "" });
    setOpen(false);
    router.refresh();
  }

  const inp = "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-lg bg-emerald-600 hover:bg-emerald-700 shadow-sm px-3.5 py-2 text-sm font-medium text-white hover:bg-ink-700">
        + New exhibition
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card space-y-3 max-w-xl">
      {error && <p className="text-sm text-rose-700">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className={`${inp} sm:col-span-2`} placeholder="Exhibition name (e.g. CHINACOAT 2026)" value={f.name} onChange={(e) => set("name", e.target.value)} />
        <input className={`${inp} sm:col-span-2`} placeholder="Location (e.g. Shanghai, China)" value={f.location} onChange={(e) => set("location", e.target.value)} />
        <label className="text-sm text-ink-500">Start<input type="date" className={inp} value={f.start_date} onChange={(e) => set("start_date", e.target.value)} /></label>
        <label className="text-sm text-ink-500">End<input type="date" className={inp} value={f.end_date} onChange={(e) => set("end_date", e.target.value)} /></label>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={save} disabled={saving} className="rounded-lg bg-ink-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-ink-700 disabled:opacity-60">
          {saving ? "Saving…" : "Save exhibition"}
        </button>
        <button onClick={() => setOpen(false)} className="text-sm text-ink-500 hover:text-ink-900">Cancel</button>
      </div>
    </div>
  );
}
