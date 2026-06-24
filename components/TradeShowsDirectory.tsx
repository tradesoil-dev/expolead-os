"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ExhibitionLibraryItem } from "@/lib/types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return "Dates TBC";
  const s = new Date(start);
  const e = end ? new Date(end) : s;
  const sMon = MONTHS[s.getUTCMonth()];
  const eMon = MONTHS[e.getUTCMonth()];
  const year = e.getUTCFullYear();
  if (sMon === eMon) {
    return `${sMon} ${s.getUTCDate()}–${e.getUTCDate()}, ${year}`;
  }
  return `${sMon} ${s.getUTCDate()} – ${eMon} ${e.getUTCDate()}, ${year}`;
}

export default function TradeShowsDirectory({ shows }: { shows: ExhibitionLibraryItem[] }) {
  const sectors = useMemo(() => {
    const set = new Set<string>();
    shows.forEach((s) => { if (s.sector) set.add(s.sector); });
    return Array.from(set).sort();
  }, [shows]);

  const [active, setActive] = useState<string>("All");

  const filtered = useMemo(
    () => (active === "All" ? shows : shows.filter((s) => s.sector === active)),
    [shows, active]
  );

  return (
    <div>
      {/* Sector filter chips */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {["All", ...sectors].map((sector) => (
          <button
            key={sector}
            onClick={() => setActive(sector)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              active === sector
                ? "bg-emerald-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            {sector}
          </button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <p className="text-center text-sm text-slate-400">No exhibitions in this category yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-500">{formatDateRange(s.start_date, s.end_date)}</p>
              <p className="mt-1.5 text-lg font-bold text-slate-900">{s.name}</p>
              <p className="mt-0.5 text-sm text-slate-500">{s.location ?? "—"}</p>
              <div className="mt-4 flex items-center justify-between">
                {s.sector && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">{s.sector}</span>
                )}
                <Link href="/login?mode=signup" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                  Track this →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-10 rounded-2xl bg-slate-900 px-8 py-8 text-center">
        <p className="text-lg font-black text-white">Attending one of these?</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">
          Track every lead, sample and follow-up in one place. Free for 14 days, no credit card required.
        </p>
        <Link
          href="/login?mode=signup"
          className="mt-5 inline-block rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
        >
          Start free trial →
        </Link>
      </div>
    </div>
  );
}
