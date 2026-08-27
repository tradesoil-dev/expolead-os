import { NextRequest, NextResponse } from "next/server";
import { requireExportAccess } from "@/lib/export/entitlement";
import { toCsv, EXPORT_ROW_LIMIT } from "@/lib/export/csv";
import { OPPORTUNITIES_CSV_HEADERS, opportunityToRow } from "@/lib/export/opportunities-csv";
import type { Opportunity } from "@/lib/types";

// Never cache an authenticated, per-user data export.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const gate = await requireExportAccess();
  if (!gate.ok) return gate.response;
  const { supabase, userId } = gate;

  // The Opportunities view filters only by a selected exhibition. We re-derive
  // it server-side from the query string and never trust the client's row set.
  const exhibition = req.nextUrl.searchParams.get("exhibition") ?? "";

  // RLS scopes opportunities to auth.uid() = user_id; the explicit user_id
  // filter is defense in depth. We fetch at most EXPORT_ROW_LIMIT + 1 rows so an
  // oversized export never loads an unbounded set into memory.
  let query = supabase
    .from("opportunities")
    .select("*, supplier:suppliers(id, company_name), products:opportunity_products(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(EXPORT_ROW_LIMIT + 1);

  if (exhibition) query = query.eq("exhibition", exhibition);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json(
      { error: "Could not generate the export. Please try again." },
      { status: 500 },
    );
  }

  const rows = (data ?? []) as unknown as Opportunity[];

  if (rows.length > EXPORT_ROW_LIMIT) {
    return NextResponse.json(
      {
        error: `This export is too large (over ${EXPORT_ROW_LIMIT.toLocaleString()} opportunities). Narrow your filters and try again.`,
      },
      { status: 413 },
    );
  }

  const csv = toCsv(OPPORTUNITIES_CSV_HEADERS, rows.map(opportunityToRow));

  const filename = `expolead-opportunities-${new Date().toISOString().slice(0, 10)}.csv`;
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
