"use client";

import Link from "next/link";
import { opportunityStatusLabel, type Opportunity } from "@/lib/types";

export default function OpportunitiesExportButton({
  opportunities,
  canExport,
}: {
  opportunities: Opportunity[];
  canExport: boolean;
}) {
  if (!canExport) {
    return (
      <Link
        href="/pricing"
        title="CSV export is available on Starter and Growth"
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-400 hover:bg-slate-50"
      >
        🔒 Export CSV
      </Link>
    );
  }

  function exportCsv() {
    const headers = [
      "Name",
      "Product",
      "Quantity",
      "Unit",
      "Destination Market",
      "Exhibition",
      "Booth",
      "Priority",
      "Status",
      "Notes",
      "Next Follow-up Date",
      "Next Follow-up Note",
      "Follow-up Completed",
      "Created At",
    ];

    const rows = opportunities.map((o) => [
      o.name,
      o.product,
      o.quantity ?? "",
      o.quantity_unit ?? "",
      o.destination_market ?? "",
      o.exhibition ?? "",
      o.booth ?? "",
      o.priority,
      opportunityStatusLabel(o.status),
      (o.notes ?? "").replace(/\n/g, " "),
      o.next_follow_up_date ?? "",
      (o.next_follow_up_note ?? "").replace(/\n/g, " "),
      o.next_follow_up_completed ? "Yes" : "No",
      o.created_at,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expolead-opportunities-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={exportCsv}
      disabled={opportunities.length === 0}
      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
    >
      Export CSV
    </button>
  );
}
