"use client";

import { calcRoi, formatMoney, formatRatio } from "@/lib/currencies";

type Opp = {
  deal_value?: number | null;
  status?: string | null;
  exhibition?: string | null;
};

type ExhibitionCost = { name: string; cost: number | null };

type Props = {
  opportunities: Opp[];
  exhibitionCosts: ExhibitionCost[];
  currency: string;
  /** Selected exhibition filter, empty string means all. */
  exhibition: string;
};

/**
 * Return on investment per exhibition: what the show cost against what it won.
 *
 * Deliberately hidden until there is something to show. A panel of dashes is
 * worse than no panel, and both inputs are optional by design so most users
 * will not have filled them in on day one.
 */
export default function RoiPanel({ opportunities, exhibitionCosts, currency, exhibition }: Props) {
  const scoped = exhibition ? exhibitionCosts.filter((e) => e.name === exhibition) : exhibitionCosts;
  const totalCost = scoped.reduce((sum, e) => sum + (Number(e.cost) || 0), 0);

  const roi = calcRoi(opportunities, totalCost);

  // Nothing to say yet.
  if (!roi.hasAnyValue && totalCost === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ink-200 bg-white p-5">
        <p className="text-sm font-bold text-ink-900">Return on investment</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
          Add what a show cost you when you create or edit an exhibition, and a deal value on the
          opportunities that matter. This panel then shows what each exhibition returned. Both
          fields are optional.
        </p>
      </div>
    );
  }

  const totalValue = roi.won + roi.open + roi.lost;
  const pct = (n: number) => (totalValue > 0 ? (n / totalValue) * 100 : 0);

  const rows = scoped
    .map((e) => {
      const forShow = opportunities.filter((o) => o.exhibition === e.name);
      return { name: e.name, ...calcRoi(forShow, Number(e.cost) || 0) };
    })
    .filter((r) => r.hasAnyValue || r.cost > 0)
    .sort((a, b) => (b.ratio ?? -1) - (a.ratio ?? -1));

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-bold text-ink-900">Return on investment</p>
        <p className="text-xs text-ink-400">{exhibition || "All exhibitions"}</p>
      </div>

      <div className="mt-4 grid grid-cols-1 divide-y divide-ink-100 rounded-lg border border-ink-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-4">
          <p className="text-2xl font-black text-emerald-600">{formatRatio(roi.ratio)}</p>
          <p className="mt-0.5 text-xs text-ink-500">
            {roi.ratio === null ? "Add a show cost to see this" : "Returned on money spent"}
          </p>
        </div>
        <div className="p-4">
          <p className="text-2xl font-black text-ink-900">{formatMoney(roi.won, currency)}</p>
          <p className="mt-0.5 text-xs text-ink-500">Won</p>
        </div>
        <div className="p-4">
          <p className="text-2xl font-black text-ink-900">{formatMoney(roi.cost, currency)}</p>
          <p className="mt-0.5 text-xs text-ink-500">Cost of attending</p>
        </div>
      </div>

      {totalValue > 0 && (
        <>
          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-ink-100">
            <div style={{ width: `${pct(roi.won)}%`, background: "#10b981" }} />
            <div style={{ width: `${pct(roi.open)}%`, background: "#a7f3d0" }} />
            <div style={{ width: `${pct(roi.lost)}%`, background: "#e2e8f0" }} />
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink-600">
            <span className="flex items-center gap-1.5">
              <i className="inline-block h-2 w-2 rounded-sm" style={{ background: "#10b981" }} />
              Won {formatMoney(roi.won, currency)}
            </span>
            <span className="flex items-center gap-1.5">
              <i className="inline-block h-2 w-2 rounded-sm" style={{ background: "#a7f3d0" }} />
              Still open {formatMoney(roi.open, currency)}
            </span>
            <span className="flex items-center gap-1.5">
              <i className="inline-block h-2 w-2 rounded-sm" style={{ background: "#e2e8f0" }} />
              Lost {formatMoney(roi.lost, currency)}
            </span>
          </div>
        </>
      )}

      {rows.length > 1 && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 text-left text-[11px] uppercase tracking-wide text-ink-400">
                <th className="pb-2 pr-3 font-semibold">Exhibition</th>
                <th className="pb-2 pr-3 text-right font-semibold">Cost</th>
                <th className="pb-2 pr-3 text-right font-semibold">Won</th>
                <th className="pb-2 pr-3 text-right font-semibold">Open</th>
                <th className="pb-2 text-right font-semibold">Return</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-b border-ink-100">
                  <td className="py-2.5 pr-3 text-ink-900">{r.name}</td>
                  <td className="py-2.5 pr-3 text-right text-ink-600">{r.cost > 0 ? Math.round(r.cost).toLocaleString() : "—"}</td>
                  <td className="py-2.5 pr-3 text-right text-ink-600">{Math.round(r.won).toLocaleString()}</td>
                  <td className="py-2.5 pr-3 text-right text-ink-600">{Math.round(r.open).toLocaleString()}</td>
                  <td className="py-2.5 text-right font-semibold text-emerald-700">
                    {r.cost === 0 ? "—" : r.won === 0 ? "Too early" : formatRatio(r.ratio)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs leading-relaxed text-ink-400">
        Return counts won business only. Open pipeline is shown separately so the figure cannot
        flatter itself. All amounts in {currency}.
      </p>
    </div>
  );
}
