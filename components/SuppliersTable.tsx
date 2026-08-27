"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

export default function SuppliersTable({ suppliers, canExport }: { suppliers: Supplier[]; canExport: boolean }) {
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
  const totalSuppliers = suppliers.length;
  const targetSuppliers = suppliers.filter((s) => s.is_target).length;
  const followUpsDue = suppliers.filter((s) => s.follow_up_date).length;
  const countries = new Set(suppliers.map((s) => s.country).filter(Boolean)).size;

    return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-xl border-2 border-emerald-400 bg-white p-4 shadow-card">
          <p className="text-xs font-medium text-ink-500">Total connections</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">{totalSuppliers}</p>
        </div>

        <div className="rounded-xl border-2 border-blue-400 bg-white p-4 shadow-card">
          <p className="text-xs font-medium text-ink-500">Target connections</p>
          <p className="mt-2 text-2xl font-semibold text-blue-600">{targetSuppliers}</p>
        </div>

        <div className="rounded-xl border-2 border-amber-400 bg-white p-4 shadow-card">
          <p className="text-xs font-medium text-ink-500">Follow-ups</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">{followUpsDue}</p>
        </div>

        <div className="rounded-xl border-2 border-purple-400 bg-white p-4 shadow-card">
          <p className="text-xs font-medium text-ink-500">Countries</p>
          <p className="mt-2 text-2xl font-semibold text-purple-600">{countries}</p>
        </div>
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

        <div className="flex justify-end">
          {canExport ? (
            <button
              onClick={exportCsv}
              disabled={filtered.length === 0 || exporting}
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium hover:bg-ink-50 disabled:opacity-50 md:w-auto"
            >
              {exporting ? "Exporting…" : "Export CSV"}
            </button>
          ) : (
            <Link
              href="/upgrade"
              title="CSV export is available on Starter and Growth"
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-center text-sm font-medium text-ink-400 hover:bg-ink-50 md:w-auto"
            >
              🔒 Export CSV
            </Link>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white shadow-card" style={{ WebkitOverflowScrolling: "touch" }}>
        <table className="w-full min-w-[1320px] text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs font-semibold uppercase tracking-wide text-emerald-700">
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
                <td colSpan={9} className="px-4 py-12 text-center text-ink-400">
                  {suppliers.length === 0
                    ? "No connections yet, add your first one."
                    : "No connections match these filters."}
                </td>
              </tr>
            ) : (
              paged.map((s) => (
                <tr key={s.id} className="hover:bg-ink-50 transition-colors">
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