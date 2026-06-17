"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Exhibition, Supplier } from "@/lib/types";

export default function ExhibitionsSearch({
  exhibitions,
  suppliers,
}: {
  exhibitions: Exhibition[];
  suppliers: Supplier[];
}) {
  const [query, setQuery] = useState("");

  const statsFor = (exId: string | null) => {
    const related = suppliers.filter((s) => s.exhibition_id === exId);
    const visited = related.filter((s) => s.visited).length;
    const remaining = related.filter((s) => !s.visited).length;

    return {
      total: related.length,
      visited,
      remaining,
    };
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return exhibitions;

    return exhibitions.filter((ex) => {
      const name = ex.name?.toLowerCase() ?? "";
      const location = ex.location?.toLowerCase() ?? "";
      return name.includes(q) || location.includes(q);
    });
  }, [exhibitions, query]);

  if (exhibitions.length === 0) {
    return <p className="text-sm text-ink-400">No exhibitions yet. Add one to organize suppliers by show.</p>;
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search exhibitions by name or location…"
        className="w-full max-w-md rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-ink-400">No exhibitions match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ex) => (
            <Link
              key={ex.id}
              href={`/exhibitions/${ex.id}`}
              className="block rounded-2xl border border-ink-200 bg-white p-5 shadow-card hover:border-emerald-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-ink-900">
                  {ex.name}
                </h3>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                  Upcoming
                </span>
              </div>
              <p className="text-sm text-ink-500 mt-0.5">{ex.location ?? "—"}</p>
              <p className="text-xs text-ink-400 mt-2">
                {ex.start_date ?? "?"} → {ex.end_date ?? "?"}
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-ink-100 bg-ink-50 p-3">
                  <p className="text-lg font-semibold text-emerald-600">{statsFor(ex.id).total}</p>
                  <p className="text-[11px] text-ink-400">Suppliers</p>
                </div>

                <div className="rounded-xl border border-ink-100 bg-ink-50 p-3">
                  <p className="text-lg font-semibold text-emerald-600">{statsFor(ex.id).visited}</p>
                  <p className="text-[11px] text-ink-400">Visited</p>
                </div>

                <div className="rounded-xl border border-ink-100 bg-ink-50 p-3">
                  <p className="text-lg font-semibold text-emerald-600">{statsFor(ex.id).remaining}</p>
                  <p className="text-[11px] text-ink-400">Remaining</p>
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <span className="text-sm font-medium text-emerald-600">
                  View exhibition →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
