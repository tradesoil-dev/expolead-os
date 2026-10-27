"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Plus, Archive, Download, Upload, Trash2, Loader2, AlertTriangle, ExternalLink } from "lucide-react";
import { useConfirm } from "@/components/useConfirm";
import { decodeCsvBytes, parseCsv } from "@/lib/import/connections-import";
import type { CampaignRow } from "@/lib/survey-campaigns";

// Admin > Feedback, Public survey tab:
//  - SurveyLinksCard: create a survey link for a new show, open or close one.
//  - RetentionCard: the 24-month reminder, anonymised archive download,
//    delete answers past 24 months, and upload an archive file again.

const card = "rounded-2xl border border-ink-200 bg-white shadow-card";
const SITE = "https://expoleados.com";
const btn = "inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold disabled:opacity-50";

function slugPreview(label: string) {
  return label.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function Head({ icon, title, sub, right }: { icon: React.ReactNode; title: string; sub: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 px-4 py-3">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink-900">{title}</p>
        <p className="text-[11px] text-ink-400">{sub}</p>
      </div>
      {right}
    </div>
  );
}

export function SurveyLinksCard({ campaigns, counts }: { campaigns: CampaignRow[]; counts: Record<string, number> }) {
  const router = useRouter();
  const { confirm, ConfirmUI } = useConfirm();
  const [open, setOpen] = useState(false);
  const [exhibition, setExhibition] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; bad?: boolean } | null>(null);
  const slug = slugPreview(label);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy("new");
    setMsg(null);
    try {
      const res = await fetch("/api/admin/survey-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exhibition, label }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Could not create the survey.");
      setMsg({ text: `Survey created: ${SITE}/survey/${d.slug}` });
      setExhibition("");
      setLabel("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : "Could not create the survey.", bad: true });
    } finally {
      setBusy(null);
    }
  }

  async function remove(c: CampaignRow) {
    const ok = await confirm(
      `This deletes the survey link ${SITE}/survey/${c.slug} for good. Anyone who opens it will see "not found". This cannot be undone.`,
      { title: `Delete ${c.label}?`, confirmLabel: "Yes, delete" },
    );
    if (!ok) return;
    setBusy(c.slug);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/survey-campaigns?slug=${encodeURIComponent(c.slug)}`, { method: "DELETE" });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Could not delete the survey.");
      setMsg({ text: `${c.label} deleted.` });
      router.refresh();
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : "Could not delete the survey.", bad: true });
    } finally {
      setBusy(null);
    }
  }

  // Open surveys first, closed ones below; newest first within each group.
  const sorted = [...campaigns].sort((a, b) => Number(b.open) - Number(a.open) || (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  async function toggle(c: CampaignRow) {
    setBusy(c.slug);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/survey-campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: c.slug, open: !c.open }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Could not update the survey.");
      router.refresh();
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : "Could not update the survey.", bad: true });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={card}>
      {ConfirmUI}
      <Head
        icon={<Link2 className="h-4 w-4" />}
        title="Survey links"
        sub="One survey per show. Create a new one for your next campaign, close it when you are done"
        right={
          <button type="button" onClick={() => setOpen((o) => !o)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 text-sm font-semibold text-white hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> New survey
          </button>
        }
      />
      {open && (
        <form onSubmit={create} className="grid gap-3 border-b border-ink-100 bg-emerald-50/40 px-4 py-4 sm:grid-cols-2">
          <label className="block text-xs font-medium text-ink-600">
            Exhibition name
            <input value={exhibition} onChange={(e) => setExhibition(e.target.value)} required maxLength={80} placeholder="e.g. Gulfood" className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            <span className="mt-1 block font-normal text-ink-400">Used in the questions: &ldquo;How did Gulfood go?&rdquo;</span>
          </label>
          <label className="block text-xs font-medium text-ink-600">
            Survey name
            <input value={label} onChange={(e) => setLabel(e.target.value)} required maxLength={80} placeholder="e.g. Gulfood 2027" className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            <span className="mt-1 block truncate font-normal text-ink-400">Link: {SITE}/survey/{slug || "…"}</span>
          </label>
          <div className="flex items-center justify-between gap-2 sm:col-span-2">
            <button type="button" onClick={() => setOpen(false)} className={`${btn} border-ink-200 bg-white text-ink-700 hover:bg-ink-50`}>Back</button>
            <button type="submit" disabled={busy === "new" || slug.length < 3} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
              {busy === "new" && <Loader2 className="h-4 w-4 animate-spin" />} Create survey link
            </button>
          </div>
        </form>
      )}
      {msg && <p className={`mx-4 mt-3 rounded-lg px-3 py-2 text-sm ${msg.bad ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-800"}`}>{msg.text}</p>}
      <div className="divide-y divide-ink-100">
        {sorted.map((c) => (
          <div key={c.slug} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${c.open ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{c.open ? "Open" : "Closed"}</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink-900">{c.label}</p>
              <a href={`/survey/${c.slug}`} target="_blank" className="inline-flex items-center gap-1 truncate text-xs text-emerald-700 hover:underline">
                {SITE}/survey/{c.slug} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <span className="text-xs text-ink-500">{counts[c.label] ?? 0} {(counts[c.label] ?? 0) === 1 ? "answer" : "answers"}</span>
            {!c.hasAssets && <span className="text-[11px] text-ink-400">Share image: site default</span>}
            <button type="button" onClick={() => toggle(c)} disabled={busy === c.slug} className={`${btn} ${c.open ? "border-ink-200 bg-white text-ink-700 hover:bg-ink-50" : "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"}`}>
              {busy === c.slug && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {c.open ? "Close survey" : "Reopen"}
            </button>
            {!c.open && (counts[c.label] ?? 0) === 0 && c.slug !== "sial-paris-2026" && (
              <button type="button" onClick={() => remove(c)} disabled={busy === c.slug} className={`${btn} border-rose-200 bg-white text-rose-700 hover:bg-rose-50`} aria-label={`Delete ${c.label}`}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export type Retention = { overdue: number; dueSoon: number; oldest: string | null; total: number; archived: number };

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function RetentionCard({ retention }: { retention: Retention }) {
  const router = useRouter();
  const { confirm, ConfirmUI } = useConfirm();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; bad?: boolean } | null>(null);

  // Date the oldest live answer reaches 24 months.
  const due = retention.oldest ? (() => { const d = new Date(retention.oldest); d.setMonth(d.getMonth() + 24); return d; })() : null;

  async function deleteOld() {
    const ok = await confirm(
      `This permanently deletes ${retention.overdue} survey ${retention.overdue === 1 ? "answer" : "answers"} older than 24 months, with their names and contact details. Download the anonymised archive first if you want to keep learning from the answers.`,
      { title: "Delete answers past 24 months?", confirmLabel: "Yes, delete" },
    );
    if (!ok) return;
    setBusy("delete");
    setMsg(null);
    try {
      const res = await fetch("/api/admin/survey-archive?confirm=yes", { method: "DELETE" });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Could not delete.");
      setMsg({ text: `${d.deleted} ${d.deleted === 1 ? "answer" : "answers"} deleted.` });
      router.refresh();
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : "Could not delete.", bad: true });
    } finally {
      setBusy(null);
    }
  }

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy("upload");
    setMsg(null);
    try {
      const grid = parseCsv(decodeCsvBytes(await file.arrayBuffer()));
      const head = (grid[0] ?? []).map((h) => h.trim().toLowerCase());
      const col = (name: string) => head.indexOf(name.toLowerCase());
      const ix = { format: col("Format"), campaign: col("Campaign"), source: col("Channel"), role: col("Role"), month: col("Answered month"), answers: col("Answers (JSON)") };
      if (ix.format < 0 || ix.answers < 0 || ix.campaign < 0) throw new Error("This is not an ExpoLead survey archive file. Upload a file downloaded from this card.");
      const rows = grid.slice(1).filter((r) => r.some((c) => c.trim())).map((r) => ({
        campaign: r[ix.campaign] ?? "",
        source: ix.source >= 0 ? r[ix.source] ?? "" : "",
        role: ix.role >= 0 ? r[ix.role] ?? "" : "",
        month: ix.month >= 0 ? r[ix.month] ?? "" : "",
        answers: r[ix.answers] ?? "",
      }));
      const res = await fetch("/api/admin/survey-archive", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rows }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Could not upload.");
      setMsg({ text: `${d.added} added to the archive${d.duplicates ? `, ${d.duplicates} already there` : ""}${d.invalid ? `, ${d.invalid} rows skipped (not valid)` : ""}.` });
      router.refresh();
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : "Could not upload.", bad: true });
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className={card}>
      {ConfirmUI}
      <Head icon={<Archive className="h-4 w-4" />} title="Survey archive and 24-month rule" sub="Privacy Notice: survey answers and contact details are kept for up to 24 months, then deleted" />
      <div className="space-y-3 px-4 py-4 text-sm">
        {retention.overdue > 0 ? (
          <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-rose-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span><b>{retention.overdue} {retention.overdue === 1 ? "answer is" : "answers are"} past 24 months.</b> Download the anonymised archive, then delete them.</span>
          </p>
        ) : retention.dueSoon > 0 ? (
          <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span><b>{retention.dueSoon} {retention.dueSoon === 1 ? "answer reaches" : "answers reach"} 24 months within 30 days.</b> Plan to archive and delete them.</span>
          </p>
        ) : (
          <p className="text-ink-600">
            {due ? <>Nothing is due yet. The oldest answer reaches 24 months on <b className="text-ink-900">{fmt(due.toISOString())}</b>, and a reminder appears here 30 days before.</> : "No public answers yet."}
          </p>
        )}
        <p className="text-xs text-ink-500">
          The archive keeps the answers, the show, the channel and the month. It drops names, emails, companies, phone numbers and LinkedIn, so it can be kept and uploaded again to keep learning. {retention.archived > 0 && <b className="text-ink-700">{retention.archived} archived {retention.archived === 1 ? "answer is" : "answers are"} stored.</b>}
        </p>
        {msg && <p className={`rounded-lg px-3 py-2 ${msg.bad ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-800"}`}>{msg.text}</p>}
        <div className="flex flex-wrap gap-2">
          <a href="/api/admin/survey-archive?scope=all" className={`${btn} border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50`}>
            <Download className="h-4 w-4" /> Download anonymised archive
          </a>
          {retention.overdue > 0 && (
            <>
              <a href="/api/admin/survey-archive?scope=old" className={`${btn} border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50`}>
                <Download className="h-4 w-4" /> Download answers past 24 months
              </a>
              <button type="button" onClick={deleteOld} disabled={busy !== null} className={`${btn} border-rose-200 bg-white text-rose-700 hover:bg-rose-50`}>
                {busy === "delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete answers past 24 months
              </button>
            </>
          )}
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={busy !== null} className={`${btn} border-ink-200 bg-white text-ink-700 hover:bg-ink-50`}>
            {busy === "upload" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload archive file
          </button>
        </div>
      </div>
    </div>
  );
}
