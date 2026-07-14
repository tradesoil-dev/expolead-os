// Client-safe constants for the workspace quantity unit. Kept separate from
// quantity-unit.ts (which imports the server Supabase client) so client
// components can use these without pulling next/headers into the bundle.

// The units a workspace can measure deal quantity in. MT suits bulk commodities
// (chemicals, oils, grains); the rest open the product to packaged goods,
// apparel, machinery, and other product trade.
export const QUANTITY_UNITS = [
  { value: "MT", label: "MT (metric tonnes)" },
  { value: "kg", label: "kg (kilograms)" },
  { value: "units", label: "Units" },
  { value: "pieces", label: "Pieces" },
  { value: "cartons", label: "Cartons" },
  { value: "containers", label: "Containers" },
];

export const DEFAULT_QUANTITY_UNIT = "MT";

// Totals opportunity quantities grouped by their unit, so a diversified trader's
// mixed pipeline reads honestly (e.g. "500 MT · 2,000 cartons") instead of
// summing units that cannot be added. An opportunity with no unit falls back to
// the workspace default. Returns "0 {default}" when there is nothing to total.
export function formatGroupedVolume(
  items: { quantity: unknown; quantity_unit?: string | null }[],
  defaultUnit: string
): string {
  const totals = new Map<string, number>();
  for (const it of items) {
    const n = parseFloat(String(it.quantity ?? ""));
    if (!Number.isFinite(n) || n === 0) continue;
    const unit = it.quantity_unit || defaultUnit;
    totals.set(unit, (totals.get(unit) || 0) + n);
  }
  if (totals.size === 0) return `0 ${defaultUnit}`;
  return [...totals.entries()]
    .map(([unit, n]) => `${n.toLocaleString()} ${unit}`)
    .join(" · ");
}
