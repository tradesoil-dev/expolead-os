"use client";

import { useState } from "react";
import { Sparkles, Loader2, ClipboardList, Bot } from "lucide-react";
import { formatMoney } from "@/lib/currencies";
import AiMarkdown from "@/components/AiMarkdown";

type Facts = {
  connections: number;
  visited: number;
  remaining: number;
  followUpsScheduled: number;
  pipelineValue: number;
  opportunities: number;
  quotationRequested: number;
  highPriority: number;
  avgDealValue: number;
  metrics: { visitRate: number; followUpCoverage: number; quotationRate: number; highPriorityShare: number };
  connectionList: { company: string; status: string; visited: boolean; priority: string; country: string | null }[];
};

type Result = { facts: Facts; observations: string; model: string | null };

// Slice 1 of the AI Exhibition Intelligence assistant: a one-click grounded
// summary of a single exhibition. Recorded facts come straight from the data;
// AI observations are clearly labelled and never mixed with the facts.
export default function ExhibitionAssistant({
  exhibitionId,
  exhibitionName,
  currency,
}: {
  exhibitionId: string;
  exhibitionName: string;
  currency: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/assistant/summarize-exhibition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exhibitionId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Could not generate a summary.");
        return;
      }
      setResult(data as Result);
    } catch {
      setError("Could not reach the assistant. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-white text-emerald-600">
            <Bot className="h-3.5 w-3.5" />
          </span>
          AI assistant
        </h2>
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Summarising…" : result ? "Summarise again" : "Summarise with AI"}
        </button>
      </div>

      {!result && !loading && !error && (
        <p className="mt-2 text-xs text-emerald-800">
          Get a grounded recap of {exhibitionName}: recorded facts from your data, plus AI observations on what to prioritise. Nothing is invented.
        </p>
      )}

      {error && <p className="mt-3 text-sm font-medium text-amber-700">{error}</p>}

      {result && (
        <div className="mt-3 space-y-4">
          <div className="rounded-lg border border-emerald-100 bg-white p-3.5">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700">
              <ClipboardList className="h-3.5 w-3.5" /> Recorded facts
            </p>
            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-3">
              <Fact label="Connections" value={String(result.facts.connections)} />
              <Fact label="Visited" value={String(result.facts.visited)} />
              <Fact label="Remaining" value={String(result.facts.remaining)} />
              <Fact label="Follow-ups scheduled" value={String(result.facts.followUpsScheduled)} />
              <Fact label="Opportunities" value={String(result.facts.opportunities)} />
              <Fact label="Pipeline value" value={formatMoney(result.facts.pipelineValue, currency)} />
            </div>

            <div className="mt-3 flex flex-wrap gap-2 border-t border-emerald-50 pt-3">
              <Metric label="Visit rate" value={`${result.facts.metrics.visitRate}%`} />
              <Metric label="Follow-up coverage" value={`${result.facts.metrics.followUpCoverage}%`} />
              <Metric label="Quotation stage" value={`${result.facts.metrics.quotationRate}%`} />
              <Metric label="High priority" value={`${result.facts.metrics.highPriorityShare}%`} />
              {result.facts.opportunities > 0 && (
                <Metric label="Avg deal value" value={formatMoney(result.facts.avgDealValue, currency)} />
              )}
            </div>
          </div>

          <div className="rounded-lg border border-emerald-100 bg-white p-3.5">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700">
              <Bot className="h-3.5 w-3.5" /> AI observations
            </p>
            <AiMarkdown text={result.observations} className="mt-2" />
            <p className="mt-2.5 text-[11px] leading-relaxed text-ink-400">
              AI-generated from your own data. Treat as observations, not recorded facts, and check against the records before acting.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 sm:block">
      <span className="text-ink-500">{label}</span>
      <span className="font-semibold text-ink-900 tabular-nums">{value}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs">
      <span className="text-emerald-700">{label}</span>
      <span className="font-bold tabular-nums text-emerald-900">{value}</span>
    </span>
  );
}
