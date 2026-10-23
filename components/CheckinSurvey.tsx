"use client";

import { useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { SURVEY_QUESTIONS, TEXT_MAX, fillTitle, type SurveyAnswers } from "@/lib/checkin-survey";

// The post-show check-in survey shown from the email link. Tap-to-answer
// chips, a progress bar over the required questions, and one Send button.
export default function CheckinSurvey({
  token,
  firstName,
  exhibition,
}: {
  token: string;
  firstName: string;
  exhibition: string;
}) {
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const required = SURVEY_QUESTIONS.filter((q) => q.required);
  const answeredCount = useMemo(
    () =>
      required.filter((q) => {
        const v = answers[q.id];
        if (Array.isArray(v)) return v.length > 0;
        return typeof v === "string" ? v.trim() !== "" : v !== undefined;
      }).length,
    [answers, required],
  );
  const ready = answeredCount === required.length;

  function toggle(qid: string, optId: string, multi: boolean) {
    setAnswers((a) => {
      if (!multi) {
        const next = { ...a };
        if (a[qid] === optId) delete next[qid];
        else next[qid] = optId;
        return next;
      }
      const cur = Array.isArray(a[qid]) ? (a[qid] as string[]) : [];
      const next = cur.includes(optId) ? cur.filter((x) => x !== optId) : [...cur, optId];
      return { ...a, [qid]: next };
    });
  }

  async function send() {
    if (!ready || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/checkin/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, answers }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not send your answers. Please try again.");
      setDone(true);
      window.scrollTo(0, 0);
    } catch (e: any) {
      setError(e.message || "Could not send your answers. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const chip = (on: boolean) =>
    `rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
      on ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
    }`;

  if (done) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <Check className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Thank you{firstName ? `, ${firstName}` : ""}</h1>
        <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-slate-600">
          Your answers help us make ExpoLead OS fit how you really work. Your {exhibition} contacts are still worth
          following up, and the steps in our email show how to bring them in.
        </p>
        <a
          href="/login"
          className="mt-6 inline-block rounded-xl border border-emerald-600 px-5 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
        >
          Open ExpoLead OS
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        How did {exhibition} go{firstName ? `, ${firstName}` : ""}?
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
        About 2 minutes. Tap the answers that fit. There are no wrong answers, and it helps us build ExpoLead OS around
        how exhibitors really work.
      </p>

      <div className="mb-6 mt-5 h-1.5 overflow-hidden rounded-full bg-emerald-100">
        <div
          className="h-full rounded-full bg-emerald-600 transition-all duration-300"
          style={{ width: `${(answeredCount / required.length) * 100}%` }}
        />
      </div>

      {SURVEY_QUESTIONS.map((q, i) => (
        <section key={q.id} className="mb-3.5 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-[15px] font-semibold leading-snug text-slate-900">
            {i + 1}. {fillTitle(q.title, exhibition)}
            {!q.required && <span className="font-normal text-slate-400"> (optional)</span>}
          </h2>
          <p className="mb-3.5 mt-1 text-[13px] text-slate-400">{q.hint}</p>

          {(q.kind === "multi" || q.kind === "single") && (
            <div className="flex flex-wrap gap-2">
              {q.options!.map((o) => {
                const v = answers[q.id];
                const on = q.kind === "multi" ? Array.isArray(v) && v.includes(o.id) : v === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(q.id, o.id, q.kind === "multi")}
                    className={chip(on)}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          )}

          {q.kind === "scale" && (
            <>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={answers[q.id] === n}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: n }))}
                    className={`${chip(answers[q.id] === n)} rounded-xl px-0 text-center`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="mt-1.5 flex justify-between text-xs text-slate-400">
                <span>Very easy</span>
                <span>Very hard</span>
              </div>
            </>
          )}

          {q.kind === "text" && (
            <textarea
              maxLength={TEXT_MAX}
              value={(answers[q.id] as string) ?? ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
              placeholder="For example: knowing who to follow up first"
              className="min-h-[90px] w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          )}
        </section>
      ))}

      {error && <p className="mb-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <button
        type="button"
        onClick={send}
        disabled={!ready || sending}
        className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 text-base font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-200"
      >
        {sending && <Loader2 className="h-4 w-4 animate-spin" />}
        Send my answers
      </button>
      <p className="mt-3 text-center text-xs leading-relaxed text-slate-400">
        {ready ? "Ready to send." : "Answer all questions not marked optional to send."} We use answers, without names,
        to improve ExpoLead OS and to understand how exhibitors work. We never share your name or individual answers.{" "}
        <a href="/privacy" className="text-emerald-600 hover:underline">
          Privacy Notice
        </a>
      </p>
    </div>
  );
}
