"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { saveErrorMessage } from "@/lib/errors";
import type { ExhibitionLibraryItem } from "@/lib/types";
import DatePicker from "@/components/DatePicker";

export default function AddExhibitionForm({
  isLocked,
  library = [],
  currency = "USD",
}: {
  isLocked?: boolean;
  library?: ExhibitionLibraryItem[];
  currency?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [picked, setPicked] = useState(false);
  const [f, setF] = useState({
    name: "",
    location: "",
    start_date: "",
    end_date: "",
    cost: "",
    attending_as: "visiting",
    own_hall: "",
    own_booth_number: "",
    own_stand_location: "",
  });

  function set<K extends keyof typeof f>(k: K, v: string) {
    setF((p) => ({ ...p, [k]: v }));
  }

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    // With no search typed, show the library up front so a new user can see
    // the admin-curated shows exist without having to guess a search term.
    // Soonest upcoming first.
    if (!q) {
      return [...library]
        .sort((a, b) => (a.start_date ?? "9999").localeCompare(b.start_date ?? "9999"))
        .slice(0, 6);
    }
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
    setF((prev) => ({
      ...prev,
      name: ex.name,
      location: ex.location ?? "",
      start_date: ex.start_date ?? "",
      end_date: ex.end_date ?? "",
    }));
    setQuery("");
    setPicked(true);
  }

  function reset() {
    setF({ name: "", location: "", start_date: "", end_date: "", cost: "", attending_as: "visiting", own_hall: "", own_booth_number: "", own_stand_location: "" });
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
    const exhibiting = f.attending_as === "exhibiting";
    const { error } = await createClient().from("exhibitions").insert({
      name: f.name.trim(),
      location: f.location || null,
      start_date: f.start_date || null,
      end_date: f.end_date || null,
      cost: f.cost.trim() === "" ? null : Number(f.cost),
      attending_as: f.attending_as,
      own_hall: exhibiting ? f.own_hall || null : null,
      own_booth_number: exhibiting ? f.own_booth_number || null : null,
      own_stand_location: exhibiting ? f.own_stand_location || null : null,
    });
    setSaving(false);
    if (error) {
      setError(saveErrorMessage(error, "exhibition", "Could not save exhibition."));
      return;
    }
    reset();
    setOpen(false);
    router.refresh();
  }

  const inp = "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

  if (isLocked) {
    return (
      <a href="/upgrade" className="inline-flex items-center gap-1.5 rounded-lg bg-ink-100 px-3.5 py-2 text-sm font-medium text-ink-400" title="Your trial has ended, upgrade to continue">
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
    <div className="space-y-3">
      <button
        onClick={() => { reset(); setOpen(false); }}
        className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
      >
        ← Back to exhibitions
      </button>
      <div className="flex flex-col lg:flex-row gap-4 items-start">
    <div className="w-full max-w-xl rounded-xl border border-ink-200 bg-white p-5 shadow-card space-y-3">
      {error && <p className="text-sm text-rose-700">{error}</p>}

      {/* Library search — pick a known show to pre-fill the form */}
      {library.length > 0 && (
        <div className="relative">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-400">
            Search the exhibition library
          </label>
          <input
            className={inp}
            placeholder="Search or pick from the list, e.g. SIAL, Dubai, Food…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPicked(false); }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
          />
          {searchFocused && matches.length > 0 && (
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
            Click the box to see available shows, or type to search. Not listed? Just fill the fields below manually.
          </p>
        </div>
      )}

      {picked && (
        <p className="text-xs text-emerald-700">
          Pre-filled from the library. Edit anything below, then save.{" "}
          <button onClick={reset} className="underline hover:text-emerald-800">Clear</button>
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className={`${inp} sm:col-span-2`} placeholder="Exhibition name (e.g. CHINACOAT 2026)" value={f.name} onChange={(e) => set("name", e.target.value)} />
        <input className={`${inp} sm:col-span-2`} placeholder="Location (e.g. Shanghai, China)" value={f.location} onChange={(e) => set("location", e.target.value)} />
        <input
          className={`${inp} sm:col-span-2`}
          placeholder={`Total cost of attending in ${currency}, optional`}
          title="Stand, travel, staff, samples and shipping. Used to work out this show's return."
          inputMode="decimal"
          value={f.cost}
          onChange={(e) => set("cost", e.target.value.replace(/[^\d.]/g, ""))}
        />
        <div className="text-sm text-ink-500">
          <span className="mb-1 block font-medium">Start</span>
          <DatePicker value={f.start_date} onChange={(v) => set("start_date", v)} />
        </div>
        <div className="text-sm text-ink-500">
          <span className="mb-1 block font-medium">End</span>
          <DatePicker value={f.end_date} onChange={(v) => set("end_date", v)} />
        </div>
      </div>

      {/* Attending posture — drives how connections capture booth details */}
      <div className="space-y-2 border-t border-ink-100 pt-3">
        <span className="block text-xs font-semibold uppercase tracking-wide text-ink-400">How are you attending?</span>
        <div className="grid grid-cols-2 gap-2">
          {([
            { value: "visiting", label: "Visiting", hint: "Walking the floor, meeting suppliers" },
            { value: "exhibiting", label: "Exhibiting", hint: "You have your own stand" },
          ] as const).map((o) => {
            const active = f.attending_as === o.value;
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

        {f.attending_as === "exhibiting" && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input className={inp} placeholder="Your hall, e.g. Hall 3" value={f.own_hall} onChange={(e) => set("own_hall", e.target.value)} />
            <input className={inp} placeholder="Your booth, e.g. H3-121" value={f.own_booth_number} onChange={(e) => set("own_booth_number", e.target.value)} />
            <input className={inp} placeholder="Stand area, optional" value={f.own_stand_location} onChange={(e) => set("own_stand_location", e.target.value)} />
          </div>
        )}
        <p className="text-xs text-ink-400">
          {f.attending_as === "exhibiting"
            ? "You set your stand once here. Buyers you capture at this show are logged as meeting you at your stand."
            : "Connections you capture will record the supplier's own hall, booth and stand."}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={save} disabled={saving} className="rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60">
          {saving ? "Saving…" : "Save exhibition"}
        </button>
        <button onClick={() => { reset(); setOpen(false); }} className="text-sm text-ink-500 hover:text-ink-900">Cancel</button>
      </div>
    </div>

    {/* Guide note — coaches first-time users */}
    <div className="w-full max-w-md rounded-xl border border-emerald-100 bg-emerald-50 p-5">
      <p className="text-sm font-bold text-emerald-900 mb-3">New here? Start with your shows</p>
      <div className="space-y-2.5">
        <div className="flex gap-2.5 items-start">
          <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">1</span>
          <p className="text-xs leading-relaxed text-emerald-800">Search the library for an exhibition you attend (e.g. SIAL, CHINACOAT), it fills in the details for you.</p>
        </div>
        <div className="flex gap-2.5 items-start">
          <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">2</span>
          <p className="text-xs leading-relaxed text-emerald-800">Not listed? Type the name, location and dates manually.</p>
        </div>
        <div className="flex gap-2.5 items-start">
          <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">3</span>
          <p className="text-xs leading-relaxed text-emerald-800">Add the total cost of attending if you know it. Optional, and it lets Reports show what each show returned against what it cost.</p>
        </div>
        <div className="flex gap-2.5 items-start">
          <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">4</span>
          <p className="text-xs leading-relaxed text-emerald-800">Save it, then add your connections and opportunities under that show.</p>
        </div>
      </div>
    </div>
    </div>
    </div>
  );
}
