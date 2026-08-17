"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Row = { id: string; name: string; location: string | null; start_date: string | null; end_date: string | null };

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function dayMs(dateStr: string): number {
  const d = new Date(dateStr + "T00:00:00");
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
const DAY = 86400000;

// Pick the show to feature: a currently-live one first, otherwise the soonest
// upcoming. Fully-past shows are ignored.
function pickNext(rows: Row[]): { row: Row; upcomingCount: number } | null {
  const today = startOfToday();
  const dated = rows.filter((r) => r.start_date);
  const relevant = dated
    .filter((r) => {
      const end = r.end_date ? dayMs(r.end_date) : dayMs(r.start_date!);
      return end >= today; // live or upcoming
    })
    .sort((a, b) => dayMs(a.start_date!) - dayMs(b.start_date!));
  if (relevant.length === 0) return null;
  return { row: relevant[0], upcomingCount: relevant.length };
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
  return `Starts ${new Date(row.start_date! + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short" })}`;
}

export default function SidebarNextExhibition() {
  const [loading, setLoading] = useState(true);
  const [next, setNext] = useState<{ row: Row; upcomingCount: number } | null>(null);

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
        setNext(pickNext((data ?? []) as Row[]));
        setLoading(false);
      });
  }, []);

  if (loading) return null;

  // Nothing planned — gentle nudge to add shows.
  if (!next) {
    return (
      <div className="mt-auto p-3">
        <Link
          href="/exhibitions"
          className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300 transition-colors hover:bg-white/10"
        >
          <span className="font-semibold text-white">Plan your shows</span>
          <span className="mt-0.5 block text-slate-400">Add the exhibitions you&rsquo;ll attend →</span>
        </Link>
      </div>
    );
  }

  const { row, upcomingCount } = next;
  const more = upcomingCount - 1;

  return (
    <div className="mt-auto p-3">
      <Link
        href={`/exhibitions/${row.id}`}
        className="block rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
      >
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
          Next exhibition
        </p>
        <p className="mt-1.5 truncate text-sm font-bold text-white">{row.name}</p>
        {row.location && <p className="truncate text-xs text-slate-400">{row.location}</p>}
        <p className="mt-1.5 text-xs font-medium text-emerald-300">{statusLine(row)}</p>
      </Link>
      {more > 0 && (
        <Link href="/exhibitions" className="mt-2 block px-1 text-[11px] text-slate-400 hover:text-slate-200">
          {more} more planned →
        </Link>
      )}
    </div>
  );
}
