"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import Select from "@/components/Select";
import DatePicker from "@/components/DatePicker";
import type { Exhibition } from "@/lib/types";

export default function AddMeetingForm({
  supplierId,
  exhibitions,
}: {
  supplierId: string;
  exhibitions: Exhibition[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [m, setM] = useState({ met_on: today, exhibition_id: "", notes: "" });

  function set<K extends keyof typeof m>(k: K, v: string) {
    setM((p) => ({ ...p, [k]: v }));
  }

  async function save() {
    if (!isSupabaseConfigured) return;
    setSaving(true);
    await createClient().from("meetings").insert({
      supplier_id: supplierId,
      met_on: m.met_on || today,
      exhibition_id: m.exhibition_id || null,
      notes: m.notes || null,
    });
    setSaving(false);
    setM({ met_on: today, exhibition_id: "", notes: "" });
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm font-medium text-brand-600 hover:text-brand-700">
        + Log meeting
      </button>
    );
  }

  const inp = "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

  return (
    <div className="rounded-lg border border-ink-200 p-3 space-y-2 w-full">
      <div className="grid grid-cols-2 gap-2">
        <div className="text-xs text-ink-500">
          <span className="mb-1 block">Date</span>
          <DatePicker value={m.met_on} onChange={(v) => set("met_on", v)} />
        </div>
        <div className="text-xs text-ink-500">
          <span className="mb-1 block">Exhibition</span>
          <Select
            value={m.exhibition_id}
            onChange={(v) => set("exhibition_id", v)}
            options={[{ value: "", label: "— None —" }, ...exhibitions.map((ex) => ({ value: ex.id, label: ex.name }))]}
          />
        </div>
      </div>
      <textarea
        className={`${inp} resize-y`}
        rows={3}
        placeholder="What was discussed? Products, pricing, samples, next steps…"
        value={m.notes}
        onChange={(e) => set("notes", e.target.value)}
      />
      <div className="flex items-center gap-2">
        <button onClick={save} disabled={saving} className="rounded-lg bg-ink-900 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-ink-700 disabled:opacity-60">
          {saving ? "Saving…" : "Save meeting"}
        </button>
        <button onClick={() => setOpen(false)} className="text-sm text-ink-500 hover:text-ink-900">Cancel</button>
      </div>
    </div>
  );
}
