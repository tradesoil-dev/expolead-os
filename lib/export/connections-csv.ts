import { interestLabel, priorityLabel, statusLabel, type Supplier } from "@/lib/types";

// Column order for the Connections CSV. Kept identical to the previous
// client-side export so the file is unchanged for users. No internal / system
// columns (id, user_id, created_at, foreign keys) are ever emitted.
export const CONNECTIONS_CSV_HEADERS = [
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
  "Target",
  "Notes",
  "Contact Name",
  "Contact Position",
  "Contact Email",
  "Contact Phone",
  "Contact WhatsApp",
];

/**
 * Map one connection to its CSV row (raw values; escaping and CR/LF handling are
 * done centrally by csvCell in lib/export/csv.ts).
 */
export function connectionToRow(s: Supplier): unknown[] {
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
    s.is_target ? "Yes" : "No",
    s.notes ?? "",
    contact?.full_name ?? "",
    contact?.position ?? "",
    contact?.email ?? "",
    contact?.phone ?? "",
    contact?.whatsapp ?? "",
  ];
}
