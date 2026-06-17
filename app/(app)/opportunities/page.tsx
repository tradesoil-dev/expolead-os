import PageHeader from "@/components/PageHeader";
import AddOpportunityForm from "@/components/AddOpportunityForm";
import OpportunitiesExportButton from "@/components/OpportunitiesExportButton";
import { getOpportunities, getExhibitions } from "@/lib/data";
import { getTrialStatus } from "@/lib/trial";

const STAGES = [
  { key: "researching", label: "Qualified" },
  { key: "contacted", label: "Pricing" },
  { key: "evaluating", label: "Evaluation" },
  { key: "negotiating", label: "Negotiating" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
];

function getFollowUpHealth(opp: any) {
  if (!opp.next_follow_up_date || opp.next_follow_up_completed) return null;

  const followUpDate = new Date(opp.next_follow_up_date);
  const today = new Date();

  followUpDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const daysUntil = Math.ceil(
    (followUpDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntil < 0) {
    return {
      label: "At Risk",
      dueText: `Overdue by ${Math.abs(daysUntil)} day${
        Math.abs(daysUntil) === 1 ? "" : "s"
      }`,
      className: "bg-red-50 text-red-700",
      dotClassName: "bg-red-500",
    };
  }

  if (daysUntil === 0) {
    return {
      label: "Attention",
      dueText: "Due today",
      className: "bg-amber-50 text-amber-700",
      dotClassName: "bg-amber-500",
    };
  }

  if (daysUntil <= 7) {
    return {
      label: "Attention",
      dueText: `Due in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`,
      className: "bg-amber-50 text-amber-700",
      dotClassName: "bg-amber-500",
    };
  }

  return {
    label: "Healthy",
    dueText: `Due in ${daysUntil} days`,
    className: "bg-emerald-50 text-emerald-700",
    dotClassName: "bg-emerald-500",
  };
}

export default async function OpportunitiesPage() {
  const [opportunities, exhibitions, trial] = await Promise.all([
    getOpportunities(),
    getExhibitions(),
    getTrialStatus(),
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

  const potentialVolume = opportunities.reduce(
    (total, opportunity) => total + Number(opportunity.quantity || 0),
    0
  );

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

      <AddOpportunityForm exhibitions={exhibitions} isLocked={trial.isExpired} />

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
              {potentialVolume.toLocaleString()} MT
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

        {opportunities.length === 0 ? (
          <p className="mt-4 text-sm text-ink-500">
            No opportunities created yet.
          </p>
        ) : (
          <div className="mt-5 flex gap-4 overflow-x-auto pb-3 xl:grid xl:grid-cols-6">
            {STAGES.map((stage) => {
              const stageItems = opportunities.filter(
                (opportunity) => opportunity.status === stage.key
              );

              return (
                <div
                  key={stage.key}
                  className="min-h-[260px] w-[260px] shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-3 xl:w-auto"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800">
                      {stage.label}
                    </h3>

                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600">
                      {stageItems.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {stageItems.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-400">
                        No opportunities
                      </p>
                    ) : (
                      stageItems.map((opp) => {
                        const health = getFollowUpHealth(opp);

                        return (
                          <a
                            key={opp.id}
                            href={`/opportunities/${opp.id}`}
                            className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                          >
                            {health && (
                              <div className="mb-3 flex flex-col items-start gap-2">
                                <div
                                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${health.className}`}
                                >
                                  <span
                                    className={`h-2 w-2 rounded-full ${health.dotClassName}`}
                                  />
                                  {health.label}
                                </div>

                                <p className="text-xs font-medium text-slate-500">
  {health.dueText}
</p>
                              </div>
                            )}

                            <div className="space-y-2">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {opp.name}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {opp.product || "No product added"}
                                </p>
                              </div>

                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                                  opp.priority === "high"
                                    ? "bg-red-50 text-red-700"
                                    : opp.priority === "medium"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {opp.priority || "low"}
                              </span>
                            </div>

                            <div className="mt-3 space-y-1 text-xs text-slate-600">
  <p>
    <span className="font-semibold">Volume:</span>{" "}
    {opp.quantity || "-"} MT
  </p>

  <p>
    <span className="font-semibold">Market:</span>{" "}
    {opp.destination_market || "-"}
  </p>
</div>

                            
                          </a>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}