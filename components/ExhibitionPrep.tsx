"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useToast } from "@/components/useToast";
import type { AttendingAs } from "@/lib/types";

// A fixed, opinionated prep template (no build-your-own). The list adapts to
// whether you're exhibiting or visiting, but the steps are ready-made.
type Step = { key: string; label: string };

function stepsFor(attendingAs: AttendingAs): Step[] {
  const base: Step[] = [
    { key: "targets", label: "Line up target companies and people to meet" },
    { key: "materials", label: "Prepare materials — brochures, cards, price lists" },
    { key: "samples", label: "Pack samples to show or hand out" },
    { key: "travel", label: "Book travel and accommodation" },
    { key: "team", label: "Brief your team and split who covers what" },
    { key: "schedule", label: "Set meeting slots and a daily plan" },
    { key: "followup", label: "Agree your follow-up plan for after the show" },
  ];
  if (attendingAs === "exhibiting") {
    return [
      { key: "booth", label: "Confirm your booth booking and stand design" },
      { key: "shipping", label: "Arrange stand build, shipping and setup" },
      ...base,
    ];
  }
  return [{ key: "floorplan", label: "Get the floor plan and map your must-visit booths" }, ...base];
}

export default function ExhibitionPrep({
  exhibitionId,
  attendingAs,
  initialCompleted,
}: {
  exhibitionId: string;
  attendingAs: AttendingAs;
  initialCompleted: string[];
}) {
  const router = useRouter();
  const { showToast, ToastUI } = useToast();
  const steps = stepsFor(attendingAs);
  const [done, setDone] = useState<Set<string>>(new Set(initialCompleted ?? []));
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const completed = steps.filter((s) => done.has(s.key)).length;
  const pct = steps.length ? Math.round((completed / steps.length) * 100) : 0;

  async function toggle(key: string) {
    if (!isSupabaseConfigured) return;
    const nextDone = new Set(done);
    if (nextDone.has(key)) nextDone.delete(key);
    else nextDone.add(key);
    setDone(nextDone);
    setSavingKey(key);
    const { error } = await createClient()
      .from("exhibitions")
      .update({ prep_completed: Array.from(nextDone) })
      .eq("id", exhibitionId);
    setSavingKey(null);
    if (error) {
      // revert on failure
      setDone(done);
      showToast("Could not save. Please try again.", "error");
      return;
    }
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
      {ToastUI}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Prepare for this show</h2>
          <p className="mt-0.5 text-xs text-ink-400">A ready-made checklist to get show-ready.</p>
        </div>
        <span className="shrink-0 text-xs font-medium text-ink-500">
          {completed}/{steps.length} done
        </span>
      </div>

      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
      </div>

      <ul className="space-y-1">
        {steps.map((s) => {
          const checked = done.has(s.key);
          return (
            <li key={s.key}>
              <button
                type="button"
                onClick={() => toggle(s.key)}
                disabled={savingKey === s.key}
                className="flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-ink-50 disabled:opacity-60"
              >
                <span
                  className={`mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded border ${
                    checked ? "border-emerald-500 bg-emerald-500 text-white" : "border-ink-300 bg-white"
                  }`}
                  style={{ height: "18px", width: "18px" }}
                >
                  {checked && (
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className={`text-sm leading-6 ${checked ? "text-ink-400 line-through" : "text-ink-700"}`}>
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
