"use client";

import Link from "next/link";
import { useState } from "react";
import type { Opportunity } from "@/lib/types";

export default function OpportunitiesExportButton({
  opportunities,
  canExport,
  exhibition,
}: {
  opportunities: Opportunity[];
  canExport: boolean;
  exhibition?: string;
}) {
  const [exporting, setExporting] = useState(false);

  if (!canExport) {
    return (
      <Link
        href="/upgrade"
        title="CSV export is available on Starter and Growth"
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-400 hover:bg-slate-50"
      >
        🔒 Export CSV
      </Link>
    );
  }

  // CSV generation and the plan re-check happen server-side. The button hits the
  // gated route with the selected exhibition; the browser only triggers download.
  async function exportCsv() {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (exhibition) params.set("exhibition", exhibition);

      const res = await fetch(`/api/export/opportunities?${params.toString()}`);
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
      a.download = `expolead-opportunities-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      onClick={exportCsv}
      disabled={opportunities.length === 0 || exporting}
      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
    >
      {exporting ? "Exporting…" : "Export CSV"}
    </button>
  );
}
