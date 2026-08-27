"use client";

import { useMemo, useState } from "react";
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
    { key: "materials", label: "Prepare materials: brochures, cards, price lists" },
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
  firstName,
}: {
  exhibitionId: string;
  attendingAs: AttendingAs;
  initialCompleted: string[];
  firstName?: string;
}) {
  const router = useRouter();
  const { showToast, ToastUI } = useToast();
  const steps = stepsFor(attendingAs);
  const [done, setDone] = useState<Set<string>>(new Set(initialCompleted ?? []));
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const completed = steps.filter((s) => done.has(s.key)).length;
  const pct = steps.length ? Math.round((completed / steps.length) * 100) : 0;
  const allDone = completed === steps.length;

  // Confetti particles, regenerated each time a celebration fires. Only present
  // client-side after a user click, so Math.random causes no hydration issues.
  const confetti = useMemo(() => {
    if (!celebrate) return [];
    const colors = ["#10b981", "#34d399", "#f59e0b", "#f43f5e", "#38bdf8", "#a78bfa"];
    return Array.from({ length: 44 }, (_, i) => ({
      left: Math.random() * 100,
      cx: (Math.random() * 2 - 1) * 70,
      dur: 1.3 + Math.random() * 0.9,
      delay: Math.random() * 0.25,
      rot: Math.random() * 360,
      color: colors[i % colors.length],
    }));
  }, [celebrate]);

  function fireCelebration() {
    setCelebrate(true);
    window.setTimeout(() => setCelebrate(false), 1900);
  }

  async function toggle(key: string) {
    if (!isSupabaseConfigured) return;
    const nextDone = new Set(done);
    if (nextDone.has(key)) nextDone.delete(key);
    else nextDone.add(key);
    // Did this tick just complete the whole list? (Celebrate only on that edge,
    // never on load or when a box is un-ticked.)
    const nextCompleted = steps.filter((s) => nextDone.has(s.key)).length;
    const justCompleted = completed < steps.length && nextCompleted === steps.length;
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
    if (justCompleted) fireCelebration();
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-ink-200 bg-white p-5 shadow-card">
      {ToastUI}

      {celebrate && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
          {confetti.map((c, i) => (
            <span
              key={i}
              className="confetti-piece"
              style={{
                left: `${c.left}%`,
                background: c.color,
                ["--cx" as string]: `${c.cx}px`,
                ["--dur" as string]: `${c.dur}s`,
                ["--delay" as string]: `${c.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Prepare for this show</h2>
          <p className="mt-0.5 text-xs text-ink-400">A ready-made checklist to get show-ready.</p>
        </div>
        {allDone ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            🎉 Show-ready
          </span>
        ) : (
          <span className="shrink-0 text-xs font-medium text-ink-500">
            {completed}/{steps.length} done
          </span>
        )}
      </div>

      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
      </div>

      {allDone && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
          {firstName ? `${firstName}, you're all set for this show, let's capture some connections.` : "You're all set for this show, let's capture some connections."}
        </div>
      )}

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
