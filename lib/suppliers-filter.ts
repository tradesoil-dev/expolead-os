import type { Supplier } from "@/lib/types";

// The set of filters the Connections table exposes. Shared by the table view
// and the server-side export so the two can never drift out of parity.
export type SupplierFilters = {
  q?: string;
  interest?: string;
  priority?: string;
  status?: string;
  visited?: string; // "yes" | "no" | "" (anything else = no visited filter)
  exhibition?: string; // exhibition_id
  tradeModel?: string;
};

/**
 * Single source of truth for connection filtering. The structured predicates
 * (interest, priority, status, visited, exhibition, tradeModel) are also pushed
 * to the database in the export route for the row-cap check; if you change one,
 * change the other. The free-text `q` search spans a joined field
 * (exhibition.name) so it is only applied here in JS.
 */
export function filterSuppliers(suppliers: Supplier[], f: SupplierFilters): Supplier[] {
  return suppliers.filter((s) => {
    if (f.interest && s.interest_type !== f.interest) return false;
    if (f.priority && s.priority !== f.priority) return false;
    if (f.status && s.follow_up_status !== f.status) return false;
    if (f.visited === "yes" && !s.visited) return false;
    if (f.visited === "no" && s.visited) return false;
    if (f.exhibition && s.exhibition_id !== f.exhibition) return false;
    if (f.tradeModel && !(s.trade_models ?? []).includes(f.tradeModel)) return false;

    if (f.q) {
      const hay = `${s.company_name} ${s.country ?? ""} ${s.exhibition?.name ?? ""} ${s.hall ?? ""} ${s.booth_number ?? ""}`.toLowerCase();
      if (!hay.includes(f.q.toLowerCase())) return false;
    }

    return true;
  });
}
