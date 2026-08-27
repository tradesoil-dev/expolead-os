// Shared CSV-safety helpers used by every server-side export route so that
// escaping and formula-injection defenses can never drift between export types.

/**
 * Hard safety cap on a single CSV export. Enforced server-side against the
 * filtered, RLS-scoped result set BEFORE any CSV is generated. Each export
 * query fetches at most EXPORT_ROW_LIMIT + 1 rows, so an oversized request can
 * never load an unbounded dataset into server memory; if the cap is exceeded we
 * return an explicit error and never a partial file.
 *
 * 10,000 is far beyond any realistic single-account capture volume for a
 * booth/exhibition workflow (a heavy user captures hundreds per show), while
 * still bounding response size and memory. A durable per-user export throttle
 * is deliberately out of scope here and tracked separately as Task H3
 * (distributed, not in-memory).
 */
export const EXPORT_ROW_LIMIT = 10000;

/**
 * Neutralize spreadsheet formula injection. Excel / Google Sheets treat a cell
 * beginning with =, +, -, @ (or a leading TAB / CR) as a formula, which is an
 * injection vector. Prefixing a single apostrophe forces the cell to be read as
 * text. We test the first non-whitespace character so payloads padded with
 * leading spaces are still caught.
 */
function neutralizeFormula(value: string): string {
  const firstNonSpace = value.replace(/^\s+/, "");
  if (/^[=+\-@\t\r]/.test(firstNonSpace)) {
    return "'" + value;
  }
  return value;
}

/**
 * Escape a single value into one RFC 4180 CSV field:
 * - null / undefined become an empty field
 * - formula-injection payloads are neutralized
 * - CR / LF are collapsed to spaces so a value can never split a row in a naive
 *   parser
 * - the field is wrapped in double quotes and embedded quotes are doubled
 */
export function csvCell(input: unknown): string {
  if (input === null || input === undefined) return '""';
  let value = String(input);
  value = neutralizeFormula(value);
  value = value.replace(/\r\n|\r|\n/g, " ");
  return '"' + value.replace(/"/g, '""') + '"';
}

/**
 * Build a full CSV document from a header row and data rows. Prepends a UTF-8
 * BOM so Excel renders Unicode (accented names, non-Latin scripts) correctly,
 * and uses CRLF line endings per RFC 4180.
 */
export function toCsv(headers: string[], rows: unknown[][]): string {
  const BOM = "﻿";
  const lines = [headers, ...rows].map((row) => row.map(csvCell).join(","));
  return BOM + lines.join("\r\n");
}
