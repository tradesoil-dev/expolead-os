"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Result = { key: string; label: string; sub: string; href: string; group: string };

export default function GlobalSearch({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  function place() {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.bottom + 6, left: r.left, width: r.width });
  }

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2 || !isSupabaseConfigured) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      const supabase = createClient();
      const like = `%${term}%`;
      const [sup, opp, exh] = await Promise.all([
        supabase.from("suppliers").select("id, company_name, country").ilike("company_name", like).limit(5),
        supabase.from("opportunities").select("id, name, product").ilike("name", like).limit(5),
        supabase.from("exhibitions").select("id, name, location").ilike("name", like).limit(5),
      ]);
      const out: Result[] = [];
      (sup.data ?? []).forEach((s) => out.push({ key: `s-${s.id}`, label: s.company_name, sub: s.country ?? "Connection", href: `/suppliers/${s.id}`, group: "Connections" }));
      (opp.data ?? []).forEach((o) => out.push({ key: `o-${o.id}`, label: o.name, sub: o.product || "Opportunity", href: `/opportunities/${o.id}`, group: "Opportunities" }));
      (exh.data ?? []).forEach((e) => out.push({ key: `e-${e.id}`, label: e.name, sub: e.location ?? "Exhibition", href: `/exhibitions/${e.id}`, group: "Exhibitions" }));
      setResults(out);
      setLoading(false);
      place();
    }, 250);
    return () => clearTimeout(handle);
  }, [q]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (wrapRef.current?.contains(e.target as Node)) return;
      if (panelRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    function reposition() { place(); }
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
  }, [open]);

  function go(href: string) {
    setOpen(false);
    setQ("");
    setResults([]);
    router.push(href);
  }

  const groups = ["Connections", "Opportunities", "Exhibitions"].filter((g) => results.some((r) => r.group === g));

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <div className="relative">
        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); place(); }}
          onFocus={() => { setOpen(true); place(); }}
          placeholder="Search connections, opportunities, exhibitions…"
          className="w-full rounded-full border border-ink-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {mounted && open && q.trim().length >= 2 && rect && createPortal(
        <div
          ref={panelRef}
          style={{ position: "fixed", top: rect.top, left: rect.left, width: rect.width, zIndex: 9999 }}
          className="max-h-[360px] overflow-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
        >
          {loading ? (
            <p className="px-3 py-4 text-center text-sm text-slate-400">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-slate-400">No matches for &ldquo;{q.trim()}&rdquo;.</p>
          ) : (
            groups.map((g) => (
              <div key={g} className="mb-1 last:mb-0">
                <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{g}</p>
                {results.filter((r) => r.group === g).map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => go(r.href)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-slate-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-900">{r.label}</span>
                      <span className="block truncate text-xs text-slate-500">{r.sub}</span>
                    </span>
                    <svg className="h-4 w-4 shrink-0 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
