"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

// Upcoming (or live) shows, soonest first. The card pages through these.
function upcomingRows(rows: Row[]): Row[] {
  const today = startOfToday();
  return rows
    .filter((r) => r.start_date)
    .filter((r) => (r.end_date ? dayMs(r.end_date) : dayMs(r.start_date!)) >= today)
    .sort((a, b) => dayMs(a.start_date!) - dayMs(b.start_date!));
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
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  // Which upcoming show the card is pointing at (index into the upcoming list).
  const [idx, setIdx] = useState(0);

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
        setRows(((data ?? []) as Row[]).filter((r) => r.start_date));
        setLoading(false);
      });
  }, []);

  const upcoming = useMemo(() => upcomingRows(rows), [rows]);
  const current = upcoming.length ? upcoming[Math.min(idx, upcoming.length - 1)] : null;

  // Step to another upcoming show, wrapping around.
  function step(delta: number) {
    if (upcoming.length < 2) return;
    setIdx((i) => (i + delta + upcoming.length) % upcoming.length);
  }

  if (loading) return null;

  return (
    <div className="mt-auto space-y-2 p-3">
      {current ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
              {idx === 0 ? "Next exhibition" : "Upcoming exhibition"}
            </p>
            {upcoming.length > 1 && (
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="grid h-5 w-5 place-items-center rounded text-slate-400 hover:bg-white/10 hover:text-white"
                  aria-label="Previous exhibition"
                >
                  ‹
                </button>
                <span className="px-0.5 text-[10px] tabular-nums text-slate-400">{idx + 1}/{upcoming.length}</span>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="grid h-5 w-5 place-items-center rounded text-slate-400 hover:bg-white/10 hover:text-white"
                  aria-label="Next exhibition"
                >
                  ›
                </button>
              </div>
            )}
          </div>
          <Link href={`/exhibitions/${current.id}`} className="group mt-1.5 block">
            <p className="text-sm font-bold leading-snug text-white group-hover:text-emerald-200">{current.name}</p>
            {current.location && <p className="mt-0.5 text-xs leading-snug text-slate-400">{current.location}</p>}
            <p className="mt-1.5 text-xs font-medium text-emerald-300">{statusLine(current)}</p>
          </Link>
        </div>
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
    </div>
  );
}
