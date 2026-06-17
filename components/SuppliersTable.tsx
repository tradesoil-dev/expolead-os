"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PriorityBadge, StatusBadge, InterestBadge } from "@/components/Badge";
import {
  FOLLOW_UP_STATUSES,
  INTEREST_TYPES,
  PRIORITIES,
  statusLabel,
  priorityLabel,
  interestLabel,
  type Supplier,
} from "@/lib/types";

export default function SuppliersTable({ suppliers }: { suppliers: Supplier[] }) {
  const [q, setQ] = useState("");
  const [interest, setInterest] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [visited, setVisited] = useState("");
  const [exhibition, setExhibition] = useState("");

  const exhibitions = useMemo(() => {
    const map = new Map<string, string>();

    suppliers.forEach((supplier) => {
      if (supplier.exhibition_id && supplier.exhibition?.name) {
        map.set(supplier.exhibition_id, supplier.exhibition.name);
      }
    });

    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [suppliers]);

  const filtered = useMemo(() => {
    return suppliers.filter((s) => {
      if (interest && s.interest_type !== interest) return false;
      if (priority && s.priority !== priority) return false;
      if (status && s.follow_up_status !== status) return false;
      if (visited === "yes" && !s.visited) return false;
      if (visited === "no" && s.visited) return false;
      if (exhibition && s.exhibition_id !== exhibition) return false;

      if (q) {
        const hay = `${s.company_name} ${s.country ?? ""} ${s.categories.join(" ")} ${s.exhibition?.name ?? ""} ${s.hall ?? ""} ${s.booth_number ?? ""}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }

      return true;
    });
  }, [suppliers, q, interest, priority, status, visited, exhibition]);

  function exportCsv() {
    const headers = [
      "Company",
      "Interest",
      "Country",
      "Website",
      "Exhibition",
      "Hall",
      "Booth number",
      "Stand location",
      "Visited",
      "Visit date",
      "Priority",
      "Follow-up status",
      "Follow-up date",
      "Categories",
      "Target",
      "Notes",
      "Contact Name",
      "Contact Position",
      "Contact Email",
      "Contact Phone",
      "Contact WhatsApp",
    ];

    const rows = filtered.map((s) => {
      const contact = s.contacts?.find((c) => c.is_primary) ?? s.contacts?.[0];

      return [
        s.company_name,
        interestLabel(s.interest_type),
        s.country ?? "",
        s.website ?? "",
        s.exhibition?.name ?? "",
        s.hall ?? "",
        s.booth_number ?? "",
        s.stand_location ?? "",
        s.visited ? "Yes" : "No",
        s.visit_date ?? "",
        priorityLabel(s.priority),
        statusLabel(s.follow_up_status),
        s.follow_up_date ?? "",
        s.categories.join("; "),
        s.is_target ? "Yes" : "No",
        (s.notes ?? "").replace(/\n/g, " "),
        contact?.full_name ?? "",
        contact?.position ?? "",
        contact?.email ?? "",
        contact?.phone ?? "",
        contact?.whatsapp ?? "",
      ];
    });

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expolead-suppliers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  const totalSuppliers = suppliers.length;
  const targetSuppliers = suppliers.filter((s) => s.is_target).length;
  const followUpsDue = suppliers.filter((s) => s.follow_up_date).length;
  const countries = new Set(suppliers.map((s) => s.country).filter(Boolean)).size;
  const selectClass = "w-full md:w-auto rounded-lg border border-ink-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-brand-500";

    return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-card">
          <p className="text-xs font-medium text-ink-500">Total suppliers</p>
          <p className="mt-2 text-2xl font-semibold text-ink-900">{totalSuppliers}</p>
        </div>

        <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-card">
          <p className="text-xs font-medium text-ink-500">Target suppliers</p>
          <p className="mt-2 text-2xl font-semibold text-ink-900">{targetSuppliers}</p>
        </div>

        <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-card">
          <p className="text-xs font-medium text-ink-500">Follow-ups</p>
          <p className="mt-2 text-2xl font-semibold text-ink-900">{followUpsDue}</p>
        </div>

        <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-card">
          <p className="text-xs font-medium text-ink-500">Countries</p>
          <p className="mt-2 text-2xl font-semibold text-ink-900">{countries}</p>
        </div>
      </div>

      <div className="space-y-2">
        {/* Search — always full width */}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search company, country, category, booth…"
          className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
        />

        {/* Filters — 2-col grid on mobile, inline row on md+ */}
        <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center">
          <select value={exhibition} onChange={(e) => setExhibition(e.target.value)} className={selectClass}>
            <option value="">All exhibitions</option>
            {exhibitions.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>

          <select value={interest} onChange={(e) => setInterest(e.target.value)} className={selectClass}>
            <option value="">All classifications</option>
            {INTEREST_TYPES.map((x) => (
              <option key={x.value} value={x.value}>{x.label}</option>
            ))}
          </select>

          <select value={priority} onChange={(e) => setPriority(e.target.value)} className={selectClass}>
            <option value="">All priorities</option>
            {PRIORITIES.map((x) => (
              <option key={x.value} value={x.value}>{x.label}</option>
            ))}
          </select>

          <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
            <option value="">All statuses</option>
            {FOLLOW_UP_STATUSES.map((x) => (
              <option key={x.value} value={x.value}>{x.label}</option>
            ))}
          </select>

          <select value={visited} onChange={(e) => setVisited(e.target.value)} className={selectClass}>
            <option value="">All booths</option>
            <option value="yes">Visited</option>
            <option value="no">Not visited</option>
          </select>

          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium hover:bg-ink-50 disabled:opacity-50 md:w-auto"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs font-medium text-ink-500">
              <th className="px-4 py-2.5">Company</th>
              <th className="px-4 py-2.5">Exhibition</th>
              <th className="px-4 py-2.5">Booth</th>
              <th className="px-4 py-2.5">Class</th>
              <th className="px-4 py-2.5">Country</th>
              <th className="px-4 py-2.5">Priority</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Follow-up</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-ink-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-ink-400">
                  {suppliers.length === 0
                    ? "No suppliers yet — add your first lead."
                    : "No suppliers match these filters."}
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-ink-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/suppliers/${s.id}`} className="font-medium text-ink-900 hover:text-brand-700">
                      {s.company_name}
                    </Link>
                    {s.is_target && (
                      <span className="ml-2 rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-medium text-ink-500">
                        TARGET
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-ink-700">{s.exhibition?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-700">{s.booth_number ?? "—"}</td>
                  <td className="px-4 py-3"><InterestBadge interest={s.interest_type} /></td>
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

      <p className="text-xs text-ink-400">
        Showing {filtered.length} of {suppliers.length} suppliers
      </p>
    </div>
  );
}