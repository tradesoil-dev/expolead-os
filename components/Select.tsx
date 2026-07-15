"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Option = { value: string; label: string };

// Modern custom dropdown used across the app. The option panel renders in a
// portal with fixed positioning, so it floats above everything and is never
// clipped inside cards or scroll containers.
export default function Select({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled = false,
  className = "",
  size = "md",
}: {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; flip: boolean } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const selected = options.find((o) => o.value === value);

  function place() {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const panelH = Math.min(320, options.length * 44 + 12);
    const flip = r.bottom + panelH > window.innerHeight && r.top > panelH;
    setRect({ top: r.bottom, left: r.left, width: r.width, flip });
  }

  function toggle() {
    if (disabled) return;
    if (!open) place();
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

  const rowH = 44;
  const panelH = Math.min(320, options.length * rowH + 12);

  return (
    <>
      <button
        type="button"
        ref={btnRef}
        onClick={toggle}
        disabled={disabled}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-white ${size === "sm" ? "px-3 py-2" : "px-4 py-3"} text-left text-sm font-semibold text-slate-800 transition-colors disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${open ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-ink-200 hover:border-slate-300"} ${className}`}
      >
        <span className={selected ? "truncate" : "truncate text-slate-400"}>{selected ? selected.label : placeholder}</span>
        <svg className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
      </button>

      {mounted && open && rect && createPortal(
        <div
          ref={panelRef}
          style={{
            position: "fixed",
            top: rect.flip ? rect.top - btnRef.current!.offsetHeight - panelH - 6 : rect.top + 6,
            left: rect.left,
            width: rect.width,
            zIndex: 9999,
          }}
          className="max-h-[320px] overflow-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
        >
          {options.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`flex w-full items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-left text-sm transition-colors ${active ? "bg-emerald-50 font-semibold text-emerald-700" : "text-slate-700 hover:bg-slate-50"}`}
              >
                <span className="truncate">{o.label}</span>
                {active && <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}
