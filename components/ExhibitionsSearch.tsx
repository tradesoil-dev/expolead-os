"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Exhibition, Supplier } from "@/lib/types";

function relativeLabel(diffDays: number): string {
  const d = Math.abs(diffDays);
  if (d === 0) return "today";
  if (d < 30) return `${d} day${d === 1 ? "" : "s"}`;
  const months = Math.round(d / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"}`;
  const years = Math.round(months / 12);
  return `${years} year${years === 1 ? "" : "s"}`;
}

function exhibitionStatus(startDate: string | null, endDate: string | null) {
  if (!startDate) {
    return { label: "Upcoming", badge: "bg-emerald-100 text-emerald-700", hint: "", live: false, dim: false };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  const end = new Date(endDate ?? startDate);
  end.setHours(23, 59, 59, 999);

  if (today < start) {
    const days = Math.ceil((start.getTime() - today.getTime()) / 86400000);
    return { label: "Upcoming", badge: "bg-emerald-100 text-emerald-700", hint: `in ${relativeLabel(days)}`, live: false, dim: false };
  }
  if (today >= start && today <= end) {
    return { label: "Live now", badge: "bg-amber-100 text-amber-700", hint: "Happening now", live: true, dim: false };
  }
  const days = Math.floor((today.getTime() - end.getTime()) / 86400000);
  return { label: "Completed", badge: "bg-ink-100 text-ink-500", hint: `${relativeLabel(days)} ago`, live: false, dim: true };
}

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
    return <p className="text-sm text-ink-400">No exhibitions yet. Add one to organize connections by show.</p>;
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
          {filtered.map((ex) => {
            const status = exhibitionStatus(ex.start_date, ex.end_date);
            return (
            <Link
              key={ex.id}
              href={`/exhibitions/${ex.id}`}
              className={`block rounded-2xl border border-ink-200 bg-white p-5 shadow-card hover:border-emerald-200 hover:shadow-lg transition-all ${status.dim ? "opacity-80" : ""}`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xl font-semibold text-ink-900">
                  {ex.name}
                </h3>

                <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.badge}`}>
                  {status.live && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                  {status.label}
                </span>
              </div>
              <p className="text-sm text-ink-500 mt-0.5">{ex.location ?? "—"}</p>
              <p className="text-xs text-ink-400 mt-2">
                {ex.start_date ?? "?"} → {ex.end_date ?? "?"}
                {status.hint && <span className="ml-2 font-semibold text-ink-500">· {status.hint}</span>}
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-ink-100 bg-ink-50 p-3">
                  <p className="text-lg font-semibold text-emerald-600">{statsFor(ex.id).total}</p>
                  <p className="text-[11px] text-ink-400">Connections</p>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
