"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ExhibitionLibraryItem } from "@/lib/types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmt(start: string | null, end: string | null): string {
  if (!start) return "—";
  const s = new Date(start);
  const e = end ? new Date(end) : s;
  const sMon = MONTHS[s.getUTCMonth()];
  const eMon = MONTHS[e.getUTCMonth()];
  const year = e.getUTCFullYear();
  return sMon === eMon
    ? `${sMon} ${s.getUTCDate()}–${e.getUTCDate()}, ${year}`
    : `${sMon} ${s.getUTCDate()} – ${eMon} ${e.getUTCDate()}, ${year}`;
}

const EMPTY = { name: "", location: "", start_date: "", end_date: "", sector: "" };

export default function AdminLibraryManager({ shows }: { shows: ExhibitionLibraryItem[] }) {
  const [rows, setRows] = useState<ExhibitionLibraryItem[]>(shows);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [f, setF] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ExhibitionLibraryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => { setRows(shows); }, [shows]);

  const sectors = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => { if (r.sector) set.add(r.sector); });
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      `${r.name} ${r.location ?? ""} ${r.sector ?? ""}`.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(
    () => filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE),
    [filtered, currentPage]
  );

  useEffect(() => { setPage(1); }, [query]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  function notify(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function set<K extends keyof typeof f>(k: K, v: string) {
    setF((p) => ({ ...p, [k]: v }));
  }

  function openAdd() {
    setEditingId(null);
    setF(EMPTY);
    setShowForm(true);
  }

  function openEdit(r: ExhibitionLibraryItem) {
    setEditingId(r.id);
    setF({
      name: r.name,
      location: r.location ?? "",
      start_date: r.start_date ?? "",
      end_date: r.end_date ?? "",
      sector: r.sector ?? "",
    });
    setShowForm(true);
  }

  function cancel() {
    setShowForm(false);
    setEditingId(null);
    setF(EMPTY);
  }

  async function save() {
    if (!f.name.trim()) { notify("Name is required.", "error"); return; }
    setSaving(true);
    const supabase = createClient();
    const payload = {
      name: f.name.trim(),
      location: f.location || null,
      start_date: f.start_date || null,
      end_date: f.end_date || null,
      sector: f.sector || null,
    };
    if (editingId) {
      const { data, error } = await supabase.from("exhibition_library").update(payload).eq("id", editingId).select().single();
      setSaving(false);
      if (error || !data) { notify(error?.message || "Update failed.", "error"); return; }
      setRows((p) => p.map((r) => (r.id === editingId ? (data as ExhibitionLibraryItem) : r)));
      notify("Exhibition updated.", "success");
    } else {
      const { data, error } = await supabase.from("exhibition_library").insert(payload).select().single();
      setSaving(false);
      if (error || !data) { notify(error?.message || "Could not add. Are you signed in as admin?", "error"); return; }
      setRows((p) => [...p, data as ExhibitionLibraryItem]);
      notify("Exhibition added.", "success");
    }
    cancel();
  }

  async function confirmDelete() {
    if (!confirmTarget) return;
    const r = confirmTarget;
    setDeleting(true);
    const { data, error } = await createClient().from("exhibition_library").delete().eq("id", r.id).select();
    setDeleting(false);
    setConfirmTarget(null);
    if (error) { notify(error.message, "error"); return; }
    if (!data || data.length === 0) { notify("Couldn't delete — admin permission required.", "error"); return; }
    setRows((p) => p.filter((x) => x.id !== r.id));
    notify(`"${r.name}" removed.`, "success");
  }

  const inp = "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500";

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-lg text-sm font-medium w-max max-w-[calc(100vw-2rem)] ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
          {toast.message}
        </div>
      )}

      {confirmTarget && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-rose-50">
              <svg className="h-5 w-5 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </div>
            <h3 className="text-center text-base font-bold text-slate-900">Delete &ldquo;{confirmTarget.name}&rdquo;?</h3>
            <p className="mt-2 text-center text-sm text-slate-500">
              It will disappear from /trade-shows and every user&rsquo;s library picker. This can&rsquo;t be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setConfirmTarget(null)} disabled={deleting} className="flex-1 rounded-lg border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleting} className="flex-1 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 transition-colors disabled:opacity-50">
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Exhibition Library</h1>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Admin only</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">Shows here appear on /trade-shows and in every user&rsquo;s library picker.</p>
        </div>
        {!showForm && (
          <button onClick={openAdd} className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors">
            + Add exhibition
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-bold text-slate-900">{editingId ? "Edit exhibition" : "Add exhibition"}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-600">Name</label>
              <input className={inp} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Gulfood 2027" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-600">Location</label>
              <input className={inp} value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="Dubai World Trade Centre, Dubai, UAE" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Start date</label>
              <input type="date" className={inp} value={f.start_date} onChange={(e) => set("start_date", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">End date</label>
              <input type="date" className={inp} value={f.end_date} onChange={(e) => set("end_date", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-600">Sector</label>
              <input className={inp} list="sector-options" value={f.sector} onChange={(e) => set("sector", e.target.value)} placeholder="Pick existing or type a new one" />
              <datalist id="sector-options">
                {sectors.map((s) => <option key={s} value={s} />)}
              </datalist>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button onClick={save} disabled={saving} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
              {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={cancel} className="text-sm font-medium text-slate-500 hover:text-slate-900">Cancel</button>
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-xl border border-ink-200 bg-white px-4 py-6 text-center text-sm text-slate-400">
          No exhibitions yet. Add the first one.
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, location or sector…"
              className="w-full rounded-lg border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 sm:max-w-sm"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-ink-200 bg-white px-4 py-6 text-center text-sm text-slate-400">
              No exhibitions match &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-xl border border-ink-200 bg-white lg:block">
                <div className="grid grid-cols-[2fr_2fr_1.4fr_1.4fr_0.9fr] gap-2 border-b border-ink-100 bg-slate-50 px-4 py-2.5">
                  {["Name", "Location", "Dates", "Sector", ""].map((h, i) => (
                    <span key={i} className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{h}</span>
                  ))}
                </div>
                {paged.map((r) => (
                  <div key={r.id} className="grid grid-cols-[2fr_2fr_1.4fr_1.4fr_0.9fr] gap-2 border-b border-ink-50 px-4 py-3 last:border-0 items-center">
                    <span className="text-sm font-semibold text-slate-900">{r.name}</span>
                    <span className="text-xs text-slate-500">{r.location ?? "—"}</span>
                    <span className="text-xs text-slate-500">{fmt(r.start_date, r.end_date)}</span>
                    <span>{r.sector && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{r.sector}</span>}</span>
                    <span className="flex justify-end gap-3">
                      <button onClick={() => openEdit(r)} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Edit</button>
                      <button onClick={() => setConfirmTarget(r)} className="text-xs font-semibold text-rose-600 hover:text-rose-700">Delete</button>
                    </span>
                  </div>
                ))}
              </div>

              {/* Mobile cards */}
              <div className="flex flex-col gap-3 lg:hidden">
                {paged.map((r) => (
                  <div key={r.id} className="rounded-xl border border-ink-200 bg-white p-4">
                    <div className="mb-1.5 flex items-start justify-between gap-2">
                      <span className="text-[15px] font-bold text-slate-900">{r.name}</span>
                      {r.sector && (
                        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">{r.sector}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{r.location ?? "—"}</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-600">{fmt(r.start_date, r.end_date)}</p>
                    <div className="mt-2.5 flex gap-4 border-t border-ink-50 pt-2.5">
                      <button onClick={() => openEdit(r)} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Edit</button>
                      <button onClick={() => setConfirmTarget(r)} className="text-xs font-semibold text-rose-600 hover:text-rose-700">Delete</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex flex-col items-center justify-between gap-3 pt-1 sm:flex-row">
                <p className="text-xs text-slate-500">
                  Showing {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filtered.length)} of {filtered.length}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-md border border-ink-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40">Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                      <button key={n} onClick={() => setPage(n)} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${n === currentPage ? "bg-emerald-600 text-white" : "border border-ink-200 text-slate-600 hover:bg-slate-50"}`}>{n}</button>
                    ))}
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-md border border-ink-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40">Next</button>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
