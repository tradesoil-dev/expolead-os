// Bulk import of connections from the ExpoLead CSV template. Pure functions
// (no React, no Supabase) so the browser preview and the server route run the
// exact same parsing and validation, and the mobile app can reuse them.
//
// The template uses the same column names as the Connections CSV export, so an
// exported file can be imported back. Columns are matched by header name (any
// order, case-insensitive); unknown columns are ignored. The exhibition is
// chosen on the import screen, so an "Exhibition" column is ignored too.

import {
  INTEREST_TYPES,
  PRIORITIES,
  FOLLOW_UP_STATUSES,
  type InterestType,
  type Priority,
  type FollowUpStatus,
} from "@/lib/types";
import { COUNTRIES } from "@/lib/countries";
import { ensureHttps } from "@/lib/url";

// Hard caps, enforced in the browser and again on the server.
export const IMPORT_MAX_ROWS = 2000;
export const IMPORT_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

// Company is the only required column. Rows whose company is exactly this are
// the template's example row and are skipped.
export const EXAMPLE_COMPANY = "EXAMPLE ROW (delete me)";

export const TEMPLATE_HEADERS = [
  "Company",
  "Interest",
  "Country",
  "Website",
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

const TEMPLATE_EXAMPLE = [
  EXAMPLE_COMPANY,
  "Buyer",
  "France",
  "www.example.com",
  "Hall 5",
  "5A 112",
  "Near the main entrance",
  "Yes",
  "2026-10-20",
  "High",
  "New",
  "2026-11-03",
  "No",
  "Interested in private label olive oil, wants samples",
  "Marie Dubois",
  "Purchasing Manager",
  "marie@example.com",
  "+33 1 23 45 67 89",
  "+33 6 12 34 56 78",
];

// Field keys the importer understands, and the header names that map to each.
type Field =
  | "company_name" | "interest_type" | "country" | "website" | "hall" | "booth_number"
  | "stand_location" | "visited" | "visit_date" | "priority" | "follow_up_status"
  | "follow_up_date" | "is_target" | "notes" | "full_name" | "position" | "email"
  | "phone" | "whatsapp";

const HEADER_ALIASES: Record<Field, string[]> = {
  company_name: ["company", "company name"],
  interest_type: ["interest", "classification"],
  country: ["country"],
  website: ["website", "web"],
  hall: ["hall"],
  booth_number: ["booth number", "booth", "stand number"],
  stand_location: ["stand location", "location"],
  visited: ["visited"],
  visit_date: ["visit date"],
  priority: ["priority"],
  follow_up_status: ["follow-up status", "follow up status", "status"],
  follow_up_date: ["follow-up date", "follow up date"],
  is_target: ["target"],
  notes: ["notes", "note"],
  full_name: ["contact name", "name", "full name"],
  position: ["contact position", "position", "job title", "title"],
  email: ["contact email", "email"],
  phone: ["contact phone", "phone", "mobile"],
  whatsapp: ["contact whatsapp", "whatsapp"],
};

// Max lengths so one bad cell cannot bloat the database.
const MAX_LEN: Partial<Record<Field, number>> = {
  company_name: 200, country: 80, website: 300, hall: 80, booth_number: 80,
  stand_location: 200, notes: 5000, full_name: 160, position: 160, email: 254,
  phone: 40, whatsapp: 40,
};

export type ImportRow = {
  company_name: string;
  interest_type: InterestType;
  country: string | null;
  website: string | null;
  hall: string | null;
  booth_number: string | null;
  stand_location: string | null;
  visited: boolean;
  visit_date: string | null;
  priority: Priority;
  follow_up_status: FollowUpStatus;
  follow_up_date: string | null;
  is_target: boolean;
  notes: string | null;
  contact: {
    full_name: string | null;
    position: string | null;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
  } | null;
};

export type ParsedRow = {
  line: number; // spreadsheet row number (header = row 1)
  row: ImportRow | null; // null when the row has an error
  errors: string[];
  warnings: string[];
};

export type ParseResult = {
  rows: ParsedRow[];
  missingCompanyColumn: boolean;
  unknownHeaders: string[];
  tooManyRows: boolean;
};

// ─── Template ───────────────────────────────────────────────────────────────

function templateCell(v: string): string {
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** The downloadable template: UTF-8 BOM (so Excel keeps accents), header row
 * and one example row that the importer skips. */
export function buildTemplateCsv(): string {
  const lines = [TEMPLATE_HEADERS, TEMPLATE_EXAMPLE].map((r) => r.map(templateCell).join(","));
  return "﻿" + lines.join("\r\n") + "\r\n";
}

// ─── Decoding and CSV parsing ───────────────────────────────────────────────

/** Excel saves "CSV UTF-8" or a legacy Windows encoding. Try strict UTF-8
 * first and fall back to Windows-1252 so accented names survive either way. */
export function decodeCsvBytes(buf: ArrayBuffer): string {
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    text = new TextDecoder("windows-1252").decode(buf);
  }
  return text.replace(/^﻿/, "");
}

/** Excel in much of Europe saves CSV with semicolons. Pick the delimiter that
 * appears most in the header line (outside quotes). */
function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r\n|\n|\r/, 1)[0] ?? "";
  const count = (d: string) => {
    let n = 0;
    let inQ = false;
    for (const ch of firstLine) {
      if (ch === '"') inQ = !inQ;
      else if (ch === d && !inQ) n++;
    }
    return n;
  };
  const candidates = [",", ";", "\t"];
  return candidates.reduce((best, d) => (count(d) > count(best) ? d : best), ",");
}

/** RFC 4180 parser: quoted fields, doubled quotes, newlines inside quotes. */
export function parseCsv(text: string): string[][] {
  const delim = detectDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') inQuotes = true;
    else if (ch === delim) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// ─── Cell normalisers ───────────────────────────────────────────────────────

/** Lower-cased, whitespace-collapsed text for comparing names. */
export function normalizeKey(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

// Our own export prefixes cells that start with = + - @ with an apostrophe
// (formula-injection guard), e.g. "'+33 6 12...". Undo that on the way in.
function clean(v: string | undefined): string {
  let s = (v ?? "").replace(/\s+/g, " ").trim();
  if (s.startsWith("'")) s = s.slice(1).trim();
  return s;
}

function matchOption<T extends string>(raw: string, options: { value: T; label: string }[]): T | null {
  const k = raw.toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();
  const hit = options.find(
    (o) => o.label.toLowerCase() === k || o.value.replace(/_/g, " ") === k,
  );
  return hit ? hit.value : null;
}

function yesNo(raw: string): boolean | null {
  const k = raw.toLowerCase();
  if (["yes", "y", "true", "1", "oui", "x"].includes(k)) return true;
  if (["no", "n", "false", "0", "non"].includes(k)) return false;
  return null;
}

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
};

function iso(y: number, m: number, d: number): string | null {
  if (y < 1990 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCMonth() !== m - 1) return null; // e.g. 31 Feb
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Accepts 2026-10-20, 20/10/2026, 20-10-2026, 20.10.2026, 20 Oct 2026,
 * Oct 20 2026. Slashed dates are read day first unless that is impossible. */
export function parseDate(raw: string): string | null {
  const s = raw.trim();
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (m) return iso(+m[1], +m[2], +m[3]);
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})$/);
  if (m) {
    let a = +m[1];
    let b = +m[2];
    const y = m[3].length === 2 ? 2000 + +m[3] : +m[3];
    if (b > 12 && a <= 12) [a, b] = [b, a]; // clearly month first
    return iso(y, b, a);
  }
  m = s.match(/^(\d{1,2})\s+([a-z]{3,9})\.?,?\s+(\d{4})$/i);
  if (m && monthNum(m[2])) return iso(+m[3], monthNum(m[2]), +m[1]);
  m = s.match(/^([a-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})$/i);
  if (m && monthNum(m[1])) return iso(+m[3], monthNum(m[1]), +m[2]);
  return null;
}

function monthNum(name: string): number {
  const k = name.toLowerCase();
  return MONTHS[k.slice(0, 4)] ?? MONTHS[k.slice(0, 3)] ?? 0;
}

const COUNTRY_BY_LOWER = new Map(COUNTRIES.map((c) => [c.toLowerCase(), c]));

// ─── Row validation ─────────────────────────────────────────────────────────

/** Validate one record (a map of field -> raw text). Shared by the preview and
 * the server, so both always agree on what gets saved. */
export function validateRecord(rec: Partial<Record<Field, string>>): { row: ImportRow | null; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const get = (f: Field) => {
    const v = clean(rec[f]);
    const max = MAX_LEN[f];
    if (max && v.length > max) {
      warnings.push(`${f === "notes" ? "Notes" : "A value"} was too long and was shortened`);
      return v.slice(0, max);
    }
    return v;
  };

  const company = get("company_name");
  if (!company) errors.push("Company is empty");

  const interestRaw = get("interest_type");
  let interest: InterestType = "supplier";
  if (interestRaw) {
    const hit = matchOption(interestRaw, INTEREST_TYPES);
    if (hit) interest = hit;
    else warnings.push(`Interest "${interestRaw}" not recognised, saved as Supplier`);
  }

  const priorityRaw = get("priority");
  let priority: Priority = "medium";
  if (priorityRaw) {
    const hit = matchOption(priorityRaw, PRIORITIES);
    if (hit) priority = hit;
    else warnings.push(`Priority "${priorityRaw}" not recognised, saved as Medium`);
  }

  const statusRaw = get("follow_up_status");
  let status: FollowUpStatus = "new";
  if (statusRaw) {
    const hit = matchOption(statusRaw, FOLLOW_UP_STATUSES);
    if (hit) status = hit;
    else warnings.push(`Follow-up status "${statusRaw}" not recognised, saved as New`);
  }

  const dateField = (f: Field, label: string) => {
    const raw = get(f);
    if (!raw) return null;
    const d = parseDate(raw);
    if (!d) warnings.push(`${label} "${raw}" not understood, left empty`);
    return d;
  };
  const visitDate = dateField("visit_date", "Visit date");
  const followDate = dateField("follow_up_date", "Follow-up date");

  const visitedRaw = get("visited");
  let visited = yesNo(visitedRaw) ?? false;
  if (visitedRaw && yesNo(visitedRaw) === null) warnings.push(`Visited "${visitedRaw}" not understood, saved as No`);
  if (!visitedRaw && visitDate) visited = true;

  const targetRaw = get("is_target");
  const target = yesNo(targetRaw) ?? false;
  if (targetRaw && yesNo(targetRaw) === null) warnings.push(`Target "${targetRaw}" not understood, saved as No`);

  const countryRaw = get("country");
  const country = countryRaw ? COUNTRY_BY_LOWER.get(countryRaw.toLowerCase()) ?? countryRaw : null;

  const websiteRaw = get("website");
  const website = websiteRaw ? ensureHttps(websiteRaw) : null;

  const email = get("email").toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.push(`Email "${email}" does not look right`);

  const contactFields = {
    full_name: get("full_name") || null,
    position: get("position") || null,
    email: email || null,
    phone: get("phone") || null,
    whatsapp: get("whatsapp") || null,
  };
  const hasContact = Object.values(contactFields).some(Boolean);

  if (errors.length) return { row: null, errors, warnings };

  return {
    row: {
      company_name: company,
      interest_type: interest,
      country,
      website,
      hall: get("hall") || null,
      booth_number: get("booth_number") || null,
      stand_location: get("stand_location") || null,
      visited,
      visit_date: visitDate,
      priority,
      follow_up_status: status,
      follow_up_date: followDate,
      is_target: target,
      notes: get("notes") || null,
      contact: hasContact ? contactFields : null,
    },
    errors,
    warnings,
  };
}

/** Header names -> field keys (first matching column wins). */
function mapHeaders(headers: string[]): { map: (Field | null)[]; unknown: string[] } {
  const unknown: string[] = [];
  const used = new Set<Field>();
  const map = headers.map((h) => {
    const k = clean(h).toLowerCase().replace(/\s+/g, " ");
    if (!k || k === "exhibition") return null;
    const field = (Object.keys(HEADER_ALIASES) as Field[]).find(
      (f) => !used.has(f) && HEADER_ALIASES[f].includes(k),
    );
    if (!field) {
      unknown.push(clean(h));
      return null;
    }
    used.add(field);
    return field;
  });
  return { map, unknown };
}

/** Parse a whole CSV text into validated rows. Blank lines and the template's
 * example row are skipped. */
export function parseImportCsv(text: string): ParseResult {
  const grid = parseCsv(text);
  const header = grid[0] ?? [];
  const { map, unknown } = mapHeaders(header);
  const missingCompanyColumn = !map.includes("company_name");

  const rows: ParsedRow[] = [];
  let tooManyRows = false;
  for (let i = 1; i < grid.length; i++) {
    const cells = grid[i];
    if (cells.every((c) => !c.trim())) continue;
    const rec: Partial<Record<Field, string>> = {};
    map.forEach((f, idx) => {
      if (f) rec[f] = cells[idx] ?? "";
    });
    if (clean(rec.company_name) === EXAMPLE_COMPANY) continue;
    if (rows.length >= IMPORT_MAX_ROWS) {
      tooManyRows = true;
      break;
    }
    const v = validateRecord(rec);
    rows.push({ line: i + 1, ...v });
  }
  return { rows, missingCompanyColumn, unknownHeaders: unknown, tooManyRows };
}

/** Server-side re-validation of rows sent by the browser. The browser's parsed
 * values are never trusted: each row is mapped back to raw text fields and run
 * through the same validateRecord. */
export function revalidateRows(input: unknown): ImportRow[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > IMPORT_MAX_ROWS) return null;
  const out: ImportRow[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") return null;
    const r = item as Record<string, unknown>;
    const c = (r.contact && typeof r.contact === "object" ? r.contact : {}) as Record<string, unknown>;
    const s = (v: unknown) => (typeof v === "string" ? v : "");
    const b = (v: unknown) => (v === true ? "Yes" : "No");
    const v = validateRecord({
      company_name: s(r.company_name),
      interest_type: s(r.interest_type),
      country: s(r.country),
      website: s(r.website),
      hall: s(r.hall),
      booth_number: s(r.booth_number),
      stand_location: s(r.stand_location),
      visited: b(r.visited),
      visit_date: s(r.visit_date),
      priority: s(r.priority),
      follow_up_status: s(r.follow_up_status),
      follow_up_date: s(r.follow_up_date),
      is_target: b(r.is_target),
      notes: s(r.notes),
      full_name: s(c.full_name),
      position: s(c.position),
      email: s(c.email),
      phone: s(c.phone),
      whatsapp: s(c.whatsapp),
    });
    if (!v.row) return null;
    out.push(v.row);
  }
  return out;
}
