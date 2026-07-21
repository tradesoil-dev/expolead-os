"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type NotItem = { key: string; label: string; date: string; href: string };

type Props = {
  daysLeft: number;
  isExpired: boolean;
};

export default function NotificationsMenu({ daysLeft, isExpired }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const [items, setItems] = useState<NotItem[]>([]);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const hasAlert = isExpired || daysLeft <= 7 || items.length > 0;

  function handleOpen() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    if (!open) load();
    setOpen((o) => !o);
  }

  async function load() {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    const today = new Date().toISOString().slice(0, 10);
    const [sup, opp] = await Promise.all([
      supabase
        .from("suppliers")
        .select("id, company_name, follow_up_date, follow_up_status")
        .lte("follow_up_date", today)
        .neq("follow_up_status", "closed")
        .order("follow_up_date", { ascending: true })
        .limit(10),
      supabase
        .from("opportunities")
        .select("id, name, next_follow_up_date, next_follow_up_completed")
        .lte("next_follow_up_date", today)
        .order("next_follow_up_date", { ascending: true })
        .limit(10),
    ]);
    const fromConnections: NotItem[] = (sup.data ?? [])
      .filter((s) => s.follow_up_date)
      .map((s) => ({ key: `s-${s.id}`, label: s.company_name, date: s.follow_up_date, href: `/suppliers/${s.id}` }));
    const fromOpportunities: NotItem[] = (opp.data ?? [])
      .filter((o) => o.next_follow_up_date && !o.next_follow_up_completed)
      .map((o) => ({ key: `o-${o.id}`, label: o.name, date: o.next_follow_up_date as string, href: `/opportunities/${o.id}` }));
    const merged = [...fromConnections, ...fromOpportunities]
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .slice(0, 6);
    setItems(merged);
  }

  useEffect(() => {
    load();
    // Refresh the bell live when a follow-up is marked done anywhere.
    const onChanged = () => load();
    window.addEventListener("expolead:followups-changed", onChanged);
    return () => window.removeEventListener("expolead:followups-changed", onChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={handleOpen}
        className={`relative h-9 w-9 rounded-full flex items-center justify-center transition-colors ${open ? "bg-emerald-100 text-emerald-700" : "text-ink-400 hover:bg-ink-100 hover:text-ink-700"}`}
        aria-label="Notifications"
      >
        <BellIcon className="h-5 w-5" />
        {hasAlert && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
        )}
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{ top: pos.top, right: pos.right }}
          className="fixed z-[9999] w-72 rounded-xl border border-ink-200 bg-white shadow-lg overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100">
            <p className="text-sm font-semibold text-ink-900">Notifications</p>
            <button onClick={() => setOpen(false)} className="text-ink-400 hover:text-ink-700">
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="divide-y divide-ink-100">
            {/* Trial status */}
            {(isExpired || daysLeft <= 7) && (
              <div className={`px-4 py-3 ${isExpired ? "bg-rose-50" : "bg-amber-50"}`}>
                <p className={`text-xs font-semibold ${isExpired ? "text-rose-700" : "text-amber-700"}`}>
                  {isExpired ? "Trial ended" : `Trial: ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
                </p>
                <p className={`text-xs mt-0.5 ${isExpired ? "text-rose-600" : "text-amber-600"}`}>
                  {isExpired
                    ? "Upgrade to continue adding records."
                    : "Upgrade before your trial ends."}
                </p>
                <Link
                  href="/upgrade"
                  onClick={() => setOpen(false)}
                  className={`mt-1.5 inline-block text-xs font-bold underline ${isExpired ? "text-rose-700" : "text-amber-700"}`}
                >
                  View Plans →
                </Link>
              </div>
            )}

            {/* Follow-ups due — connections + opportunities */}
            {items.length > 0 ? (
              <div className="px-4 py-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400 py-1">
                  Follow-ups due
                </p>
                {items.map((it) => (
                  <Link
                    key={it.key}
                    href={it.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between py-2 text-sm text-ink-700 hover:text-emerald-700 transition-colors"
                  >
                    <span className="font-medium truncate">{it.label}</span>
                    <span className="ml-2 shrink-0 text-xs text-ink-400">{it.date}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-ink-400">No follow-ups due.</p>
                <p className="text-xs text-ink-300 mt-1">You're all caught up.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" />
      <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
