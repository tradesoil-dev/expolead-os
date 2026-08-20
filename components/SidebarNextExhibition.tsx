"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Row = { id: string; name: string; location: string | null; start_date: string | null; end_date: string | null };

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
// Parse a YYYY-MM-DD string as a local midnight timestamp.
function dayMs(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).getTime();
}
const DAY = 86400000;
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function pickNext(rows: Row[]): { row: Row; upcomingCount: number } | null {
  const today = startOfToday();
  const relevant = rows
    .filter((r) => r.start_date)
    .filter((r) => (r.end_date ? dayMs(r.end_date) : dayMs(r.start_date!)) >= today)
    .sort((a, b) => dayMs(a.start_date!) - dayMs(b.start_date!));
  return relevant.length ? { row: relevant[0], upcomingCount: relevant.length } : null;
}

function statusLine(row: Row): string {
  const today = startOfToday();
  const start = dayMs(row.start_date!);
  const end = row.end_date ? dayMs(row.end_date) : start;
  if (start <= today && today <= end) {
    const total = Math.round((end - start) / DAY) + 1;
    const day = Math.round((today - start) / DAY) + 1;
    return total > 1 ? `Live now · Day ${day} of ${total}` : "Live now";
  }
  const days = Math.round((start - today) / DAY);
  if (days === 0) return "Starts today";
  if (days === 1) return "Starts tomorrow";
  if (days <= 30) return `In ${days} days`;
  return `Starts ${new Date(start).toLocaleDateString(undefined, { day: "numeric", month: "short" })}`;
}

export default function SidebarNextExhibition() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  // Month currently shown in the mini calendar (first-of-month timestamp).
  const [monthAnchor, setMonthAnchor] = useState<number | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    createClient()
      .from("exhibitions")
      .select("id, name, location, start_date, end_date")
      .order("start_date", { ascending: true })
      .then(({ data }) => {
        const rs = ((data ?? []) as Row[]).filter((r) => r.start_date);
        setRows(rs);
        const next = pickNext(rs);
        const anchorDate = next ? new Date(dayMs(next.row.start_date!)) : new Date();
        setMonthAnchor(new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1).getTime());
        setLoading(false);
      });
  }, []);

  const next = useMemo(() => pickNext(rows), [rows]);

  const calendar = useMemo(() => {
    if (monthAnchor == null) return null;
    const anchor = new Date(monthAnchor);
    const year = anchor.getFullYear();
    const month = anchor.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    // Map each day-of-month to the exhibition covering it (first match wins).
    const showByDay = new Map<number, string>();
    for (const r of rows) {
      const s = dayMs(r.start_date!);
      const e = r.end_date ? dayMs(r.end_date) : s;
      for (let d = 1; d <= daysInMonth; d++) {
        const cellMs = new Date(year, month, d).getTime();
        if (cellMs >= s && cellMs <= e && !showByDay.has(d)) showByDay.set(d, r.id);
      }
    }
    return {
      year,
      month,
      cells,
      showByDay,
      label: anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
    };
  }, [monthAnchor, rows]);

  function shiftMonth(delta: number) {
    if (monthAnchor == null) return;
    const a = new Date(monthAnchor);
    setMonthAnchor(new Date(a.getFullYear(), a.getMonth() + delta, 1).getTime());
  }

  if (loading) return null;

  const more = next ? next.upcomingCount - 1 : 0;
  const todayDom = new Date().getDate();
  const todayMonthShown =
    calendar &&
    calendar.year === new Date().getFullYear() &&
    calendar.month === new Date().getMonth();

  return (
    <div className="mt-auto space-y-2 p-3">
      {next ? (
        <Link
          href={`/exhibitions/${next.row.id}`}
          className="block rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
        >
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Next exhibition
          </p>
          <p className="mt-1.5 text-sm font-bold leading-snug text-white">{next.row.name}</p>
          {next.row.location && <p className="mt-0.5 text-xs leading-snug text-slate-400">{next.row.location}</p>}
          <p className="mt-1.5 text-xs font-medium text-emerald-300">{statusLine(next.row)}</p>
        </Link>
      ) : (
        <Link
          href="/exhibitions"
          className="group block rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 transition-colors hover:bg-emerald-500/20"
        >
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Get started
          </p>
          <p className="mt-1.5 text-sm font-bold leading-snug text-white">Plan your shows</p>
          <p className="mt-0.5 text-xs leading-snug text-slate-300">
            Add the exhibitions you&rsquo;ll attend, then capture leads at each booth.
          </p>
          <span className="mt-2.5 inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors group-hover:bg-emerald-500">
            Add an exhibition →
          </span>
        </Link>
      )}

      {calendar && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="grid h-6 w-6 place-items-center rounded text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="Previous month"
            >
              ‹
            </button>
            <span className="text-xs font-semibold text-white">{calendar.label}</span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="grid h-6 w-6 place-items-center rounded text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="Next month"
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {WEEKDAYS.map((w, i) => (
              <span key={i} className="py-1 text-[9px] font-medium text-slate-500">
                {w}
              </span>
            ))}
            {calendar.cells.map((d, i) => {
              if (d == null) return <span key={i} />;
              const showId = calendar.showByDay.get(d);
              const isToday = todayMonthShown && d === todayDom;
              const base = "grid h-6 place-items-center rounded text-[11px] tabular-nums";
              if (showId) {
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => router.push(`/exhibitions/${showId}`)}
                    className={`${base} bg-emerald-600 font-semibold text-white hover:bg-emerald-500 ${isToday ? "ring-1 ring-white/60" : ""}`}
                  >
                    {d}
                  </button>
                );
              }
              return (
                <span key={i} className={`${base} text-slate-400 ${isToday ? "ring-1 ring-white/30" : ""}`}>
                  {d}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {more > 0 && (
        <Link href="/exhibitions" className="block px-1 text-[11px] text-slate-400 hover:text-slate-200">
          {more} more planned →
        </Link>
      )}
    </div>
  );
}
