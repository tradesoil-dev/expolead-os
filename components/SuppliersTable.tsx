"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Upload, Trash2, Loader2 } from "lucide-react";
import { useConfirm } from "@/components/useConfirm";
import { useToast } from "@/components/useToast";
import { createClient } from "@/lib/supabase/client";
import { HeadlineStrip, type Headline } from "@/components/ReportsOverview";
import { canonicalCountry } from "@/lib/geo/country";
import { PriorityBadge, StatusBadge, InterestBadge } from "@/components/Badge";
import Select from "@/components/Select";
import {
  FOLLOW_UP_STATUSES,
  INTEREST_TYPES,
  PRIORITIES,
  tradeModelLabel,
  TRADE_MODELS,
  type Supplier,
} from "@/lib/types";
import { filterSuppliers, type SupplierFilters } from "@/lib/suppliers-filter";

export default function SuppliersTable({
  suppliers,
  canExport,
  canImport = true,
}: {
  suppliers: Supplier[];
  canExport: boolean;
  canImport?: boolean;
}) {
  const [q, setQ] = useState("");
  const [interest, setInterest] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [visited, setVisited] = useState("");
  const [exhibition, setExhibition] = useState("");
  const [tradeModel, setTradeModel] = useState("");

  const exhibitions = useMemo(() => {
    const map = new Map<string, string>();

    suppliers.forEach((supplier) => {
      if (supplier.exhibition_id && supplier.exhibition?.name) {
        map.set(supplier.exhibition_id, supplier.exhibition.name);
      }
    });

    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [suppliers]);

  const filters = useMemo<SupplierFilters>(
    () => ({ q, interest, priority, status, visited, exhibition, tradeModel }),
    [q, interest, priority, status, visited, exhibition, tradeModel],
  );
  const filtered = useMemo(() => filterSuppliers(suppliers, filters), [suppliers, filters]);

  // Pagination — 10 rows per page. Reset to page 1 whenever the filtered set changes.
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [q, interest, priority, status, visited, exhibition, tradeModel]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Bulk selection for delete. Only rows that match the current filters can
  // stay selected, so a hidden row is never deleted by surprise.
  const router = useRouter();
  const { confirm, ConfirmUI } = useConfirm();
  const { showToast, ToastUI } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const visible = new Set(filtered.map((s) => s.id));
    setSelected((cur) => {
      const next = new Set([...cur].filter((id) => visible.has(id)));
      return next.size === cur.size ? cur : next;
    });
  }, [filtered]);
  const pageAllSelected = paged.length > 0 && paged.every((s) => selected.has(s.id));
  const allFilteredSelected = filtered.length > 0 && selected.size === filtered.length;

  function toggleRow(id: string) {
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function togglePage() {
    setSelected((cur) => {
      const next = new Set(cur);
      if (pageAllSelected) paged.forEach((s) => next.delete(s.id));
      else paged.forEach((s) => next.add(s.id));
      return next;
    });
  }

  async function deleteSelected() {
    const ids = [...selected];
    if (ids.length === 0) return;
    const n = ids.length === 1 ? "this connection" : `these ${ids.length} connections`;
    const ok = await confirm(
      `This permanently deletes ${n}, with their contacts, notes, meetings and follow-ups. Opportunities linked to them are kept, without the link. This cannot be undone.`,
      { title: ids.length === 1 ? "Delete 1 connection?" : `Delete ${ids.length} connections?`, confirmLabel: "Yes, delete" },
    );
    if (!ok) return;
    setDeleting(true);
    const supabase = createClient();
    let removed = 0;
    let failed = false;
    // Chunks keep each request small; RLS limits the delete to the user's own rows.
    for (let i = 0; i < ids.length; i += 100) {
      const { data, error } = await supabase.from("suppliers").delete().in("id", ids.slice(i, i + 100)).select("id");
      if (error) {
        failed = true;
        break;
      }
      removed += data?.length ?? 0;
    }
    setDeleting(false);
    setSelected(new Set());
    if (failed) showToast(removed ? `Deleted ${removed}, then something went wrong. Please try the rest again.` : "Could not delete. Please try again.", "error");
    else showToast(removed === 1 ? "1 connection deleted" : `${removed} connections deleted`);
    router.refresh();
  }

  // CSV generation and the plan re-check happen server-side. The button hits the
  // gated route with the current filters; the browser only triggers the download.
  const [exporting, setExporting] = useState(false);
  async function exportCsv() {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (interest) params.set("interest", interest);
      if (priority) params.set("priority", priority);
      if (status) params.set("status", status);
      if (visited) params.set("visited", visited);
      if (exhibition) params.set("exhibition", exhibition);
      if (tradeModel) params.set("tradeModel", tradeModel);

      const res = await fetch(`/api/export/connections?${params.toString()}`);
      if (res.status === 401) { window.location.href = "/login"; return; }
      if (res.status === 403) { window.location.href = "/upgrade"; return; }
      if (!res.ok) {
        let message = "Could not export. Please try again.";
        try {
          const body = await res.json();
          if (body?.error) message = body.error;
        } catch {}
        alert(message);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `expolead-connections-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }
  // Headline numbers over all connections (not the filters below them).
  const headlines = useMemo((): Headline[] => {
    const DAY = 86400000;
    const now = Date.now();
    const t = (s: string | null | undefined) => (s ? new Date(s).getTime() : 0);
    const new30 = suppliers.filter((s) => t(s.created_at) >= now - 30 * DAY).length;
    const newPrev = suppliers.filter((s) => t(s.created_at) >= now - 60 * DAY && t(s.created_at) < now - 30 * DAY).length;
    const targets = suppliers.filter((s) => s.is_target).length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day0 = today.getTime();
    const scheduled = suppliers.filter((s) => s.follow_up_date && s.follow_up_status !== "closed" && !(s as any).follow_up_completed);
    const dayOf = (s: string) => { const d = new Date(s); d.setHours(0, 0, 0, 0); return d.getTime(); };
    const overdue = scheduled.filter((s) => dayOf(s.follow_up_date!) < day0).length;
    const thisWeek = scheduled.filter((s) => { const d = dayOf(s.follow_up_date!); return d >= day0 && d <= day0 + 7 * DAY; }).length;
    const firstSeen = new Map<string, number>();
    for (const s of suppliers) {
      const raw = (s.country ?? "").trim();
      if (!raw) continue;
      const key = canonicalCountry(raw) ?? raw.toLowerCase();
      firstSeen.set(key, Math.min(firstSeen.get(key) ?? Infinity, t(s.created_at) || Infinity));
    }
    const newCountries = Array.from(firstSeen.values()).filter((ms) => ms >= now - 30 * DAY).length;
    return [
      { label: "Total connections", value: String(suppliers.length), delta: new30, unit: "", deltaSuffix: "in 30 days", sub: `vs ${newPrev} in the 30 days before` },
      { label: "Target connections", value: String(targets), delta: null, chip: suppliers.length ? { text: `${Math.round((targets / suppliers.length) * 100)}% of all`, tone: "neutral" } : undefined, sub: "Companies you plan to win" },
      { label: "Follow-ups scheduled", value: String(scheduled.length), delta: null, chip: overdue ? { text: `${overdue} overdue`, tone: "bad" } : { text: "None overdue", tone: "good" }, sub: `${thisWeek} due in the next 7 days` },
      { label: "Countries", value: String(firstSeen.size), delta: newCountries || null, unit: "", deltaSuffix: "new", sub: "New means a first connection in the last 30 days" },
    ];
  }, [suppliers]);

    return (
    <div className="space-y-4">
      {ConfirmUI}
      {ToastUI}
      <div className="pb-2">
        <HeadlineStrip items={headlines} />
      </div>

      <div className="space-y-2">
        {/* Search — always full width */}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search company, country, booth…"
          className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
        />

        {/* Filters — compact grid: 2 cols on mobile, one row of 5 on desktop */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <Select
            value={exhibition}
            onChange={setExhibition}
            className="py-2"
            options={[{ value: "", label: "All exhibitions" }, ...exhibitions.map(([id, name]) => ({ value: id, label: name }))]}
          />

          <Select
            value={tradeModel}
            onChange={setTradeModel}
            className="py-2"
            options={[{ value: "", label: "All trade models" }, ...TRADE_MODELS.map((x) => ({ value: x.value, label: x.label }))]}
          />

          <Select
            value={interest}
            onChange={setInterest}
            className="py-2"
            options={[{ value: "", label: "All classifications" }, ...INTEREST_TYPES.map((x) => ({ value: x.value, label: x.label }))]}
          />

          <Select
            value={priority}
            onChange={setPriority}
            className="py-2"
            options={[{ value: "", label: "All priorities" }, ...PRIORITIES.map((x) => ({ value: x.value, label: x.label }))]}
          />

          <Select
            value={status}
            onChange={setStatus}
            className="py-2"
            options={[{ value: "", label: "All statuses" }, ...FOLLOW_UP_STATUSES.map((x) => ({ value: x.value, label: x.label }))]}
          />

          <Select
            value={visited}
            onChange={setVisited}
            className="py-2"
            options={[{ value: "", label: "All booths" }, { value: "yes", label: "Visited" }, { value: "no", label: "Not visited" }]}
          />
        </div>

        {/* Data tools: import and export side by side. */}
        <div className="flex justify-end gap-2">
          {canImport ? (
            <Link
              href="/connections/import"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium hover:bg-ink-50 md:flex-none"
            >
              <Upload className="h-4 w-4 text-ink-500" /> Import CSV
            </Link>
          ) : (
            <Link
              href="/upgrade"
              title="Your trial has ended, upgrade to continue"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-400 hover:bg-ink-50 md:flex-none"
            >
              🔒 Import CSV
            </Link>
          )}
          {canExport ? (
            <button
              onClick={exportCsv}
              disabled={filtered.length === 0 || exporting}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium hover:bg-ink-50 disabled:opacity-50 md:flex-none"
            >
              <Download className="h-4 w-4 text-ink-500" /> {exporting ? "Exporting…" : "Export CSV"}
            </button>
          ) : (
            <Link
              href="/upgrade"
              title="CSV export is available on Starter and Growth"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-400 hover:bg-ink-50 md:flex-none"
            >
              🔒 Export CSV
            </Link>
          )}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-2.5 text-sm">
          <span className="font-semibold text-ink-900">{selected.size} selected</span>
          {!allFilteredSelected && filtered.length > paged.length && (
            <button type="button" onClick={() => setSelected(new Set(filtered.map((s) => s.id)))} className="font-medium text-emerald-700 hover:underline">
              Select all {filtered.length}{filtered.length !== suppliers.length ? " matching" : ""}
            </button>
          )}
          <button type="button" onClick={() => setSelected(new Set())} className="font-medium text-ink-500 hover:underline">Clear</button>
          <button
            type="button"
            onClick={deleteSelected}
            disabled={deleting}
            className="ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {deleting ? "Deleting…" : "Delete selected"}
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white shadow-card" style={{ WebkitOverflowScrolling: "touch" }}>
        <table className="w-full min-w-[1320px] text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs font-semibold uppercase tracking-wide text-emerald-700">
              <th className="w-10 py-2.5 pl-4 pr-0">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-emerald-600"
                  checked={pageAllSelected}
                  onChange={togglePage}
                  disabled={paged.length === 0}
                  aria-label="Select all rows on this page"
                />
              </th>
              <th className="px-4 py-2.5">Company</th>
              <th className="px-4 py-2.5">Exhibition</th>
              <th className="px-4 py-2.5">Booth</th>
              <th className="px-4 py-2.5">Class</th>
              <th className="px-4 py-2.5">Trade model</th>
              <th className="px-4 py-2.5">Country</th>
              <th className="px-4 py-2.5">Priority</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Follow-up</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-ink-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-ink-400">
                  {suppliers.length === 0
                    ? "No connections yet, add your first one."
                    : "No connections match these filters."}
                </td>
              </tr>
            ) : (
              paged.map((s) => (
                <tr key={s.id} className={`transition-colors ${selected.has(s.id) ? "bg-emerald-50/50" : "hover:bg-ink-50"}`}>
                  <td className="w-10 py-3 pl-4 pr-0 align-middle">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-emerald-600"
                      checked={selected.has(s.id)}
                      onChange={() => toggleRow(s.id)}
                      aria-label={`Select ${s.company_name}`}
                    />
                  </td>
                  <td className="px-4 py-3 align-middle whitespace-normal min-w-[220px]">
                    <Link href={`/connections/${s.id}`} className="font-medium text-ink-900 hover:text-brand-700">
                      {s.company_name}
                    </Link>
                    {s.is_target && (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                        TARGET
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-ink-700">{s.exhibition?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-700">
                    {s.booth_number
                      ? s.booth_number
                      : (s.met_at ? s.met_at === "my_stand" : s.exhibition?.attending_as === "exhibiting")
                        ? <span className="text-emerald-700">Your stand</span>
                        : "—"}
                  </td>
                  <td className="px-4 py-3"><InterestBadge interest={s.interest_type} /></td>
                  <td className="px-4 py-3 align-middle whitespace-normal min-w-[210px]">
                    {s.trade_models && s.trade_models.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {s.trade_models.map((t) => (
                          <span key={t} className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/15">
                            {tradeModelLabel(t)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-ink-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-700">{s.country ?? "—"}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={s.priority} /></td>
                  <td className="px-4 py-3"><StatusBadge status={s.follow_up_status} /></td>
                  <td className="px-4 py-3 text-ink-500">{s.follow_up_date ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink-400">
          {filtered.length === 0
            ? "No connections"
            : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          {filtered.length !== suppliers.length && ` (filtered from ${suppliers.length})`}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-50 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              ← Prev
            </button>
            <span className="text-xs tabular-nums text-ink-500">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-50 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}