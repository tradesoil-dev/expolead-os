"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ExhibitionLibraryItem } from "@/lib/types";

export default function AddExhibitionForm({
  isLocked,
  library = [],
}: {
  isLocked?: boolean;
  library?: ExhibitionLibraryItem[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState(false);
  const [f, setF] = useState({ name: "", location: "", start_date: "", end_date: "" });

  function set<K extends keyof typeof f>(k: K, v: string) {
    setF((p) => ({ ...p, [k]: v }));
  }

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return library
      .filter(
        (ex) =>
          ex.name.toLowerCase().includes(q) ||
          (ex.location ?? "").toLowerCase().includes(q) ||
          (ex.sector ?? "").toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [query, library]);

  function pick(ex: ExhibitionLibraryItem) {
    setF({
      name: ex.name,
      location: ex.location ?? "",
      start_date: ex.start_date ?? "",
      end_date: ex.end_date ?? "",
    });
    setQuery("");
    setPicked(true);
  }

  function reset() {
    setF({ name: "", location: "", start_date: "", end_date: "" });
    setQuery("");
    setPicked(false);
    setError(null);
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
    reset();
    setOpen(false);
    router.refresh();
  }

  const inp = "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

  if (isLocked) {
    return (
      <a href="/pricing" className="inline-flex items-center gap-1.5 rounded-lg bg-ink-100 px-3.5 py-2 text-sm font-medium text-ink-400" title="Your trial has ended — upgrade to continue">
        🔒 New exhibition
      </a>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-lg bg-emerald-600 hover:bg-emerald-700 shadow-sm px-3.5 py-2 text-sm font-medium text-white">
        + New exhibition
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card space-y-3 max-w-xl">
      {error && <p className="text-sm text-rose-700">{error}</p>}

      {/* Library search — pick a known show to pre-fill the form */}
      {library.length > 0 && (
        <div className="relative">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-400">
            Search the exhibition library
          </label>
          <input
            className={inp}
            placeholder="Type a show name, city or sector (e.g. SIAL, Dubai, Food)…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPicked(false); }}
          />
          {matches.length > 0 && (
            <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-ink-200 bg-white shadow-lg">
              {matches.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => pick(ex)}
                  className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left hover:bg-ink-50 transition-colors"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink-900 truncate">{ex.name}</span>
                    <span className="block text-xs text-ink-500 truncate">
                      {ex.location ?? "—"}
                      {ex.start_date ? ` · ${ex.start_date} → ${ex.end_date ?? "?"}` : ""}
                    </span>
                  </span>
                  {ex.sector && (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      {ex.sector}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          <p className="mt-1 text-xs text-ink-400">
            Not listed? Just fill the fields below manually.
          </p>
        </div>
      )}

      {picked && (
        <p className="text-xs text-emerald-700">
          Pre-filled from the library — edit anything below, then save.{" "}
          <button onClick={reset} className="underline hover:text-emerald-800">Clear</button>
        </p>
      )}

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
        <button onClick={() => { reset(); setOpen(false); }} className="text-sm text-ink-500 hover:text-ink-900">Cancel</button>
      </div>
    </div>
  );
}
