"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return shows.filter((s) => {
      if (active !== "All" && s.sector !== active) return false;
      if (q) {
        const hay = `${s.name} ${s.location ?? ""} ${s.sector ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [shows, active, query]);

  // Pagination — 10 shows per page. Reset to page 1 when the filter changes.
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [active, query]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6 max-w-xl">
        <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by show, city or venue…"
          className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      {/* Sector filter pills — mono uppercase, ALL active dark */}
      <div className="mb-8 flex flex-wrap gap-2.5">
        {["All", ...sectors].map((sector) => {
          const on = active === sector;
          return (
            <button
              key={sector}
              onClick={() => setActive(sector)}
              className={`rounded-full px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                on
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 bg-transparent text-slate-500 hover:border-slate-400 hover:text-slate-800"
              }`}
            >
              {sector}
            </button>
          );
        })}
      </div>

      {/* List rows */}
      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-slate-400">No exhibitions match your search.</p>
      ) : (
        <>
          {/* Column headings (desktop) */}
          <div className="hidden px-4 pb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 md:grid md:grid-cols-[200px_1fr_auto_auto] md:gap-8">
            <span>Date</span>
            <span>Exhibition</span>
            <span className="md:text-right">Sector</span>
            <span />
          </div>

          <div className="border-t border-slate-200">
            {paged.map((s) => (
              <div
                key={s.id}
                className="grid grid-cols-1 items-center gap-2 border-b border-slate-200 px-4 py-6 transition-colors hover:bg-white md:grid-cols-[200px_1fr_auto_auto] md:gap-8"
              >
                <p className="font-mono text-xs uppercase tracking-wide text-slate-500">{formatDateRange(s.start_date, s.end_date)}</p>
                <div>
                  <p className="text-lg font-bold text-slate-900">{s.name}</p>
                  {s.location && <p className="mt-0.5 text-sm text-slate-500">{s.location}</p>}
                </div>
                {s.sector ? (
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-emerald-600 md:text-right">{s.sector}</span>
                ) : (
                  <span className="md:text-right" />
                )}
                <Link
                  href="/login?mode=signup"
                  className="justify-self-start whitespace-nowrap border-b border-slate-900 pb-0.5 text-sm font-semibold text-slate-900 transition-colors hover:border-emerald-600 hover:text-emerald-700 md:justify-self-end"
                >
                  Track this →
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-400">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  ← Prev
                </button>
                <span className="font-mono text-xs tabular-nums text-slate-500">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Dark CTA band */}
      <div className="mt-16 flex flex-col gap-6 rounded-2xl bg-slate-950 px-8 py-10 md:flex-row md:items-center md:justify-between lg:px-12">
        <div>
          <p className="text-2xl font-bold tracking-tight text-white">Attending one of these?</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
            Track every lead, sample and follow-up in one place. Free for 14 days, no credit card required.
          </p>
        </div>
        <Link
          href="/login?mode=signup"
          className="shrink-0 self-start rounded-xl bg-emerald-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 md:self-auto"
        >
          Start free trial →
        </Link>
      </div>
    </div>
  );
}
