// Client-safe constants for the workspace currency, mirroring the pattern in
// quantity-units.ts. One currency per workspace: an ROI ratio built from mixed
// currencies would be meaningless, so we do not convert or combine.

export const CURRENCIES = [
  { value: "USD", label: "USD (US dollar)" },
  { value: "EUR", label: "EUR (euro)" },
  { value: "GBP", label: "GBP (pound sterling)" },
  { value: "LKR", label: "LKR (Sri Lankan rupee)" },
  { value: "INR", label: "INR (Indian rupee)" },
  { value: "CNY", label: "CNY (Chinese yuan)" },
  { value: "AED", label: "AED (UAE dirham)" },
  { value: "JPY", label: "JPY (Japanese yen)" },
  { value: "AUD", label: "AUD (Australian dollar)" },
  { value: "SGD", label: "SGD (Singapore dollar)" },
];

export const DEFAULT_CURRENCY = "USD";

/** "USD 46,000". No decimals: exhibition deals are not priced to the cent. */
export function formatMoney(value: number | null | undefined, currency: string): string {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "—";
  return `${currency} ${Math.round(Number(value)).toLocaleString()}`;
}

type Opp = {
  deal_value?: number | string | null;
  status?: string | null;
  exhibition?: string | null;
};

export type RoiTotals = {
  won: number;
  open: number;
  lost: number;
  cost: number;
  /** Won divided by cost. Null when there is no cost, so we never divide by zero. */
  ratio: number | null;
  hasAnyValue: boolean;
};

const num = (v: unknown) => {
  const n = parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : 0;
};

/**
 * Splits deal values by outcome and works out the return.
 *
 * Return counts WON business only. Including open pipeline would produce a
 * flattering number that means nothing, so open is reported beside the ratio
 * rather than inside it.
 */
export function calcRoi(opportunities: Opp[], cost: number): RoiTotals {
  let won = 0;
  let open = 0;
  let lost = 0;
  let hasAnyValue = false;

  for (const o of opportunities) {
    const v = num(o.deal_value);
    if (v > 0) hasAnyValue = true;
    if (o.status === "won") won += v;
    else if (o.status === "lost") lost += v;
    else open += v;
  }

  return {
    won,
    open,
    lost,
    cost,
    ratio: cost > 0 ? won / cost : null,
    hasAnyValue,
  };
}

/** "5.5×", or "—" when there is no cost to divide by. */
export function formatRatio(ratio: number | null): string {
  if (ratio === null) return "—";
  if (ratio === 0) return "0×";
  return `${ratio >= 10 ? Math.round(ratio) : ratio.toFixed(1)}×`;
}
