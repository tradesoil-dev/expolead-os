"use client";

import { useEffect, useRef, useState } from "react";

export type ConnOption = {
  id: string;
  company_name: string;
  exhibition_name: string | null;
  booth_number: string | null;
  // true when the user visited THEIR booth (buyer case) — booth number applies.
  // false when they came to the user's own stand (supplier case) — no booth.
  visited_their_booth: boolean;
  products: string[];
};

// Type-to-search connection picker. Selecting one drives the opportunity form.
export default function ConnectionPicker({
  connections,
  value,
  onSelect,
}: {
  connections: ConnOption[];
  value: ConnOption | null;
  onSelect: (c: ConnOption | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = (query.trim()
    ? connections.filter((c) => c.company_name.toLowerCase().includes(query.toLowerCase()))
    : connections
  ).slice(0, 8);

  if (value) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-emerald-900">{value.company_name}</p>
          {value.exhibition_name && <p className="truncate text-xs text-emerald-700">{value.exhibition_name}</p>}
        </div>
        <button
          type="button"
          onClick={() => { onSelect(null); setQuery(""); }}
          className="shrink-0 rounded-lg border border-emerald-300 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Start typing a connection name…"
        className="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      />
      {open && (
        <div className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
          {connections.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-400">No connections yet. Capture one on the Connections tab first.</p>
          ) : filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-400">No matching connections.</p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { onSelect(c); setOpen(false); setQuery(""); }}
                className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-50"
              >
                <span className="text-sm font-medium text-slate-800">{c.company_name}</span>
                {(c.exhibition_name || c.products.length > 0) && (
                  <span className="truncate text-xs text-slate-500">
                    {[c.exhibition_name, c.products.slice(0, 3).join(", ")].filter(Boolean).join(" · ")}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
