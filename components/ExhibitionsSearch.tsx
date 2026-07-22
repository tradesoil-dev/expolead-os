"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Exhibition, Supplier } from "@/lib/types";
import { calcRoi, formatRatio } from "@/lib/currencies";

function relativeLabel(diffDays: number): string {
  const d = Math.abs(diffDays);
  if (d === 0) return "today";
  if (d < 30) return `${d} day${d === 1 ? "" : "s"}`;
  const months = Math.round(d / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"}`;
  const years = Math.round(months / 12);
  return `${years} year${years === 1 ? "" : "s"}`;
}

function exhibitionStatus(startDate: string | null, endDate: string | null) {
  if (!startDate) {
    return { label: "Upcoming", badge: "bg-emerald-100 text-emerald-700", hint: "", live: false, dim: false };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  const end = new Date(endDate ?? startDate);
  end.setHours(23, 59, 59, 999);

  if (today < start) {
    const days = Math.ceil((start.getTime() - today.getTime()) / 86400000);
    return { label: "Upcoming", badge: "bg-emerald-100 text-emerald-700", hint: `in ${relativeLabel(days)}`, live: false, dim: false };
  }
  if (today >= start && today <= end) {
    return { label: "Live now", badge: "bg-amber-100 text-amber-700", hint: "Happening now", live: true, dim: false };
  }
  const days = Math.floor((today.getTime() - end.getTime()) / 86400000);
  return { label: "Completed", badge: "bg-ink-100 text-ink-500", hint: `${relativeLabel(days)} ago`, live: false, dim: true };
}

export default function ExhibitionsSearch({
  exhibitions,
  suppliers,
  opportunities = [],
  currency = "USD",
}: {
  exhibitions: Exhibition[];
  suppliers: Supplier[];
  opportunities?: { exhibition: string | null; status: string | null; deal_value: number | null }[];
  currency?: string;
}) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Exhibition[]>(exhibitions);
  const [confirmTarget, setConfirmTarget] = useState<Exhibition | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const router = useRouter();

  // Keep local list in sync when the server re-sends data.
  useEffect(() => { setRows(exhibitions); }, [exhibitions]);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function askDelete(e: React.MouseEvent, ex: Exhibition) {
    e.preventDefault();
    e.stopPropagation();
    setConfirmTarget(ex);
  }

  async function confirmDelete() {
    if (!confirmTarget) return;
    if (!isSupabaseConfigured) { setConfirmTarget(null); return; }
    const ex = confirmTarget;
    setDeleting(true);
    // .select() returns the rows actually deleted — lets us confirm it really happened
    // instead of falsely reporting success when RLS removes 0 rows.
    const { data, error } = await createClient()
      .from("exhibitions")
      .delete()
      .eq("id", ex.id)
      .select();
    setDeleting(false);
    setConfirmTarget(null);
    if (error) {
      showToast(error.message || "Could not delete exhibition.", "error");
      return;
    }
    if (!data || data.length === 0) {
      showToast("Couldn't delete this exhibition, it may already be removed, or you don't have permission.", "error");
      router.refresh();
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== ex.id)); // optimistic removal
    showToast(`"${ex.name}" deleted.`, "success");
    router.refresh();
  }

  const statsFor = (exId: string | null) => {
    const related = suppliers.filter((s) => s.exhibition_id === exId);
    const visited = related.filter((s) => s.visited).length;
    const remaining = related.filter((s) => !s.visited).length;
    return { total: related.length, visited, remaining };
  };

  // Cost against won business for one show. Opportunities link to exhibitions
  // by free-text name, not by id, which is why this matches on ex.name.
  const moneyFor = (ex: Exhibition) => {
    const forShow = opportunities.filter((o) => o.exhibition === ex.name);
    return calcRoi(forShow, Number(ex.cost) || 0);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((ex) => {
      const name = ex.name?.toLowerCase() ?? "";
      const location = ex.location?.toLowerCase() ?? "";
      return name.includes(q) || location.includes(q);
    });
  }, [rows, query]);

  if (rows.length === 0) {
    return (
      <>
        <Toast toast={toast} />
        <div className="rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 p-8 text-center">
          <p className="text-base font-semibold text-ink-700">Start by adding the shows you attend</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
            Click <span className="font-semibold text-ink-700">+ New exhibition</span> above and search the library
            for a show (e.g. SIAL, CHINACOAT), or add your own. Your connections and opportunities are then
            organized under each show.
          </p>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-4">
      <Toast toast={toast} />

      {/* Delete confirmation dialog */}
      {confirmTarget && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-rose-50">
              <svg className="h-5 w-5 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </div>
            <h3 className="text-center text-base font-bold text-ink-900">Delete &ldquo;{confirmTarget.name}&rdquo;?</h3>
            <p className="mt-2 text-center text-sm text-ink-500">
              Your connections stay safe, but they&rsquo;ll be unlinked from this show. This can&rsquo;t be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmTarget(null)}
                disabled={deleting}
                className="flex-1 rounded-lg border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search exhibitions by name or location…"
        className="w-full max-w-md rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-ink-400">No exhibitions match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ex) => {
            const status = exhibitionStatus(ex.start_date, ex.end_date);
            return (
            <Link
              key={ex.id}
              href={`/exhibitions/${ex.id}`}
              className={`relative block rounded-2xl border border-ink-200 bg-white p-5 shadow-card hover:border-emerald-200 hover:shadow-lg transition-all ${status.dim ? "opacity-80" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xl font-semibold text-ink-900">
                  {ex.name}
                </h3>

                <div className="flex shrink-0 items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.badge}`}>
                    {status.live && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                    {status.label}
                  </span>
                  <button
                    onClick={(e) => askDelete(e, ex)}
                    aria-label={`Delete ${ex.name}`}
                    title="Delete exhibition"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:border-rose-200 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </div>
              </div>
              <p className="text-sm text-ink-500 mt-0.5">{ex.location ?? "—"}</p>
              <p className="text-xs text-ink-400 mt-2">
                {ex.start_date ?? "?"} → {ex.end_date ?? "?"}
                {status.hint && <span className="ml-2 font-semibold text-ink-500">· {status.hint}</span>}
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-ink-100 bg-ink-50 p-3">
                  <p className="text-lg font-semibold text-emerald-600">{statsFor(ex.id).total}</p>
                  <p className="text-[11px] text-ink-400">Connections</p>
                </div>

                <div className="rounded-xl border border-ink-100 bg-ink-50 p-3">
                  <p className="text-lg font-semibold text-emerald-600">{statsFor(ex.id).visited}</p>
                  <p className="text-[11px] text-ink-400">Visited</p>
                </div>

                <div className="rounded-xl border border-ink-100 bg-ink-50 p-3">
                  <p className="text-lg font-semibold text-emerald-600">{statsFor(ex.id).remaining}</p>
                  <p className="text-[11px] text-ink-400">Remaining</p>
                </div>
              </div>
              {(() => {
                const money = moneyFor(ex);
                return (
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-ink-100 pt-3">
                    {money.cost === 0 ? (
                      <span className="text-xs font-medium text-amber-700">Add cost to see this show&rsquo;s return</span>
                    ) : (
                      <span className="text-xs text-ink-500">
                        Cost {Math.round(money.cost).toLocaleString()}
                        {money.won > 0 && <> · Won {Math.round(money.won).toLocaleString()}</>}
                      </span>
                    )}
                    <span className={`shrink-0 text-sm font-bold ${money.cost === 0 ? "text-ink-300" : money.won === 0 ? "text-ink-400" : "text-emerald-600"}`}>
                      {money.cost === 0 ? "—" : money.won === 0 ? "Too early" : formatRatio(money.ratio)}
                    </span>
                  </div>
                );
              })()}
              <div className="mt-3 flex justify-end">
                <span className="text-sm font-medium text-emerald-600">
                  View exhibition →
                </span>
              </div>
            </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Toast({ toast }: { toast: { message: string; type: "success" | "error" } | null }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-lg text-sm font-medium w-max max-w-[calc(100vw-2rem)] ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
      {toast.type === "success" ? (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      ) : (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      )}
      {toast.message}
    </div>
  );
}
