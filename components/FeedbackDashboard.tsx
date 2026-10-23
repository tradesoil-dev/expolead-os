"use client";

import { Fragment, useMemo, useState } from "react";
import { MessageSquareText, Download } from "lucide-react";
import { SURVEY_QUESTIONS, type SurveyAnswers } from "@/lib/checkin-survey";
import { toCsv } from "@/lib/export/csv";

export type CheckinRow = {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  exhibition_name: string;
  campaign: string;
  survey_version: number;
  sent_at: string;
  answered_at: string | null;
  answers: SurveyAnswers | null;
  wants_call: boolean | null;
};

// Below this many answers, charts show counts ("2 of 3") instead of
// percentages, so a handful of replies is never presented as a statistic.
const PERCENT_FROM = 10;

function fmt(s: string | null) {
  return s ? new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";
}

function answerText(qid: string, v: SurveyAnswers[string] | undefined): string {
  if (v === undefined || v === null || v === "") return "";
  const q = SURVEY_QUESTIONS.find((x) => x.id === qid);
  if (!q) return String(v);
  if (q.kind === "scale") return `${v} of 5`;
  if (q.kind === "text") return String(v);
  const label = (id: string) => q.options?.find((o) => o.id === id)?.label ?? id;
  return Array.isArray(v) ? v.map(label).join(", ") : label(String(v));
}

export default function FeedbackDashboard({ rows }: { rows: CheckinRow[] }) {
  const [campaign, setCampaign] = useState("all");
  const [open, setOpen] = useState<string | null>(null);

  const campaigns = useMemo(() => Array.from(new Set(rows.map((r) => r.campaign))).sort(), [rows]);
  const shown = campaign === "all" ? rows : rows.filter((r) => r.campaign === campaign);
  const answered = shown.filter((r) => r.answered_at && r.answers);
  const n = answered.length;
  const calls = answered.filter((r) => r.wants_call).length;

  const card = "rounded-2xl border border-ink-200 bg-white shadow-card";
  const countLabel = (c: number) => (n >= PERCENT_FROM ? `${Math.round((c / n) * 100)}%` : `${c} of ${n}`);

  function exportCsv() {
    const headers = ["Email", "Name", "Company", "Campaign", "Exhibition", "Sent", "Answered", ...SURVEY_QUESTIONS.map((q) => q.label)];
    const data = shown.map((r) => [
      r.email,
      r.full_name ?? "",
      r.company_name ?? "",
      r.campaign,
      r.exhibition_name,
      r.sent_at.slice(0, 10),
      r.answered_at ? r.answered_at.slice(0, 10) : "",
      ...SURVEY_QUESTIONS.map((q) => answerText(q.id, r.answers?.[q.id])),
    ]);
    const blob = new Blob([toCsv(headers, data)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expolead-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (rows.length === 0) {
    return (
      <div className={`${card} px-6 py-12 text-center`}>
        <MessageSquareText className="mx-auto h-8 w-8 text-emerald-500" />
        <p className="mt-3 text-sm font-semibold text-ink-900">No check-ins sent yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-500">
          Send one from Admin, Pilot invite: each accepted pilot has a Send check-in button. Answers appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={campaign}
          onChange={(e) => setCampaign(e.target.value)}
          className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800"
        >
          <option value="all">All campaigns</option>
          {campaigns.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { k: "Sent", v: String(shown.length) },
          { k: "Answered", v: `${n}`, sub: `of ${shown.length}` },
          { k: "Response rate", v: shown.length ? `${Math.round((n / shown.length) * 100)}%` : "0%" },
          { k: "Asked for a call", v: String(calls), amber: true },
        ].map((t) => (
          <div key={t.k} className={`${card} p-4`}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{t.k}</p>
            <p className={`mt-1.5 text-2xl font-bold ${t.amber ? "text-amber-700" : "text-ink-900"}`}>
              {t.v} {t.sub && <span className="text-sm font-medium text-ink-400">{t.sub}</span>}
            </p>
          </div>
        ))}
      </div>

      <div className={card}>
        <div className="border-b border-ink-100 px-4 py-3">
          <p className="text-sm font-semibold text-ink-900">Check-ins</p>
          <p className="text-[11px] text-ink-400">Everyone a survey was sent to. Click View to read their full answers</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50 text-left text-xs font-medium text-ink-500">
                <th className="px-4 py-2.5">Person</th>
                <th className="px-4 py-2.5">Campaign</th>
                <th className="px-4 py-2.5">Sent</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Call</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {shown.map((r) => (
                <Fragment key={r.id}>
                  <tr className="hover:bg-ink-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-ink-900">{r.full_name || r.email}</span>
                      <span className="block text-xs text-ink-400">{[r.company_name, r.full_name ? r.email : ""].filter(Boolean).join(" · ")}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-600">{r.campaign}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-600">{fmt(r.sent_at)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {r.answered_at ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Answered {fmt(r.answered_at)}</span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">Waiting</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {r.wants_call ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">Wants a call</span>
                      ) : r.answered_at ? (
                        <span className="text-xs text-ink-400">Not now</span>
                      ) : (
                        <span className="text-xs text-ink-400">No answer yet</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {r.answers && (
                        <button
                          type="button"
                          onClick={() => setOpen(open === r.id ? null : r.id)}
                          className="text-xs font-semibold text-emerald-700 hover:underline"
                        >
                          {open === r.id ? "Hide" : "View"}
                        </button>
                      )}
                    </td>
                  </tr>
                  {open === r.id && r.answers && (
                    <tr className="bg-ink-50">
                      <td colSpan={6} className="px-4 py-4">
                        <dl className="grid gap-x-6 gap-y-2 text-[13px] md:grid-cols-[260px_1fr]">
                          {SURVEY_QUESTIONS.map((q) => (
                            <Fragment key={q.id}>
                              <dt className="text-ink-400">{q.label}</dt>
                              <dd className="text-ink-800">{answerText(q.id, r.answers?.[q.id]) || <span className="text-ink-300">Not answered</span>}</dd>
                            </Fragment>
                          ))}
                        </dl>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={card}>
        <div className="border-b border-ink-100 px-4 py-3">
          <p className="text-sm font-semibold text-ink-900">What exhibitors tell us</p>
          <p className="text-[11px] text-ink-400">
            {n === 0
              ? "No answers yet for this selection."
              : n < PERCENT_FROM
                ? `Counts from ${n} answer${n === 1 ? "" : "s"}. Shown as numbers, not percentages, until there are ${PERCENT_FROM} or more answers`
                : `From ${n} answers`}
          </p>
        </div>
        {n > 0 && (
          <div className="grid gap-x-8 gap-y-6 p-5 md:grid-cols-2">
            {SURVEY_QUESTIONS.filter((q) => q.kind !== "text").map((q) => {
              if (q.kind === "scale") {
                const vals = answered.map((r) => r.answers?.[q.id]).filter((v): v is number => typeof v === "number");
                const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
                return (
                  <div key={q.id}>
                    <p className="text-sm font-semibold text-ink-900">{q.label}</p>
                    <p className="mb-2 text-[11px] text-ink-400">Average on a 1 to 5 scale (5 is very easy)</p>
                    <p className="text-3xl font-bold text-ink-900">
                      {vals.length ? avg.toFixed(1) : "n/a"} <span className="text-sm font-medium text-ink-400">of 5</span>
                    </p>
                  </div>
                );
              }
              const counts = (q.options ?? []).map((o) => ({
                label: o.label,
                c: answered.filter((r) => {
                  const v = r.answers?.[q.id];
                  return Array.isArray(v) ? v.includes(o.id) : v === o.id;
                }).length,
              }));
              const max = Math.max(1, ...counts.map((x) => x.c));
              return (
                <div key={q.id}>
                  <p className="text-sm font-semibold text-ink-900">{q.label}</p>
                  <p className="mb-2.5 text-[11px] text-ink-400">{q.kind === "multi" ? "Tick all that apply" : "Pick one"}</p>
                  {counts.map((x) => (
                    <div key={x.label} className="mb-2 grid grid-cols-[minmax(0,150px)_1fr_56px] items-center gap-2.5 text-[13px] text-ink-600">
                      <span className="truncate" title={x.label}>{x.label}</span>
                      <div className="h-2.5 overflow-hidden rounded-full bg-emerald-50">
                        <div className="h-full rounded-full bg-emerald-600" style={{ width: `${(x.c / max) * 100}%` }} />
                      </div>
                      <span className="text-right font-semibold text-ink-900">{countLabel(x.c)}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={card}>
        <div className="border-b border-ink-100 px-4 py-3">
          <p className="text-sm font-semibold text-ink-900">In their words</p>
          <p className="text-[11px] text-ink-400">Answers to &ldquo;What is your biggest headache after a show?&rdquo;</p>
        </div>
        <div className="px-5 py-3">
          {answered.filter((r) => typeof r.answers?.headache === "string").length === 0 ? (
            <p className="py-4 text-sm text-ink-400">Nothing yet.</p>
          ) : (
            answered
              .filter((r) => typeof r.answers?.headache === "string")
              .map((r) => (
                <blockquote key={r.id} className="my-2.5 border-l-[3px] border-emerald-500 px-3 py-1 text-sm text-ink-700">
                  {String(r.answers!.headache)}
                  <span className="mt-0.5 block text-xs text-ink-400">{[r.full_name || r.email, r.campaign].join(", ")}</span>
                </blockquote>
              ))
          )}
        </div>
        <p className="px-5 pb-4 text-[11px] leading-relaxed text-ink-400">
          For demos and the website, use these only as anonymous patterns (for example &ldquo;most exhibitors we asked
          still keep cards in a stack&rdquo;), never names or exact quotes without the person&rsquo;s written permission.
        </p>
      </div>
    </div>
  );
}
