"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { saveErrorMessage } from "@/lib/errors";
import type { AttendingAs } from "@/lib/types";

type Props = {
  exhibitionId: string;
  current: {
    attending_as: AttendingAs;
    own_hall: string | null;
    own_booth_number: string | null;
    own_stand_location: string | null;
  };
  // Fired the moment the mode changes, so a sibling (the prep checklist) can
  // react before Save is pressed.
  onAttendingChange?: (value: AttendingAs) => void;
};

export default function ExhibitionRoleEditor({ exhibitionId, current, onAttendingChange }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState(false);

  const [form, setForm] = useState({
    attending_as: current.attending_as ?? "visiting",
    own_hall: current.own_hall ?? "",
    own_booth_number: current.own_booth_number ?? "",
    own_stand_location: current.own_stand_location ?? "",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSavedNote(false);
    if (key === "attending_as") onAttendingChange?.(value as AttendingAs);
  }

  async function save() {
    setError(null);
    if (!isSupabaseConfigured) {
      setError("Supabase is not connected yet.");
      return;
    }
    setSaving(true);
    const exhibiting = form.attending_as === "exhibiting";
    const { error } = await createClient()
      .from("exhibitions")
      .update({
        attending_as: form.attending_as,
        own_hall: exhibiting ? form.own_hall || null : null,
        own_booth_number: exhibiting ? form.own_booth_number || null : null,
        own_stand_location: exhibiting ? form.own_stand_location || null : null,
      })
      .eq("id", exhibitionId);
    setSaving(false);
    if (error) {
      setError(saveErrorMessage(error, "exhibition", "Could not save."));
      return;
    }
    setSavedNote(true);
    router.refresh();
  }

  const inp =
    "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">How you&rsquo;re attending</h2>
        {savedNote && <span className="text-xs font-medium text-emerald-600">Saved</span>}
      </div>

      {error && <p className="mb-3 text-sm text-rose-700">{error}</p>}

      <div className="grid grid-cols-2 gap-2">
        {([
          { value: "visiting", label: "Visiting", hint: "Walking the floor, meeting suppliers" },
          { value: "exhibiting", label: "Exhibiting", hint: "You have your own stand" },
        ] as const).map((o) => {
          const active = form.attending_as === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => set("attending_as", o.value)}
              className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${active ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200" : "border-ink-200 bg-white hover:border-ink-300"}`}
            >
              <span className={`block text-sm font-semibold ${active ? "text-emerald-800" : "text-ink-800"}`}>{o.label}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-ink-500">{o.hint}</span>
            </button>
          );
        })}
      </div>

      {form.attending_as === "exhibiting" && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <input className={inp} placeholder="Your hall, e.g. Hall 3" value={form.own_hall} onChange={(e) => set("own_hall", e.target.value)} />
          <input className={inp} placeholder="Your booth, e.g. H3-121" value={form.own_booth_number} onChange={(e) => set("own_booth_number", e.target.value)} />
          <input className={inp} placeholder="Stand area, optional" value={form.own_stand_location} onChange={(e) => set("own_stand_location", e.target.value)} />
        </div>
      )}

      <p className="mt-3 text-xs text-ink-400">
        {form.attending_as === "exhibiting"
          ? "Buyers you capture at this show are logged as meeting you at your stand, so connections don't ask for their booth."
          : "Connections you capture will record the supplier's own hall, booth and stand."}
      </p>

      <button
        onClick={save}
        disabled={saving}
        className="mt-4 rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-700 transition-colors disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
