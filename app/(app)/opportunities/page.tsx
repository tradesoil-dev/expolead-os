import PageHeader from "@/components/PageHeader";
import AddOpportunityForm from "@/components/AddOpportunityForm";
import OpportunitiesExportButton from "@/components/OpportunitiesExportButton";
import OpportunityBoard from "@/components/OpportunityBoard";
import { getOpportunities, getExhibitions } from "@/lib/data";
import { getTrialStatus } from "@/lib/trial";
import { getQuantityUnit } from "@/lib/quantity-unit";
import { formatGroupedVolume } from "@/lib/quantity-units";

export default async function OpportunitiesPage() {
  const [opportunities, exhibitions, trial, quantityUnit] = await Promise.all([
    getOpportunities(),
    getExhibitions(),
    getTrialStatus(),
    getQuantityUnit(),
  ]);

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

  const potentialVolume = formatGroupedVolume(activeOpps, quantityUnit);

  const activeCount =
    pipelineCounts.qualified +
    pipelineCounts.pricing +
    pipelineCounts.evaluation +
    pipelineCounts.negotiating;

  return (
    <main className="min-h-screen space-y-6 bg-slate-50 p-6">
      <PageHeader
        title="Opportunities"
        subtitle="Track exhibition conversations from qualified interest to revenue"
      />

      <AddOpportunityForm exhibitions={exhibitions} isLocked={trial.isExpired} quantityUnit={quantityUnit} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{pipelineCounts.qualified}</p>
          <p className="text-xs text-slate-500">Qualified</p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{pipelineCounts.pricing}</p>
          <p className="text-xs text-slate-500">Pricing</p>
        </div>

        <div className="rounded-xl border border-sky-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-sky-600">{pipelineCounts.evaluation}</p>
          <p className="text-xs text-slate-500">Evaluation</p>
        </div>

        <div className="rounded-xl border border-violet-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-violet-600">{pipelineCounts.negotiating}</p>
          <p className="text-xs text-slate-500">Negotiating</p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{pipelineCounts.won}</p>
          <p className="text-xs text-slate-500">Won</p>
        </div>

        <div className="rounded-xl border border-red-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{pipelineCounts.lost}</p>
          <p className="text-xs text-slate-500">Lost</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{winRate}%</p>
          <p className="text-xs text-slate-500">Win Rate</p>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Pipeline Volume
            </p>
            <p className="text-2xl font-bold text-emerald-600">
              {potentialVolume}
            </p>
          </div>

          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            {activeCount} Active Opportunities
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-ink-900">
            Opportunity Pipeline ({opportunities.length})
          </h2>

          <div className="flex items-center gap-2">
            <OpportunitiesExportButton opportunities={opportunities} />
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