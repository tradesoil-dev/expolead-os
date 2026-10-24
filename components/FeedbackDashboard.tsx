"use client";

import { Fragment, useMemo, useState } from "react";
import { MessageSquareText, Download, UserPlus } from "lucide-react";
import { ALL_QUESTIONS, optionLabel, SURVEY_V2, type Answers } from "@/lib/survey-v2";
import { SURVEY_QUESTIONS as V1_QUESTIONS } from "@/lib/checkin-survey";
import { toCsv } from "@/lib/export/csv";

export type FeedbackRow = {
  id: string;
  kind: "pilot" | "public";
  name: string;
  company: string;
  email: string;
  campaign: string;
  source: string; // "pilot", "direct", or the ?src tag (linkedin, whatsapp...)
  role: string; // exhibit | visit | both
  date: string | null;
  sentAt: string | null;
  answeredAt: string | null;
  version: number;
  answers: Answers | null;
  wantsCall: boolean;
  wantsTry: boolean;
  whatsapp: string;
  linkedin: string;
  nextShow: string;
  consent: boolean;
  wantsResults: boolean;
};

// Below this many answers to a question, charts show counts ("2 of 3")
// instead of percentages, so a handful of replies is never shown as a statistic.
const PERCENT_FROM = 10;

const ROLE: Record<string, string> = { exhibit: "Exhibitor", visit: "Visitor", both: "Exhibitor and visitor" };

function fmt(s: string | null) {
  return s ? new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";
}

// Version 1 answers (the first pilot survey) are labelled with the old questions.
function answerText(r: FeedbackRow, qid: string): string {
  const v = r.answers?.[qid];
  if (v === undefined || v === null || v === "") return "";
  if (r.version >= SURVEY_V2) return optionLabel(qid, v);
  const q = V1_QUESTIONS.find((x) => x.id === qid);
  if (!q) return String(v);
  if (q.kind === "scale") return `${v} of 5`;
  if (q.kind === "text") return String(v);
  const lab = (id: string) => q.options?.find((o) => o.id === id)?.label ?? id;
  return Array.isArray(v) ? v.map(lab).join(", ") : lab(String(v));
}

export default function FeedbackDashboard({ rows }: { rows: FeedbackRow[] }) {
  const [campaign, setCampaign] = useState("all");
  const [source, setSource] = useState("all");
  const [open, setOpen] = useState<string | null>(null);

  const campaigns = useMemo(() => Array.from(new Set(rows.map((r) => r.campaign))).sort(), [rows]);
  const sources = useMemo(() => Array.from(new Set(rows.filter((r) => r.kind === "public").map((r) => r.source))).sort(), [rows]);

  const shown = rows.filter((r) => {
    if (campaign !== "all" && r.campaign !== campaign) return false;
    if (source === "pilot") return r.kind === "pilot";
    if (source === "public") return r.kind === "public";
    if (source !== "all") return r.kind === "public" && r.source === source;
    return true;
  });
  const answered = shown.filter((r) => r.answeredAt && r.answers);
  const v2 = answered.filter((r) => r.version >= SURVEY_V2);
  const pilots = shown.filter((r) => r.kind === "pilot");
  const pilotAnswered = pilots.filter((r) => r.answeredAt).length;
  const calls = shown.filter((r) => r.wantsCall).length;
  const tryers = shown.filter((r) => r.wantsTry);

  const card = "rounded-2xl border border-ink-200 bg-white shadow-card";

  function exportCsv() {
    const qs = ALL_QUESTIONS;
    const headers = ["Type", "Source", "Email", "Name", "Company", "Campaign", "Role", "Sent", "Answered", "Wants a call", "Wants to try", "WhatsApp", "LinkedIn", "Next show", "Contact consent", "Wants results", ...qs.map((q) => q.label)];
    const data = shown.map((r) => [
      r.kind === "pilot" ? "Pilot" : "Public", r.source, r.email, r.name, r.company, r.campaign, ROLE[r.role] ?? r.role,
      r.sentAt ? r.sentAt.slice(0, 10) : "", r.answeredAt ? r.answeredAt.slice(0, 10) : "",
      r.wantsCall ? "Yes" : "", r.wantsTry ? "Yes" : "", r.whatsapp, r.linkedin, r.nextShow,
      r.kind === "public" ? (r.consent ? "Yes" : "No") : "", r.kind === "public" ? (r.wantsResults ? "Yes" : "No") : "",
      ...qs.map((q) => answerText(r, q.id)),
    ]);
    const blob = new Blob([toCsv(headers, data)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = `expolead-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
    el.click();
    URL.revokeObjectURL(url);
  }

  if (rows.length === 0) {
    return (
      <div className={`${card} px-6 py-12 text-center`}>
        <MessageSquareText className="mx-auto h-8 w-8 text-emerald-500" />
        <p className="mt-3 text-sm font-semibold text-ink-900">No answers yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-500">
          Pilot check-ins are sent from Admin, Pilot invite. The public survey is at expoleados.com/survey/sial-paris-2026 (add ?src=linkedin to track where answers come from).
        </p>
      </div>
    );
  }

  const chartQs = ALL_QUESTIONS.filter((q) => q.kind !== "text" && q.kind !== "line");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <select value={campaign} onChange={(e) => setCampaign(e.target.value)} className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800">
          <option value="all">All campaigns</option>
          {campaigns.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={source} onChange={(e) => setSource(e.target.value)} className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800">
          <option value="all">All sources</option>
          <option value="pilot">Pilots only</option>
          <option value="public">Public survey only</option>
          {sources.map((s) => <option key={s} value={s}>Public: {s}</option>)}
        </select>
        <button type="button" onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { k: "Answers", v: String(answered.length) },
          { k: "Pilot check-ins", v: `${pilotAnswered}`, sub: `of ${pilots.length} answered` },
          { k: "Asked for a call", v: String(calls), amber: true },
          { k: "Want to try it", v: String(tryers.length), green: true },
        ].map((t) => (
          <div key={t.k} className={`${card} p-4`}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{t.k}</p>
            <p className={`mt-1.5 text-2xl font-bold ${t.amber ? "text-amber-700" : t.green ? "text-emerald-700" : "text-ink-900"}`}>
              {t.v} {t.sub && <span className="text-sm font-medium text-ink-400">{t.sub}</span>}
            </p>
          </div>
        ))}
      </div>

      {tryers.length > 0 && (
        <div className={card}>
          <div className="border-b border-ink-100 px-4 py-3">
            <p className="text-sm font-semibold text-ink-900">Want to try ExpoLead OS</p>
            <p className="text-[11px] text-ink-400">Public respondents who said yes. Invite them as a pilot in one click</p>
          </div>
          <div className="divide-y divide-ink-100">
            {tryers.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink-900">{r.name} <span className="font-normal text-ink-400">· {r.company}</span></p>
                  <p className="truncate text-xs text-ink-500">{[r.email, r.whatsapp, r.linkedin].filter(Boolean).join(" · ")}</p>
                  <p className="text-xs text-ink-400">Next show: {r.nextShow || "not given"}{r.consent ? "" : " · did not tick the contact box"}</p>
                </div>
                <a
                  href={`/admin/pilot-invite?email=${encodeURIComponent(r.email)}&name=${encodeURIComponent(r.name)}&company=${encodeURIComponent(r.company)}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Invite as pilot
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={card}>
        <div className="border-b border-ink-100 px-4 py-3">
          <p className="text-sm font-semibold text-ink-900">All answers</p>
          <p className="text-[11px] text-ink-400">Pilots and public respondents. Click View to read their full answers</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50 text-left text-xs font-medium text-ink-500">
                <th className="px-4 py-2.5">Person</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Campaign</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Flags</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {shown.map((r) => (
                <Fragment key={r.id}>
                  <tr className="hover:bg-ink-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-ink-900">{r.name || r.email}</span>
                      <span className="block text-xs text-ink-400">{[r.company, r.name ? r.email : ""].filter(Boolean).join(" · ")}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      {r.kind === "pilot" ? "Pilot" : `Public · ${r.source}`}
                      <span className="block text-xs text-ink-400">{ROLE[r.role] ?? r.role}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-600">{r.campaign}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {r.answeredAt ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Answered {fmt(r.answeredAt)}</span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">Waiting since {fmt(r.sentAt)}</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {r.wantsCall && <span className="mr-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">Wants a call</span>}
                      {r.wantsTry && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">Wants to try</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {r.answers && (
                        <button type="button" onClick={() => setOpen(open === r.id ? null : r.id)} className="text-xs font-semibold text-emerald-700 hover:underline">
                          {open === r.id ? "Hide" : "View"}
                        </button>
                      )}
                    </td>
                  </tr>
                  {open === r.id && r.answers && (
                    <tr className="bg-ink-50">
                      <td colSpan={6} className="px-4 py-4">
                        <dl className="grid gap-x-6 gap-y-2 text-[13px] md:grid-cols-[260px_1fr]">
                          {r.kind === "public" && (
                            <>
                              <dt className="text-ink-400">Contact</dt>
                              <dd className="text-ink-800">{[r.email, r.whatsapp, r.linkedin].filter(Boolean).join(" · ")}</dd>
                              <dt className="text-ink-400">Next trade show</dt>
                              <dd className="text-ink-800">{r.nextShow}</dd>
                              <dt className="text-ink-400">Ticked</dt>
                              <dd className="text-ink-800">{[r.wantsResults && "Send results", r.consent && "Can contact"].filter(Boolean).join(", ") || "Nothing"}</dd>
                            </>
                          )}
                          {(r.version >= SURVEY_V2 ? ALL_QUESTIONS.map((q) => ({ id: q.id, label: q.label })) : V1_QUESTIONS.map((q) => ({ id: q.id, label: q.label })))
                            .filter((q) => answerText(r, q.id))
                            .map((q) => (
                              <Fragment key={q.id}>
                                <dt className="text-ink-400">{q.label}</dt>
                                <dd className="text-ink-800">{answerText(r, q.id)}</dd>
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
          <p className="text-sm font-semibold text-ink-900">What exhibitors and visitors tell us</p>
          <p className="text-[11px] text-ink-400">
            {v2.length === 0
              ? "No answers yet for this selection."
              : `Each chart counts the people who were asked that question. Numbers, not percentages, until ${PERCENT_FROM} or more answered it`}
          </p>
        </div>
        {v2.length > 0 && (
          <div className="grid gap-x-8 gap-y-6 p-5 md:grid-cols-2">
            {chartQs.map((q) => {
              const asked = v2.filter((r) => r.answers?.[q.id] !== undefined);
              const n = asked.length;
              if (n === 0) return null;
              const countLabel = (c: number) => (n >= PERCENT_FROM ? `${Math.round((c / n) * 100)}%` : `${c} of ${n}`);
              if (q.kind === "scale") {
                const vals = asked.map((r) => r.answers![q.id]).filter((v): v is number => typeof v === "number");
                const avg = vals.reduce((x, y) => x + y, 0) / (vals.length || 1);
                return (
                  <div key={q.id}>
                    <p className="text-sm font-semibold text-ink-900">{q.label}</p>
                    <p className="mb-2 text-[11px] text-ink-400">Average on a 1 to 5 scale ({q.scale?.[0]} to {q.scale?.[1]}), {n} answered</p>
                    <p className="text-3xl font-bold text-ink-900">{avg.toFixed(1)} <span className="text-sm font-medium text-ink-400">of 5</span></p>
                  </div>
                );
              }
              const counts = (q.options ?? []).map((o) => ({
                label: o.label,
                c: asked.filter((r) => { const v = r.answers?.[q.id]; return Array.isArray(v) ? v.includes(o.id) : v === o.id; }).length,
              }));
              const max = Math.max(1, ...counts.map((x) => x.c));
              return (
                <div key={q.id}>
                  <p className="text-sm font-semibold text-ink-900">{q.label}</p>
                  <p className="mb-2.5 text-[11px] text-ink-400">{q.kind === "multi" ? "Tick all that apply" : "Pick one"} · {n} answered</p>
                  {counts.map((x) => (
                    <div key={x.label} className="mb-2 grid grid-cols-[minmax(0,160px)_1fr_56px] items-center gap-2.5 text-[13px] text-ink-600">
                      <span className="truncate" title={x.label}>{x.label}</span>
                      <div className="h-2.5 overflow-hidden rounded-full bg-emerald-50"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${(x.c / max) * 100}%` }} /></div>
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
            answered.filter((r) => typeof r.answers?.headache === "string").map((r) => (
              <blockquote key={r.id} className="my-2.5 border-l-[3px] border-emerald-500 px-3 py-1 text-sm text-ink-700">
                {String(r.answers!.headache)}
                <span className="mt-0.5 block text-xs text-ink-400">{[r.name || r.email, r.company, r.campaign].filter(Boolean).join(", ")}</span>
              </blockquote>
            ))
          )}
        </div>
        <p className="px-5 pb-4 text-[11px] leading-relaxed text-ink-400">
          For demos and the website, use these only as anonymous patterns (for example &ldquo;most exhibitors we asked still keep cards in a stack&rdquo;), never names or exact quotes without the person&rsquo;s written permission.
        </p>
      </div>
    </div>
  );
}
