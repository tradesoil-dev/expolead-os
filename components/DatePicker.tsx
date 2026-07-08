"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function pad(n: number) { return String(n).padStart(2, "0"); }
function toYMD(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function parseYMD(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
function fmtDisplay(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Modern custom date picker. Emits "YYYY-MM-DD" (same as a native date input),
// with a floating calendar rendered in a portal so it never clips.
export default function DatePicker({
  value,
  onChange,
  placeholder = "Select a date",
  disabled = false,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; flip: boolean } | null>(null);
  const [view, setView] = useState(() => parseYMD(value) ?? new Date());
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => { const d = parseYMD(value); if (d) setView(d); }, [value]);

  const selected = parseYMD(value);
  const today = new Date();
  const PANEL_H = 340;

  function place() {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const flip = r.bottom + PANEL_H > window.innerHeight && r.top > PANEL_H;
    setRect({ top: r.bottom, left: r.left, width: Math.max(r.width, 288), flip });
  }

  function toggle() {
    if (disabled) return;
    if (!open) { setView(parseYMD(value) ?? new Date()); place(); }
    setOpen((o) => !o);
  }

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (btnRef.current?.contains(e.target as Node)) return;
      if (panelRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    function reposition() { place(); }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const vy = view.getFullYear();
  const vm = view.getMonth();
  const gridStart = new Date(vy, vm, 1 - new Date(vy, vm, 1).getDay());
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });

  function pick(d: Date) { onChange(toYMD(d)); setOpen(false); }

  return (
    <>
      <button
        type="button"
        ref={btnRef}
        onClick={toggle}
        disabled={disabled}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 transition-colors disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${open ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-ink-200 hover:border-slate-300"} ${className}`}
      >
        <span className={selected ? "" : "text-slate-400"}>{selected ? fmtDisplay(selected) : placeholder}</span>
        <svg className="h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
      </button>

      {mounted && open && rect && createPortal(
        <div
          ref={panelRef}
          style={{
            position: "fixed",
            top: rect.flip ? rect.top - btnRef.current!.offsetHeight - PANEL_H - 6 : rect.top + 6,
            left: rect.left,
            width: rect.width,
            zIndex: 9999,
          }}
          className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="px-1 text-sm font-bold text-slate-900">{MONTHS[vm]} {vy}</p>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setView(new Date(vy, vm - 1, 1))} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Previous month">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <button type="button" onClick={() => setView(new Date(vy, vm + 1, 1))} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Next month">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {DOW.map((d) => (
              <span key={d} className="grid h-8 place-items-center text-[11px] font-semibold text-slate-400">{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              const inMonth = d.getMonth() === vm;
              const isSelected = selected && toYMD(d) === toYMD(selected);
              const isToday = toYMD(d) === toYMD(today);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(d)}
                  className={`grid h-9 place-items-center rounded-lg text-sm transition-colors ${
                    isSelected
                      ? "bg-emerald-600 font-semibold text-white"
                      : inMonth
                      ? "text-slate-700 hover:bg-emerald-50"
                      : "text-slate-300 hover:bg-slate-50"
                  } ${isToday && !isSelected ? "ring-1 ring-emerald-400" : ""}`}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
            <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100">Clear</button>
            <button type="button" onClick={() => pick(new Date())} className="rounded-lg px-2 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50">Today</button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
