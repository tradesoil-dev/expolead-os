import { NextRequest, NextResponse } from "next/server";
import { requireExportAccess } from "@/lib/export/entitlement";
import { toCsv, EXPORT_ROW_LIMIT } from "@/lib/export/csv";
import { filterSuppliers, type SupplierFilters } from "@/lib/suppliers-filter";
import { CONNECTIONS_CSV_HEADERS, connectionToRow } from "@/lib/export/connections-csv";
import type { Supplier } from "@/lib/types";

// Never cache an authenticated, per-user data export.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const gate = await requireExportAccess();
  if (!gate.ok) return gate.response;
  const { supabase, userId } = gate;

  const sp = req.nextUrl.searchParams;
  const filters: SupplierFilters = {
    q: sp.get("q") ?? undefined,
    interest: sp.get("interest") ?? undefined,
    priority: sp.get("priority") ?? undefined,
    status: sp.get("status") ?? undefined,
    visited: sp.get("visited") ?? undefined,
    exhibition: sp.get("exhibition") ?? undefined,
    tradeModel: sp.get("tradeModel") ?? undefined,
  };

  // RLS already scopes suppliers to auth.uid() = user_id; the explicit user_id
  // filter is defense in depth. Structured filters are pushed to the DB and we
  // fetch at most EXPORT_ROW_LIMIT + 1 rows so an oversized export never loads an
  // unbounded set into memory.
  let query = supabase
    .from("suppliers")
    .select("*, exhibition:exhibitions(*), contacts(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(EXPORT_ROW_LIMIT + 1);

  if (filters.interest) query = query.eq("interest_type", filters.interest);
  if (filters.priority) query = query.eq("priority", filters.priority);
  if (filters.status) query = query.eq("follow_up_status", filters.status);
  if (filters.visited === "yes") query = query.eq("visited", true);
  if (filters.visited === "no") query = query.eq("visited", false);
  if (filters.exhibition) query = query.eq("exhibition_id", filters.exhibition);
  if (filters.tradeModel) query = query.contains("trade_models", [filters.tradeModel]);

  const { data, error } = await query;
  if (error) {
    // Generic message only; never surface DB detail.
    return NextResponse.json(
      { error: "Could not generate the export. Please try again." },
      { status: 500 },
    );
  }

  const rows = (data ?? []) as unknown as Supplier[];

  // Over the cap: return an explicit error and never a partial file.
  if (rows.length > EXPORT_ROW_LIMIT) {
    return NextResponse.json(
      {
        error: `This export is too large (over ${EXPORT_ROW_LIMIT.toLocaleString()} connections). Narrow your filters and try again.`,
      },
      { status: 413 },
    );
  }

  // Apply the free-text search here (spans a joined field). Structured
  // predicates re-apply idempotently, keeping exact parity with the table view.
  const finalRows = filterSuppliers(rows, filters);
  const csv = toCsv(CONNECTIONS_CSV_HEADERS, finalRows.map(connectionToRow));

  const filename = `expolead-connections-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
