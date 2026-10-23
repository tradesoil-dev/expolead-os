"use client";

import { useMemo, useRef, useState } from "react";

export type LibraryShow = {
  name: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
};

const DAY = 86400000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parse(d: string | null) {
  return d ? new Date(`${d}T00:00:00Z`) : null;
}

// "17 to 21 Oct 2026", or "30 Sep to 2 Oct 2026" across months.
export function showDates(s: LibraryShow) {
  const a = parse(s.start_date);
  const b = parse(s.end_date) ?? a;
  if (!a || !b) return "";
  const da = a.getUTCDate();
  const db = b.getUTCDate();
  const ma = MONTHS[a.getUTCMonth()];
  const mb = MONTHS[b.getUTCMonth()];
  if (a.getTime() === b.getTime()) return `${da} ${ma} ${a.getUTCFullYear()}`;
  if (ma === mb && a.getUTCFullYear() === b.getUTCFullYear()) return `${da} to ${db} ${mb} ${b.getUTCFullYear()}`;
  return `${da} ${ma} to ${db} ${mb} ${b.getUTCFullYear()}`;
}

// Campaign label for a show: its name plus the year it ran, e.g. "SIAL Paris 2026".
// Names that already carry the year (e.g. "Hotel Asia Maldives 2026") are kept as is.
export function campaignFor(s: LibraryShow) {
  const d = parse(s.start_date) ?? parse(s.end_date);
  if (!d) return s.name;
  const year = String(d.getUTCFullYear());
  return s.name.includes(year) ? s.name : `${s.name} ${year}`;
}

// Shows that ended in the last 60 days first (when check-ins are sent), then
// upcoming or running shows, then older ones, then undated.
function rank(s: LibraryShow, now: number): [number, number] {
  const start = parse(s.start_date)?.getTime();
  const end = (parse(s.end_date) ?? parse(s.start_date))?.getTime();
  if (end === undefined || start === undefined) return [3, 0];
  if (end < now && end >= now - 60 * DAY) return [0, -end];
  if (end >= now) return [1, start];
  return [2, -end];
}

// Searchable list of Exhibition Library shows for the admin Send check-in
// pop-up. Typing filters the list; anything not in the library can still be
// used as typed, so the admin is never blocked.
export default function ExhibitionPicker({
  shows,
  value,
  onChange,
  onPick,
}: {
  shows: LibraryShow[];
  value: string;
  onChange: (text: string) => void;
  onPick: (show: LibraryShow | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sorted = useMemo(() => {
    const now = Date.now();
    return [...shows].sort((x, y) => {
      const [rx, kx] = rank(x, now);
      const [ry, ky] = rank(y, now);
      return rx - ry || kx - ky || x.name.localeCompare(y.name);
    });
  }, [shows]);

  const q = value.trim().toLowerCase();
  const matches = q ? sorted.filter((s) => s.name.toLowerCase().includes(q) || (s.location ?? "").toLowerCase().includes(q)) : sorted;
  const exact = matches.some((s) => s.name.toLowerCase() === q);
  const showOther = q.length > 0 && !exact;
  const total = matches.length + (showOther ? 1 : 0);
  const now = Date.now();

  function choose(i: number) {
    if (i < matches.length) {
      onChange(matches[i].name);
      onPick(matches[i]);
    } else {
      onPick(null);
    }
    setOpen(false);
  }

  return (
    <div className="relative mt-1">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHi(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) setOpen(true);
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHi((h) => Math.min(h + 1, Math.max(total - 1, 0)));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHi((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter" && open && total > 0) {
            e.preventDefault();
            choose(hi);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        maxLength={80}
        placeholder="Search the Exhibition Library, e.g. SIAL"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm font-normal focus:border-emerald-500 focus:outline-none"
      />
      {open && total > 0 && (
        <ul
          role="listbox"
          onMouseDown={() => blurTimer.current && clearTimeout(blurTimer.current)}
          className="absolute left-0 right-0 z-10 mt-1 max-h-60 overflow-auto rounded-lg border border-ink-200 bg-white py-1 shadow-lg"
        >
          {matches.map((s, i) => {
            const recent = rank(s, now)[0] === 0;
            const meta = [showDates(s), s.location].filter(Boolean).join(", ");
            return (
              <li
                key={`${s.name}-${s.start_date}`}
                role="option"
                aria-selected={i === hi}
                onMouseEnter={() => setHi(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(i);
                }}
                className={`cursor-pointer px-3 py-2 ${i === hi ? "bg-emerald-50" : ""}`}
              >
                <span className="flex items-center gap-2 text-sm font-medium text-ink-900">
                  {s.name}
                  {recent && (
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">Just ended</span>
                  )}
                </span>
                {meta && <span className="block truncate text-xs font-normal text-ink-400">{meta}</span>}
              </li>
            );
          })}
          {showOther && (
            <li
              role="option"
              aria-selected={hi === matches.length}
              onMouseEnter={() => setHi(matches.length)}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(matches.length);
              }}
              className={`cursor-pointer border-t border-ink-100 px-3 py-2 text-sm font-normal text-ink-600 ${hi === matches.length ? "bg-emerald-50" : ""}`}
            >
              Use &ldquo;{value.trim()}&rdquo; <span className="text-ink-400">(not in the library)</span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
