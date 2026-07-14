"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "./useToast";

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
      dueText: `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? "" : "s"}`,
      className: "bg-red-50 text-red-700",
      dotClassName: "bg-red-500",
    };
  }
  if (daysUntil === 0) {
    return { label: "Attention", dueText: "Due today", className: "bg-amber-50 text-amber-700", dotClassName: "bg-amber-500" };
  }
  if (daysUntil <= 7) {
    return { label: "Attention", dueText: `Due in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`, className: "bg-amber-50 text-amber-700", dotClassName: "bg-amber-500" };
  }
  return { label: "Healthy", dueText: `Due in ${daysUntil} days`, className: "bg-emerald-50 text-emerald-700", dotClassName: "bg-emerald-500" };
}

export default function OpportunityBoard({ opportunities, quantityUnit = "MT" }: { opportunities: any[]; quantityUnit?: string }) {
  const router = useRouter();
  const { showToast, ToastUI } = useToast();
  const [items, setItems] = useState(opportunities);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);

  useEffect(() => { setItems(opportunities); }, [opportunities]);

  async function moveTo(id: string, stageKey: string) {
    const opp = items.find((o) => o.id === id);
    if (!opp || opp.status === stageKey) return;

    const previous = items;
    setItems((list) => list.map((o) => (o.id === id ? { ...o, status: stageKey } : o)));

    const supabase = createClient();
    const { error } = await supabase.from("opportunities").update({ status: stageKey }).eq("id", id);
    if (error) {
      setItems(previous);
      showToast(error.message || "Couldn't move opportunity.", "error");
      return;
    }
    await supabase.from("opportunity_status_history").insert({ opportunity_id: id, status: stageKey });
    showToast(`Moved to ${STAGES.find((s) => s.key === stageKey)?.label}.`, "success");
    router.refresh();
  }

  if (items.length === 0) {
    return <p className="mt-4 text-sm text-ink-500">No opportunities created yet.</p>;
  }

  return (
    <>
      {ToastUI}
      <p className="mt-3 text-xs text-slate-400">Drag a card between stages to update its status.</p>
      <div className="mt-3 flex gap-4 overflow-x-auto pb-3 xl:grid xl:grid-cols-6">
        {STAGES.map((stage) => {
          const stageItems = items.filter((opp) => opp.status === stage.key);
          const isOver = overStage === stage.key;
          return (
            <div
              key={stage.key}
              onDragOver={(e) => { e.preventDefault(); if (overStage !== stage.key) setOverStage(stage.key); }}
              onDragLeave={() => setOverStage((s) => (s === stage.key ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                setOverStage(null);
                if (dragId) moveTo(dragId, stage.key);
                setDragId(null);
              }}
              className={`min-h-[260px] w-[260px] shrink-0 rounded-2xl border p-3 transition-colors xl:w-auto ${isOver ? "border-emerald-400 bg-emerald-50/60" : "border-slate-200 bg-slate-50"}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">{stage.label}</h3>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600">{stageItems.length}</span>
              </div>

              <div className="space-y-3">
                {stageItems.length === 0 ? (
                  <p className={`rounded-xl border border-dashed p-3 text-xs transition-colors ${isOver ? "border-emerald-300 bg-white text-emerald-600" : "border-slate-200 bg-white text-slate-400"}`}>
                    {isOver ? "Drop here" : "No opportunities"}
                  </p>
                ) : (
                  stageItems.map((opp) => {
                    const health = getFollowUpHealth(opp);
                    return (
                      <div
                        key={opp.id}
                        draggable
                        onDragStart={(e) => { setDragId(opp.id); e.dataTransfer.effectAllowed = "move"; }}
                        onDragEnd={() => setDragId(null)}
                        onClick={() => router.push(`/opportunities/${opp.id}`)}
                        className={`block cursor-grab rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing ${dragId === opp.id ? "opacity-50" : ""}`}
                      >
                        {health && (
                          <div className="mb-3 flex flex-col items-start gap-2">
                            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${health.className}`}>
                              <span className={`h-2 w-2 rounded-full ${health.dotClassName}`} />
                              {health.label}
                            </div>
                            <p className="text-xs font-medium text-slate-500">{health.dueText}</p>
                          </div>
                        )}

                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{opp.name}</p>
                            <p className="mt-1 text-xs text-slate-500">{opp.product || "No product added"}</p>
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
                          <p><span className="font-semibold">Volume:</span> {opp.quantity || "-"} {opp.quantity_unit || quantityUnit}</p>
                          <p><span className="font-semibold">Market:</span> {opp.destination_market || "-"}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
