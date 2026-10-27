"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { MessageSquareText, Download, UserPlus, Copy, Check, Share2, Image as ImageIcon } from "lucide-react";
import { ALL_QUESTIONS, optionLabel, SURVEY_V2, type Answers } from "@/lib/survey-v2";
import type { CampaignRow } from "@/lib/survey-campaigns";
import { SurveyLinksCard, RetentionCard, type Retention } from "@/components/SurveyAdminCards";
import { SURVEY_QUESTIONS as V1_QUESTIONS } from "@/lib/checkin-survey";
import { toCsv } from "@/lib/export/csv";

export type FeedbackRow = {
  id: string;
  kind: "pilot" | "public";
  archived?: boolean; // anonymised answer uploaded again from the survey archive
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

export type FeedbackTab = "public" | "pilot";

// Below this many answers to a question, charts show counts ("2 of 3")
// instead of percentages, so a handful of replies is never shown as a statistic.
const PERCENT_FROM = 10;
const SITE = "https://expoleados.com";
const ROLE: Record<string, string> = { exhibit: "Exhibitor", visit: "Visitor", both: "Exhibitor and visitor" };
const CHANNELS: { src: string; label: string }[] = [
  { src: "linkedin", label: "LinkedIn" },
  { src: "whatsapp", label: "WhatsApp" },
  { src: "facebook", label: "Facebook" },
  { src: "instagram", label: "Instagram" },
  { src: "email", label: "Email" },
  { src: "other", label: "Other" },
];
const card = "rounded-2xl border border-ink-200 bg-white shadow-card";

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

// Admin > Feedback: two tabs. Public survey (share links, answers, charts) and
// Pilot feedback (check-ins sent from Pilot invite). Each tab's numbers,
// charts and CSV cover only its own group, so the two never mix.
export default function FeedbackDashboard({
  rows,
  campaigns,
  retention,
  initialTab = "public",
}: {
  rows: FeedbackRow[];
  campaigns: CampaignRow[];
  retention: Retention;
  initialTab?: FeedbackTab;
}) {
  const [tab, setTab] = useState<FeedbackTab>(initialTab);
  const publicRows = useMemo(() => rows.filter((r) => r.kind === "public"), [rows]);
  const pilotRows = useMemo(() => rows.filter((r) => r.kind === "pilot"), [rows]);

  const tabBtn = (t: FeedbackTab, label: string, n: number) => (
    <button
      type="button"
      onClick={() => setTab(t)}
      aria-pressed={tab === t}
      className={`inline-flex items-center gap-2 border-b-2 px-1 pb-2.5 text-sm font-semibold transition-colors ${tab === t ? "border-emerald-600 text-emerald-700" : "border-transparent text-ink-500 hover:text-ink-800"}`}
    >
      {label}
      <span className={`rounded-full px-2 py-0.5 text-[11px] ${tab === t ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{n}</span>
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="flex gap-6 border-b border-ink-200">
        {tabBtn("public", "Public survey", publicRows.length)}
        {tabBtn("pilot", "Pilot feedback", pilotRows.length)}
      </div>
      {tab === "public" ? <PublicPanel rows={publicRows} campaigns={campaigns} retention={retention} /> : <PilotPanel rows={pilotRows} />}
    </div>
  );
}

/* ---------------------------- Public survey tab ---------------------------- */

function PublicPanel({ rows: allRows, campaigns, retention }: { rows: FeedbackRow[]; campaigns: CampaignRow[]; retention: Retention }) {
  const [campaign, setCampaign] = useState("all");
  const [source, setSource] = useState("all");
  const archivedCount = allRows.filter((r) => r.archived).length;
  const [includeArchive, setIncludeArchive] = useState(true);
  const rows = includeArchive ? allRows : allRows.filter((r) => !r.archived);
  const sources = useMemo(() => Array.from(new Set(rows.map((r) => r.source))).sort(), [rows]);
  const liveRows = allRows.filter((r) => !r.archived);
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of liveRows) m[r.campaign] = (m[r.campaign] ?? 0) + 1;
    return m;
  }, [liveRows]);
  const campaignOptions = Array.from(new Set([...campaigns.map((c) => c.label), ...rows.map((r) => r.campaign)])).sort();

  const shown = rows.filter((r) => (campaign === "all" || r.campaign === campaign) && (source === "all" || r.source === source));
  const tryers = shown.filter((r) => r.wantsTry);
  const exhibitors = shown.filter((r) => r.role !== "visit").length;

  return (
    <div className="space-y-5">
      <SurveyLinksCard campaigns={campaigns} counts={counts} />
      {campaigns.filter((c) => c.open).map((c) => <ShareCard key={c.slug} slug={c.slug} label={c.label} exhibition={c.exhibition} hasAssets={c.hasAssets} rows={liveRows.filter((r) => r.campaign === c.label)} />)}

      <div className="flex flex-wrap items-center gap-2">
        <select value={campaign} onChange={(e) => setCampaign(e.target.value)} className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800">
          <option value="all">All campaigns</option>
          {campaignOptions.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={source} onChange={(e) => setSource(e.target.value)} className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800">
          <option value="all">All channels</option>
          {sources.map((s) => <option key={s} value={s}>{s === "direct" ? "No tag" : s}</option>)}
        </select>
        <CsvButton rows={shown.filter((r) => !r.archived)} name="public-survey" />
        {archivedCount > 0 && (
          <label className="ml-auto inline-flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" checked={includeArchive} onChange={(e) => setIncludeArchive(e.target.checked)} className="h-4 w-4 accent-emerald-600" />
            Include {archivedCount} archived {archivedCount === 1 ? "answer" : "answers"}
          </label>
        )}
      </div>

      <Tiles items={[
        { k: "Answers", v: String(shown.length) },
        { k: "Exhibitors", v: String(exhibitors), sub: `${shown.length - exhibitors} ${shown.length - exhibitors === 1 ? "visitor" : "visitors"}` },
        { k: "Want to try it", v: String(tryers.length), tone: "green" },
        { k: "Agreed to be contacted", v: String(shown.filter((r) => r.consent).length) },
      ]} />

      {tryers.length > 0 && (
        <div className={card}>
          <CardHead title="Want to try ExpoLead OS" sub="Respondents who said yes. Invite them as a pilot in one click" />
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

      {shown.length === 0 ? (
        <Empty text="No public answers yet. Copy a link above and share it on LinkedIn, WhatsApp and so on." />
      ) : (
        <>
          <AnswersTable rows={shown} kind="public" />
          <Charts rows={shown} title="What exhibitors and visitors tell us" />
          <Quotes rows={shown} />
        </>
      )}
      <RetentionCard retention={retention} />
    </div>
  );
}

function ShareCard({ slug, label, exhibition, hasAssets, rows }: { slug: string; label: string; exhibition: string; hasAssets: boolean; rows: FeedbackRow[] }) {
  const [copied, setCopied] = useState<string | null>(null);
  const base = `${SITE}/survey/${slug}`;
  const linkFor = (src: string) => `${base}?src=${src}`;
  const count = (src: string) => rows.filter((r) => r.source === src).length;
  const untagged = rows.filter((r) => r.source === "direct").length;
  const message = `${exhibition} is over. How serious are you about turning those contacts into repeatable revenue? Take this 3 minute post-show check and get your personal report: ${linkFor("whatsapp")}`;

  async function copy(src: string) {
    try {
      await navigator.clipboard.writeText(linkFor(src));
      setCopied(src);
      setTimeout(() => setCopied((c) => (c === src ? null : c)), 1800);
    } catch {
      window.prompt("Copy this link", linkFor(src));
    }
  }

  const images = [
    { file: `${slug}-linkedin-facebook.png`, label: "LinkedIn and Facebook post" },
    { file: `${slug}-instagram-feed.png`, label: "Instagram feed post" },
    { file: `${slug}-story.png`, label: "Instagram and Facebook story" },
  ];

  return (
    <div className={card}>
      <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 px-4 py-3">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><Share2 className="h-4 w-4" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink-900">Share links · {label}</p>
          <p className="text-[11px] text-ink-400">Use the link for each channel, so you can see where answers come from</p>
        </div>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          Share on WhatsApp
        </a>
      </div>
      <div className="divide-y divide-ink-100">
        {CHANNELS.map((ch) => (
          <div key={ch.src} className="flex items-center gap-3 px-4 py-2.5 text-sm">
            <span className="min-w-0 flex-1 font-medium text-ink-800 sm:w-24 sm:flex-none">{ch.label}</span>
            <code className="hidden min-w-0 flex-1 truncate rounded-md bg-ink-50 px-2 py-1 text-xs text-ink-600 sm:block">{linkFor(ch.src)}</code>
            <span className="w-20 shrink-0 text-right text-xs text-ink-500">{count(ch.src)} {count(ch.src) === 1 ? "answer" : "answers"}</span>
            <button
              type="button"
              onClick={() => copy(ch.src)}
              className="inline-flex min-h-8 w-[84px] shrink-0 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              {copied === ch.src ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-ink-100 px-4 py-3">
        {hasAssets ? <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600"><ImageIcon className="h-3.5 w-3.5" /> Post images:</span> : <span className="text-xs text-ink-400">No post images for this survey yet. Ask Claude to make them.</span>}
        {hasAssets && images.map((im) => (
          <a key={im.file} href={`/survey-assets/${im.file}`} download className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 text-xs font-medium text-ink-700 hover:bg-ink-50">
            <Download className="h-3.5 w-3.5" /> {im.label}
          </a>
        ))}
        {untagged > 0 && <span className="ml-auto text-xs text-ink-400">{untagged} answered from the plain link (no tag)</span>}
      </div>
    </div>
  );
}

/* ---------------------------- Pilot feedback tab --------------------------- */

function PilotPanel({ rows }: { rows: FeedbackRow[] }) {
  const campaigns = useMemo(() => Array.from(new Set(rows.map((r) => r.campaign))).sort(), [rows]);
  const [campaign, setCampaign] = useState("all");
  const shown = rows.filter((r) => campaign === "all" || r.campaign === campaign);
  const answered = shown.filter((r) => r.answeredAt).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <select value={campaign} onChange={(e) => setCampaign(e.target.value)} className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800">
          <option value="all">All campaigns</option>
          {campaigns.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <CsvButton rows={shown} name="pilot-feedback" />
        <Link href="/admin/pilot-invite" className="ml-auto inline-flex min-h-9 items-center rounded-lg border border-emerald-200 bg-white px-3.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">
          Send a check-in from Pilot invite
        </Link>
      </div>

      <Tiles items={[
        { k: "Check-ins sent", v: String(shown.length) },
        { k: "Answered", v: String(answered), sub: `of ${shown.length}` },
        { k: "Response rate", v: shown.length ? `${Math.round((answered / shown.length) * 100)}%` : "0%" },
        { k: "Asked for a call", v: String(shown.filter((r) => r.wantsCall).length), tone: "amber" },
      ]} />

      {shown.length === 0 ? (
        <Empty text="No check-ins sent yet. Open Pilot invite and press Send check-in on an accepted pilot." />
      ) : (
        <>
          <AnswersTable rows={shown} kind="pilot" />
          <Charts rows={shown.filter((r) => r.answeredAt)} title="What pilots tell us" />
          <Quotes rows={shown.filter((r) => r.answeredAt)} />
        </>
      )}
    </div>
  );
}

/* ------------------------------ Shared pieces ------------------------------ */

function CardHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="border-b border-ink-100 px-4 py-3">
      <p className="text-sm font-semibold text-ink-900">{title}</p>
      <p className="text-[11px] text-ink-400">{sub}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className={`${card} px-6 py-10 text-center`}>
      <MessageSquareText className="mx-auto h-8 w-8 text-emerald-500" />
      <p className="mx-auto mt-3 max-w-md text-sm text-ink-500">{text}</p>
    </div>
  );
}

function Tiles({ items }: { items: { k: string; v: string; sub?: string; tone?: "amber" | "green" }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((t) => (
        <div key={t.k} className={`${card} p-4`}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{t.k}</p>
          <p className={`mt-1.5 text-2xl font-bold ${t.tone === "amber" ? "text-amber-700" : t.tone === "green" ? "text-emerald-700" : "text-ink-900"}`}>
            {t.v} {t.sub && <span className="text-sm font-medium text-ink-400">{t.sub}</span>}
          </p>
        </div>
      ))}
    </div>
  );
}

function CsvButton({ rows, name }: { rows: FeedbackRow[]; name: string }) {
  function exportCsv() {
    const qs = ALL_QUESTIONS;
    const headers = ["Type", "Channel", "Email", "Name", "Company", "Campaign", "Role", "Sent", "Answered", "Wants a call", "Wants to try", "WhatsApp", "LinkedIn", "Next show", "Contact consent", "Wants results", ...qs.map((q) => q.label)];
    const data = rows.map((r) => [
      r.kind === "pilot" ? "Pilot" : "Public", r.kind === "pilot" ? "" : r.source, r.email, r.name, r.company, r.campaign, ROLE[r.role] ?? r.role,
      r.sentAt ? r.sentAt.slice(0, 10) : "", r.answeredAt ? r.answeredAt.slice(0, 10) : "",
      r.wantsCall ? "Yes" : "", r.wantsTry ? "Yes" : "", r.whatsapp, r.linkedin, r.nextShow,
      r.kind === "public" ? (r.consent ? "Yes" : "No") : "", r.kind === "public" ? (r.wantsResults ? "Yes" : "No") : "",
      ...qs.map((q) => answerText(r, q.id)),
    ]);
    const blob = new Blob([toCsv(headers, data)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = `expolead-${name}-${new Date().toISOString().slice(0, 10)}.csv`;
    el.click();
    URL.revokeObjectURL(url);
  }
  return (
    <button type="button" onClick={exportCsv} disabled={!rows.length} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">
      <Download className="h-4 w-4" /> Export CSV
    </button>
  );
}

function AnswersTable({ rows, kind }: { rows: FeedbackRow[]; kind: "pilot" | "public" }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className={card}>
      <CardHead title={kind === "pilot" ? "Check-ins" : "All answers"} sub="Click View to read their full answers" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50 text-left text-xs font-medium text-ink-500">
              <th className="px-4 py-2.5">Person</th>
              <th className="px-4 py-2.5">{kind === "pilot" ? "Campaign" : "Channel"}</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Flags</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.map((r) => (
              <Fragment key={r.id}>
                <tr className="hover:bg-ink-50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink-900">{r.name || r.email}</span>
                    <span className="block text-xs text-ink-400">{[r.company, r.name ? r.email : ""].filter(Boolean).join(" · ")}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {kind === "pilot" ? r.campaign : r.source === "direct" ? "No tag" : r.source}
                    {kind === "public" && <span className="block text-xs text-ink-400">{ROLE[r.role] ?? r.role}</span>}
                  </td>
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
                    <td colSpan={5} className="px-4 py-4">
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
                        {(r.version >= SURVEY_V2 ? ALL_QUESTIONS : V1_QUESTIONS)
                          .map((q) => ({ id: q.id, label: q.label }))
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
  );
}

function Charts({ rows, title }: { rows: FeedbackRow[]; title: string }) {
  const v2 = rows.filter((r) => r.answers && r.version >= SURVEY_V2);
  const chartQs = ALL_QUESTIONS.filter((q) => q.kind !== "text" && q.kind !== "line");
  return (
    <div className={card}>
      <CardHead
        title={title}
        sub={v2.length === 0 ? "No answers yet for this selection." : `Each chart counts the people who were asked that question. Numbers, not percentages, until ${PERCENT_FROM} or more answered it`}
      />
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
  );
}

function Quotes({ rows }: { rows: FeedbackRow[] }) {
  const said = rows.filter((r) => typeof r.answers?.headache === "string");
  return (
    <div className={card}>
      <CardHead title="In their words" sub={"Answers to “What is your biggest headache after a show?”"} />
      <div className="px-5 py-3">
        {said.length === 0 ? (
          <p className="py-4 text-sm text-ink-400">Nothing yet.</p>
        ) : (
          said.map((r) => (
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
  );
}
