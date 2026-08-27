import { opportunityStatusLabel, type Opportunity } from "@/lib/types";

// Column order for the Opportunities CSV. Kept identical to the previous
// client-side export so the file is unchanged for users. "Created At" is the
// user's own record timestamp already shown in the app, not a system-only field.
export const OPPORTUNITIES_CSV_HEADERS = [
  "Name",
  "Products",
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

/**
 * Map one opportunity to its CSV row (raw values; escaping and CR/LF handling
 * are done centrally by csvCell in lib/export/csv.ts).
 */
export function opportunityToRow(o: Opportunity): unknown[] {
  const products = o.products?.length
    ? o.products
        .map(
          (p) =>
            `${p.product}${p.quantity != null ? ` ${p.quantity}${p.quantity_unit ? " " + p.quantity_unit : ""}` : ""}`,
        )
        .join("; ")
    : [o.product, o.quantity, o.quantity_unit].filter(Boolean).join(" ");

  return [
    o.name,
    products,
    o.destination_market ?? "",
    o.exhibition ?? "",
    o.booth ?? "",
    o.priority,
    opportunityStatusLabel(o.status),
    o.notes ?? "",
    o.next_follow_up_date ?? "",
    o.next_follow_up_note ?? "",
    o.next_follow_up_completed ? "Yes" : "No",
    o.created_at,
  ];
}
