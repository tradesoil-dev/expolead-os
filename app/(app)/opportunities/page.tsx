import PageHeader from "@/components/PageHeader";
import OpportunitiesToolbar from "@/components/OpportunitiesToolbar";
import OpportunitiesExportButton from "@/components/OpportunitiesExportButton";
import OpportunityBoard from "@/components/OpportunityBoard";
import { getOpportunities, getExhibitions, getSuppliers } from "@/lib/data";
import { getTrialStatus } from "@/lib/trial";
import { getQuantityUnit } from "@/lib/quantity-unit";
import { getCurrency } from "@/lib/currency";
import { formatGroupedVolume } from "@/lib/quantity-units";
import { formatMoney } from "@/lib/currencies";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { HeadlineStrip, type Headline } from "@/components/ReportsOverview";
import { pctChange } from "@/components/DeltaChip";

const STAGES = [
  { key: "qualified", label: "Qualified", color: "#64748b" },
  { key: "pricing", label: "Pricing", color: "#f59e0b" },
  { key: "evaluation", label: "Evaluation", color: "#38bdf8" },
  { key: "negotiating", label: "Negotiating", color: "#8b5cf6" },
  { key: "won", label: "Won", color: "#10b981" },
  { key: "lost", label: "Lost", color: "#fb7185" },
] as const;

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ exhibition?: string }>;
}) {
  const { exhibition: selected = "" } = await searchParams;
  const [allOpportunities, exhibitions, suppliers, trial, quantityUnit, currency, closeHistory] = await Promise.all([
    getOpportunities(),
    getExhibitions(),
    getSuppliers(),
    getTrialStatus(),
    getQuantityUnit(),
    getCurrency(),
    // When deals were marked won or lost, for the win-rate change (best effort).
    (async () => {
      if (!isSupabaseConfigured) return [] as { opportunity_id: string; status: string; created_at: string }[];
      const supabase = await createClient();
      const { data } = await supabase.from("opportunity_status_history").select("opportunity_id, status, created_at").in("status", ["won", "lost"]);
      return (data ?? []) as { opportunity_id: string; status: string; created_at: string }[];
    })(),
  ]);

  const connectionOptions = suppliers.map((s) => ({
    id: s.id,
    company_name: s.company_name,
    exhibition_name: s.exhibition?.name ?? null,
    booth_number: s.booth_number ?? null,
    // Booth applies only when the user visited their booth (met at their booth,
    // or a visiting show). It does not when they came to the user's own stand.
    visited_their_booth: s.met_at ? s.met_at === "their_booth" : s.exhibition?.attending_as !== "exhibiting",
    products: (s.products ?? []).map((p) => p.name),
  }));

  // Every count, volume and column below works off the filtered set, so the
  // stat cards and the board can never disagree with the chosen show.
  const opportunities = selected
    ? allOpportunities.filter((o: any) => o.exhibition === selected)
    : allOpportunities;

  const exhibitionNames = Array.from(
    new Set(allOpportunities.map((o: any) => o.exhibition).filter(Boolean) as string[])
  ).sort();

  const pipelineCounts = {
    qualified: opportunities.filter((opportunity) => opportunity.status === "researching").length,
    pricing: opportunities.filter((opportunity) => opportunity.status === "contacted").length,
    evaluation: opportunities.filter((opportunity) => opportunity.status === "evaluating").length,
    negotiating: opportunities.filter((opportunity) => opportunity.status === "negotiating").length,
    won: opportunities.filter((opportunity) => opportunity.status === "won").length,
    lost: opportunities.filter((opportunity) => opportunity.status === "lost").length,
  };

  const totalClosed = pipelineCounts.won + pipelineCounts.lost;

  const winRate =
    totalClosed === 0
      ? 0
      : Math.round((pipelineCounts.won / totalClosed) * 100);

  // Open pipeline only: exclude won and lost so this matches the "active
  // opportunities" count beside it and the Dashboard and Reports volumes.
  const activeOpps = opportunities.filter(
    (opportunity) =>
      opportunity.status !== "won" && opportunity.status !== "lost"
  );

  // Volume now sums each opportunity's product lines (grouped by unit).
  const potentialVolume = formatGroupedVolume(
    activeOpps.flatMap((o: any) => o.products ?? []),
    quantityUnit
  );

  const activeCount =
    pipelineCounts.qualified +
    pipelineCounts.pricing +
    pipelineCounts.evaluation +
    pipelineCounts.negotiating;

  // Headline numbers for the selected show (or all): new in the last 30 days
  // vs the 30 before, and win rate now vs before the last 30 days.
  const DAY = 86400000;
  const now = Date.now();
  const t = (s: string | null | undefined) => (s ? new Date(s).getTime() : 0);
  const notLost = opportunities.filter((o) => o.status !== "lost");
  const new30 = opportunities.filter((o) => t(o.created_at) >= now - 30 * DAY);
  const newPrev = opportunities.filter((o) => t(o.created_at) >= now - 60 * DAY && t(o.created_at) < now - 30 * DAY);
  const value = (list: typeof opportunities) => list.reduce((s, o) => s + (Number(o.deal_value) || 0), 0);
  const openValue = value(activeOpps);
  const added30 = value(notLost.filter((o) => t(o.created_at) >= now - 30 * DAY));
  const addedPrev = value(notLost.filter((o) => t(o.created_at) >= now - 60 * DAY && t(o.created_at) < now - 30 * DAY));
  // Latest won/lost date per deal; deals closed with no recorded date count as before.
  const closedAt = new Map<string, number>();
  for (const h of closeHistory) closedAt.set(h.opportunity_id, Math.max(closedAt.get(h.opportunity_id) ?? 0, t(h.created_at)));
  const closedBefore = opportunities.filter((o) => (o.status === "won" || o.status === "lost") && (closedAt.get(o.id) ?? 0) < now - 30 * DAY);
  const prevWon = closedBefore.filter((o) => o.status === "won").length;
  const prevRate = closedBefore.length ? Math.round((prevWon / closedBefore.length) * 100) : null;
  const winDelta = totalClosed && prevRate !== null && closedBefore.length < totalClosed ? winRate - prevRate : null;

  const headlines: Headline[] = [
    { label: "Open opportunities", value: String(activeCount), delta: pctChange(new30.length, newPrev.length), sub: `${new30.length} new in 30 days, vs ${newPrev.length} before` },
    { label: "Open pipeline", value: formatMoney(openValue, currency), delta: pctChange(added30, addedPrev), sub: `+${formatMoney(added30, currency)} added in 30 days` },
    { label: "Win rate", value: totalClosed ? `${winRate}%` : "—", delta: winDelta, unit: " pts", sub: totalClosed ? `${pipelineCounts.won} won of ${totalClosed} closed` : "No closed deals yet" },
    { label: "Pipeline volume", value: potentialVolume, delta: null, chip: { text: "Open deals", tone: "neutral" }, sub: "Across all product lines" },
  ];
  const stageTotal = opportunities.length;

  return (
    <main className="min-h-screen space-y-6 bg-slate-50 p-6">
      <PageHeader
        title="Opportunities"
        subtitle="Track exhibition conversations from qualified interest to revenue"
      />

      <OpportunitiesToolbar
        exhibitions={exhibitions}
        connections={connectionOptions}
        isLocked={trial.isExpired}
        quantityUnit={quantityUnit}
        currency={currency}
        exhibitionNames={exhibitionNames}
        selected={selected}
      />

      <HeadlineStrip items={headlines} />

      <div className="rounded-2xl border border-ink-200 bg-white px-4 py-3.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[13.5px] font-semibold text-ink-900">Pipeline by stage</h2>
          <span className="text-xs text-ink-400">{stageTotal} {stageTotal === 1 ? "opportunity" : "opportunities"}</span>
        </div>
        <div className="my-2.5 flex h-3 gap-[3px] overflow-hidden rounded-full bg-slate-100">
          {stageTotal > 0 &&
            STAGES.map((s) =>
              pipelineCounts[s.key] > 0 ? <div key={s.key} style={{ flexGrow: pipelineCounts[s.key], flexBasis: 0, background: s.color }} title={`${s.label}: ${pipelineCounts[s.key]}`} /> : null,
            )}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[12.5px] text-ink-500">
          {STAGES.map((s) => (
            <span key={s.key}>
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.label}
              <b className="ml-1 font-semibold text-ink-900">{pipelineCounts[s.key]}</b>
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-ink-900">
            Opportunity Pipeline ({opportunities.length})
          </h2>

          <div className="flex items-center gap-2">
            <OpportunitiesExportButton opportunities={opportunities} canExport={trial.canExport} exhibition={selected} />
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              Board View
            </span>
          </div>
        </div>

        <OpportunityBoard opportunities={opportunities} quantityUnit={quantityUnit} />
      </div>
    </main>
  );
}