"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
  ScanLine,
  History,
  Undo2,
  ExternalLink,
} from "lucide-react";
import ModernSelect from "@/components/Select";
import { useConfirm } from "@/components/useConfirm";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  buildTemplateCsv,
  decodeCsvBytes,
  parseImportCsv,
  normalizeKey,
  IMPORT_MAX_BYTES,
  IMPORT_MAX_ROWS,
  type ParsedRow,
} from "@/lib/import/connections-import";
import {
  findDuplicates,
  normalizeCompany,
  type ExistingSupplier,
  type ExistingContact,
} from "@/lib/duplicates";
import {
  INTEREST_TYPES,
  PRIORITIES,
  FOLLOW_UP_STATUSES,
  INTEREST_STYLES,
  PRIORITY_STYLES,
  STATUS_STYLES,
} from "@/lib/types";

type Ex = { id: string; name: string };

export type ImportHistoryItem = {
  id: string;
  number: number;
  fileName: string;
  exhibition: string | null;
  imported: number;
  stillThere: number;
  undone: boolean;
  createdAt: string;
};

type Check = {
  parsed: ParsedRow;
  // "duplicate" = probably already in their connections (or twice in the file),
  // "same_company" = known company, different person (fine, just a note).
  dup: { kind: "duplicate" | "same_company"; note: string; supplierId?: string } | null;
};

type Filter = "all" | "ready" | "dups" | "problems";

type Result = { imported: number; total: number; limitReached?: boolean; error?: string };

const card = "rounded-xl border border-ink-200 bg-white shadow-card";
const btnPrimary =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50";
const btnSecondary =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-ink-200 bg-white px-4 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50";
const chip = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset";
const neutralChip = `${chip} bg-ink-50 text-ink-700 ring-ink-300/40`;

function BackLink() {
  return (
    <Link
      href="/connections"
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink-200 bg-white pl-2.5 pr-3.5 text-sm font-medium text-ink-700 shadow-sm transition-colors hover:border-emerald-300 hover:text-emerald-700"
    >
      <ArrowLeft className="h-4 w-4" /> Connections
    </Link>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function ImportConnections({
  exhibitions,
  remaining,
  history,
}: {
  exhibitions: Ex[];
  remaining: number | null;
  history: ImportHistoryItem[];
}) {
  const router = useRouter();
  const { confirm, ConfirmUI } = useConfirm();
  const fileRef = useRef<HTMLInputElement>(null);
  const [exhibitionId, setExhibitionId] = useState(exhibitions[0]?.id ?? "");
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState(false);
  const [undoing, setUndoing] = useState<string | null>(null);
  const [undoError, setUndoError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [existing, setExisting] = useState<{ suppliers: ExistingSupplier[]; contacts: ExistingContact[] } | null>(null);

  // The user's own connections, for the duplicate check (RLS scopes this).
  // Reloaded after an import or undo so a second file is checked against it.
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setExisting({ suppliers: [], contacts: [] });
      return;
    }
    let alive = true;
    const supabase = createClient();
    Promise.all([
      supabase.from("suppliers").select("id, company_name, exhibition_id"),
      supabase.from("contacts").select("supplier_id, full_name, email, phone, whatsapp"),
    ]).then(([s, c]) => {
      if (!alive) return;
      setExisting({
        suppliers: (s.data ?? []) as ExistingSupplier[],
        contacts: (c.data ?? []) as ExistingContact[],
      });
    });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const exOptions = useMemo(
    () => [...exhibitions.map((e) => ({ value: e.id, label: e.name })), { value: "", label: "No exhibition" }],
    [exhibitions],
  );
  const exName = exhibitions.find((e) => e.id === exhibitionId)?.name ?? null;

  function downloadTemplate() {
    const blob = new Blob([buildTemplateCsv()], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expolead-connections-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onFile(file: File | undefined) {
    setFileError(null);
    setChecks(null);
    setResult(null);
    if (!file) return;
    setFileName(file.name);
    if (/\.(xlsx|xls|numbers|ods)$/i.test(file.name)) {
      setFileError("This is a spreadsheet file, not a CSV. In Excel choose File > Save As > CSV UTF-8, then upload that file.");
      return;
    }
    if (file.size > IMPORT_MAX_BYTES) {
      setFileError("This file is larger than 2 MB. Please split it into smaller files.");
      return;
    }
    const text = decodeCsvBytes(await file.arrayBuffer());
    const parsed = parseImportCsv(text);
    if (parsed.missingCompanyColumn) {
      setFileError("We could not find a Company column. Please use the ExpoLead template and keep its first row (the column names) as it is.");
      return;
    }
    if (parsed.rows.length === 0) {
      setFileError("No connections found in this file. Add your rows under the column names and try again.");
      return;
    }

    const sup = existing?.suppliers ?? [];
    const con = existing?.contacts ?? [];
    const seenEmail = new Map<string, number>();
    const seenPerson = new Map<string, number>();
    const list: Check[] = parsed.rows.map((p) => {
      if (!p.row) return { parsed: p, dup: null };
      const r = p.row;
      const c = r.contact;
      // Twice in the same file?
      const emailKey = c?.email ?? "";
      const personKey = `${normalizeCompany(r.company_name)}|${normalizeKey(c?.full_name ?? "")}`;
      const firstEmail = emailKey ? seenEmail.get(emailKey) : undefined;
      const firstPerson = seenPerson.get(personKey);
      if (emailKey && firstEmail === undefined) seenEmail.set(emailKey, p.line);
      if (firstPerson === undefined) seenPerson.set(personKey, p.line);
      if (firstEmail !== undefined || firstPerson !== undefined) {
        return { parsed: p, dup: { kind: "duplicate", note: `Same as sheet row ${firstEmail ?? firstPerson} in this file` } };
      }
      // Already in their connections?
      const m = findDuplicates(
        {
          company_name: r.company_name,
          full_name: c?.full_name ?? "",
          email: c?.email ?? "",
          phone: c?.phone ?? "",
          whatsapp: c?.whatsapp ?? "",
        },
        sup,
        con,
        1,
      )[0];
      if (!m) return { parsed: p, dup: null };
      // A known company with no new person on the row adds nothing new, so it
      // is a duplicate (re-uploading the same file must not create copies).
      if (m.kind === "same_company" && !c?.full_name) {
        return { parsed: p, dup: { kind: "duplicate", note: "Already in your connections (same company, no new contact)", supplierId: m.supplierId } };
      }
      const why = m.reason === "email" ? "same email" : m.reason === "phone" ? "same phone" : "same company and name";
      return m.kind === "duplicate"
        ? { parsed: p, dup: { kind: "duplicate", note: `Already in your connections (${why})`, supplierId: m.supplierId } }
        : { parsed: p, dup: { kind: "same_company", note: `You already have ${m.company}. This adds another connection for it`, supplierId: m.supplierId } };
    });

    const n: string[] = [];
    if (parsed.tooManyRows) n.push(`Only the first ${IMPORT_MAX_ROWS.toLocaleString()} rows are shown. Import the rest as a second file.`);
    if (parsed.unknownHeaders.length) n.push(`These columns were not recognised and will be ignored: ${parsed.unknownHeaders.join(", ")}.`);

    // Ready rows are ticked; possible duplicates and rows with problems are not.
    const sel = new Set<number>();
    list.forEach((c, i) => {
      if (c.parsed.row && c.dup?.kind !== "duplicate") sel.add(i);
    });
    setNotes(n);
    setChecks(list);
    setSelected(sel);
    setFilter("all");
  }

  function toggle(i: number) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function setDuplicates(on: boolean) {
    if (!checks) return;
    setSelected((s) => {
      const next = new Set(s);
      checks.forEach((c, i) => {
        if (c.dup?.kind === "duplicate" && c.parsed.row) {
          if (on) next.add(i);
          else next.delete(i);
        }
      });
      return next;
    });
  }

  function reset() {
    setChecks(null);
    setResult(null);
    setFileName("");
    setFileError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function runImport() {
    if (!checks) return;
    const rows = checks.filter((_, i) => selected.has(i)).map((c) => c.parsed.row!);
    const toSend = remaining === null ? rows : rows.slice(0, remaining);
    if (toSend.length === 0) return;
    setBusy(true);
    try {
      const res = await fetch("/api/import/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exhibitionId: exhibitionId || null, rows: toSend, fileName }),
      });
      const data = (await res.json().catch(() => ({}))) as Partial<Result>;
      if (!res.ok && typeof data.imported !== "number") {
        setResult({ imported: 0, total: toSend.length, error: data.error ?? "The import could not be completed. Please try again." });
      } else {
        setResult({
          imported: data.imported ?? 0,
          total: data.total ?? toSend.length,
          limitReached: data.limitReached || (remaining !== null && rows.length > toSend.length),
          error: data.error,
        });
      }
      setReloadKey((k) => k + 1);
      router.refresh();
    } catch {
      setResult({ imported: 0, total: toSend.length, error: "Could not reach ExpoLead OS. Check your connection and try again." });
    } finally {
      setBusy(false);
    }
  }

  async function undoImport(item: ImportHistoryItem) {
    setUndoError(null);
    const ok = await confirm(
      `This deletes the ${item.stillThere === 1 ? "connection" : `${item.stillThere} connections`} still in your workspace from Import ${item.number} (${item.fileName}), together with any contacts, notes or meetings added to them since. Other connections are not touched.`,
      { title: `Undo Import ${item.number}?`, confirmLabel: "Yes, undo import" },
    );
    if (!ok) return;
    setUndoing(item.id);
    try {
      const res = await fetch(`/api/import/connections?id=${encodeURIComponent(item.id)}`, { method: "DELETE" });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setUndoError(d.error ?? "Could not undo this import. Please try again.");
      }
      setReloadKey((k) => k + 1);
      router.refresh();
    } catch {
      setUndoError("Could not reach ExpoLead OS. Check your connection and try again.");
    } finally {
      setUndoing(null);
    }
  }

  // ─── Result ──────────────────────────────────────────────────────────────
  if (result) {
    const ok = result.imported > 0;
    return (
      <div className="mx-auto max-w-2xl space-y-4 pb-20">
        <BackLink />
        <div className={`${card} p-6`}>
          <div className="flex items-start gap-3">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${ok ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
              {ok ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            </span>
            <div className="min-w-0">
              <p className="text-base font-semibold text-ink-900">
                {result.imported === 1 ? "1 connection imported" : `${result.imported} connections imported`}
                {exName && ok ? ` into ${exName}` : ""}
              </p>
              {result.error && <p className="mt-1 text-sm text-rose-700">{result.error}</p>}
              {result.limitReached && (
                <p className="mt-1 text-sm text-ink-600">
                  Your free trial covers 25 connections, so the rest were not imported.{" "}
                  <Link href="/upgrade" className="font-medium text-emerald-700 hover:underline">Upgrade</Link> to import them all.
                </p>
              )}
              {ok && (
                <p className="mt-1 text-sm text-ink-600">
                  They are in your Connections now, ready for follow-ups. Made a mistake? You can undo this whole import under Your imports.
                </p>
              )}
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between gap-3">
            <button type="button" onClick={reset} className={btnSecondary}>Import another file</button>
            <Link href="/connections" className={btnPrimary}>View connections</Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Preview ─────────────────────────────────────────────────────────────
  if (checks) {
    const isReady = (c: Check) => !!c.parsed.row && c.dup?.kind !== "duplicate";
    const isDup = (c: Check) => !!c.parsed.row && c.dup?.kind === "duplicate";
    const isProblem = (c: Check) => !c.parsed.row;
    const ready = checks.filter(isReady).length;
    const dups = checks.filter(isDup).length;
    const problems = checks.filter(isProblem).length;
    const dupsTicked = checks.some((c, i) => isDup(c) && selected.has(i));
    const count = remaining === null ? selected.size : Math.min(selected.size, remaining);
    const shown = checks
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => (filter === "ready" ? isReady(c) : filter === "dups" ? isDup(c) : filter === "problems" ? isProblem(c) : true));
    const tabs: { key: Filter; label: string; n: number; tone: string }[] = [
      { key: "all", label: "All rows", n: checks.length, tone: "text-ink-700" },
      { key: "ready", label: "Ready", n: ready, tone: "text-emerald-700" },
      { key: "dups", label: "Possible duplicates", n: dups, tone: "text-amber-700" },
      { key: "problems", label: "Problems", n: problems, tone: "text-rose-700" },
    ];

    return (
      <div className="space-y-4 pb-20">
        <BackLink />
        <div className={`${card} p-4`}>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2 font-medium text-ink-800"><FileSpreadsheet className="h-4 w-4 text-emerald-600" />{fileName}</span>
            <span className="text-ink-600">Importing into <strong className="text-ink-900">{exName ?? "No exhibition"}</strong></span>
          </div>
          {notes.map((n) => (
            <p key={n} className="mt-2 flex items-start gap-2 text-xs text-ink-500"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />{n}</p>
          ))}
          {remaining !== null && (
            <p className="mt-2 flex items-start gap-2 text-xs text-amber-700">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Your free trial can add {remaining} more {remaining === 1 ? "connection" : "connections"}. Only the first {remaining} ticked rows will be imported.
            </p>
          )}
        </div>

        {dups > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-900">
            <p className="font-semibold">{dups === 1 ? "1 possible duplicate" : `${dups} possible duplicates`}, left unticked</p>
            <p className="mt-1 text-amber-800">
              These look like someone you already have (same email, same phone, or the same company and name), or a row repeated in this file. We left them unticked so nobody is added twice. Open <strong>View existing</strong> to compare, and tick a row only if it really is someone new.
            </p>
            <button type="button" onClick={() => setDuplicates(!dupsTicked)} className="mt-3 inline-flex min-h-9 items-center rounded-lg border border-amber-300 bg-white px-3 text-xs font-semibold text-amber-800 hover:bg-amber-100">
              {dupsTicked ? "Untick all duplicates" : "Tick all duplicates"}
            </button>
          </div>
        )}
        {problems > 0 && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 text-sm text-rose-900">
            <p className="font-semibold">{problems === 1 ? "1 row has a problem" : `${problems} rows have a problem`} and will be skipped</p>
            <p className="mt-1 text-rose-800">
              Fix them in your spreadsheet (the sheet row number shows where) and upload again, or import the other rows now and add these later.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setFilter(t.key)}
              className={`inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors ${
                filter === t.key ? "border-emerald-600 bg-emerald-600 text-white" : "border-ink-200 bg-white text-ink-700 hover:bg-ink-50"
              }`}
            >
              {t.label}
              <span className={`rounded-full px-1.5 text-xs ${filter === t.key ? "bg-white/20 text-white" : `bg-ink-100 ${t.tone}`}`}>{t.n}</span>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white shadow-card">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-ink-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
              <tr>
                <th className="w-10 px-3 py-2.5"></th>
                <th className="w-20 px-3 py-2.5" title="The row number in your spreadsheet. Row 1 is the column names">Sheet row</th>
                <th className="px-3 py-2.5">Company</th>
                <th className="px-3 py-2.5">Contact</th>
                <th className="px-3 py-2.5">Email</th>
                <th className="px-3 py-2.5">Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {shown.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-6 text-center text-sm text-ink-400">No rows here.</td></tr>
              )}
              {shown.map(({ c, i }) => {
                const r = c.parsed.row;
                return (
                  <tr key={c.parsed.line} className={!r ? "bg-rose-50/40" : c.dup?.kind === "duplicate" ? "bg-amber-50/40" : undefined}>
                    <td className="px-3 py-2.5 align-top">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-emerald-600"
                        checked={selected.has(i)}
                        disabled={!r}
                        onChange={() => toggle(i)}
                        aria-label={`Import sheet row ${c.parsed.line}`}
                      />
                    </td>
                    <td className="px-3 py-2.5 align-top text-ink-400">{c.parsed.line}</td>
                    <td className="px-3 py-2.5 align-top font-medium text-ink-900">{r?.company_name || c.parsed.raw.company || <span className="text-ink-400">(empty)</span>}</td>
                    <td className="px-3 py-2.5 align-top text-ink-700">{r ? r.contact?.full_name ?? "" : c.parsed.raw.name}</td>
                    <td className="px-3 py-2.5 align-top text-ink-700">{r ? r.contact?.email ?? "" : c.parsed.raw.email}</td>
                    <td className="px-3 py-2.5 align-top text-xs">
                      {!r ? (
                        <span className="text-rose-700">{c.parsed.errors.join(". ")}</span>
                      ) : c.dup ? (
                        <span className={c.dup.kind === "duplicate" ? "text-amber-800" : "text-ink-500"}>
                          {c.dup.note}
                          {c.dup.supplierId && (
                            <Link href={`/connections/${c.dup.supplierId}`} target="_blank" className="ml-1.5 inline-flex items-center gap-0.5 font-semibold text-emerald-700 hover:underline">
                              View existing <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </span>
                      ) : (
                        <span className="text-emerald-700">Ready</span>
                      )}
                      {c.parsed.warnings.map((w) => (
                        <span key={w} className="mt-0.5 block text-ink-400">{w}</span>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={reset} disabled={busy} className={btnSecondary}>Back</button>
          <button type="button" onClick={runImport} disabled={busy || count === 0} className={btnPrimary}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy ? "Importing…" : count === 1 ? "Import 1 connection" : `Import ${count} connections`}
          </button>
        </div>
      </div>
    );
  }

  // ─── Upload ──────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-20">
      {ConfirmUI}
      <BackLink />

      <div className="grid gap-3 md:grid-cols-2">
        <div className={`${card} flex gap-3 p-4`}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><ScanLine className="h-5 w-5" /></span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-900">Have business cards? Scan them</p>
            <p className="mt-0.5 text-sm text-ink-500">The quickest way. Open Add connection on your phone or laptop, tap Scan card, and ExpoLead fills in the details for you.</p>
            <Link href="/connections/new" className="mt-2 inline-flex items-center text-sm font-semibold text-emerald-700 hover:underline">Scan a card</Link>
          </div>
        </div>
        <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-emerald-600 ring-1 ring-emerald-200"><FileSpreadsheet className="h-5 w-5" /></span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-900">Contacts already in Excel? Import them</p>
            <p className="mt-0.5 text-sm text-ink-600">Bring a whole list in at once with the three steps below. You check every row before anything is saved.</p>
          </div>
        </div>
      </div>

      <div className={`${card} divide-y divide-ink-100`}>
        <Step n={1} title="Choose the exhibition">
          <p className="mb-3 text-sm text-ink-500">Every connection in the file is added to this exhibition.</p>
          <div className="max-w-sm">
            <ModernSelect value={exhibitionId} onChange={setExhibitionId} options={exOptions} />
          </div>
          {exhibitions.length === 0 && (
            <p className="mt-2 text-xs text-ink-500">
              You have no exhibitions yet. <Link href="/exhibitions" className="font-medium text-emerald-700 hover:underline">Add one first</Link> to keep your contacts grouped by show.
            </p>
          )}
        </Step>

        <Step n={2} title="Download the template and add your contacts">
          <p className="mb-3 text-sm text-ink-500">
            Open it in Excel or Google Sheets, paste your contacts under the column names, delete the example row, then save as <strong className="text-ink-700">CSV UTF-8</strong>.
          </p>
          <button type="button" onClick={downloadTemplate} className={btnSecondary}>
            <Download className="h-4 w-4" /> Download template
          </button>

          <div className="mt-5 overflow-hidden rounded-xl border border-ink-200">
            <p className="border-b border-ink-200 bg-ink-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-500">What to put in each column</p>
            <div className="divide-y divide-ink-100">
              <GuideRow name="Company" badge={<span className={`${chip} bg-rose-50 text-rose-700 ring-rose-600/20`}>Required</span>}>
                The company name. This is the only column every row needs.
              </GuideRow>
              <GuideRow name="Interest" hint="Empty is saved as Supplier">
                <Chips>{INTEREST_TYPES.map((t) => <span key={t.value} className={`${chip} ${INTEREST_STYLES[t.value]}`}>{t.label}</span>)}</Chips>
              </GuideRow>
              <GuideRow name="Priority" hint="Empty is saved as Medium">
                <Chips>{PRIORITIES.map((t) => <span key={t.value} className={`${chip} ${PRIORITY_STYLES[t.value]}`}>{t.label}</span>)}</Chips>
              </GuideRow>
              <GuideRow name="Follow-up status" hint="Empty is saved as New">
                <Chips>{FOLLOW_UP_STATUSES.map((t) => <span key={t.value} className={`${chip} ${STATUS_STYLES[t.value]}`}>{t.label}</span>)}</Chips>
              </GuideRow>
              <GuideRow name="Visited · Target" hint="Visited: you went to their booth. Target: a company you want to win">
                <Chips>
                  <span className={`${chip} bg-emerald-50 text-emerald-700 ring-emerald-600/20`}>Yes</span>
                  <span className={neutralChip}>No</span>
                </Chips>
              </GuideRow>
              <GuideRow name="Visit date · Follow-up date" hint="The day you met them at the show, and when you plan to follow up. Day first. Leave empty if you are not sure">
                <Chips>
                  <span className={neutralChip}>2026-10-20</span>
                  <span className={neutralChip}>20/10/2026</span>
                  <span className={neutralChip}>20 Oct 2026</span>
                </Chips>
              </GuideRow>
              <GuideRow name="Contact" hint="Name, Position, Email, Phone, WhatsApp. One main contact per company">
                <Chips>
                  <span className={neutralChip}>+33 6 12 34 56 78</span>
                  <span className="text-xs text-ink-500">Keep the + and country code. If Excel drops them, set the phone columns to Text first.</span>
                </Chips>
              </GuideRow>
              <GuideRow name="Everything else" hint="Country, Website, Hall, Booth number, Stand location, Notes">
                <span className="text-sm text-ink-600">Optional. Type them as you have them.</span>
              </GuideRow>
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-500">A file exported from ExpoLead OS can be imported too.</p>
        </Step>

        <Step n={3} title="Upload your file">
          <p className="mb-3 text-sm text-ink-500">You see every row before anything is saved. Up to {IMPORT_MAX_ROWS.toLocaleString()} rows per file; for more, import in parts.</p>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={!existing} className={btnPrimary}>
            {existing ? <Upload className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />} Choose CSV file
          </button>
          {fileError && (
            <p className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{fileName && <strong className="font-medium">{fileName}: </strong>}{fileError}</span>
            </p>
          )}
          <p className="mt-3 text-xs text-ink-400">Your file is read in your browser and is never stored. Only the connections you import are saved.</p>
        </Step>
      </div>

      {history.length > 0 && (
        <div className={card}>
          <div className="flex items-center gap-2 border-b border-ink-100 px-5 py-3.5">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><History className="h-4 w-4" /></span>
            <div>
              <p className="text-sm font-semibold text-ink-900">Your imports</p>
              <p className="text-xs text-ink-400">Undo removes every connection an import added, in one step</p>
            </div>
          </div>
          {undoError && <p className="mx-5 mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{undoError}</p>}
          <div className="divide-y divide-ink-100">
            {history.map((h) => (
              <div key={h.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 text-sm">
                <span className={`${chip} ${h.undone ? "bg-ink-50 text-ink-400 ring-ink-300/40" : "bg-emerald-50 text-emerald-700 ring-emerald-600/20"}`}>Import {h.number}</span>
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-medium ${h.undone ? "text-ink-400 line-through" : "text-ink-900"}`}>{h.fileName}</p>
                  <p className="text-xs text-ink-500">
                    {fmtDate(h.createdAt)} · {h.exhibition ?? "No exhibition"} · {h.imported} imported
                    {!h.undone && h.stillThere !== h.imported ? `, ${h.stillThere} still in Connections` : ""}
                  </p>
                </div>
                {h.undone ? (
                  <span className="text-xs font-medium text-ink-400">Undone</span>
                ) : h.stillThere > 0 ? (
                  <button
                    type="button"
                    onClick={() => undoImport(h)}
                    disabled={undoing !== null}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                  >
                    {undoing === h.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Undo2 className="h-3.5 w-3.5" />}
                    Undo import
                  </button>
                ) : (
                  <span className="text-xs text-ink-400">Nothing left to undo</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 p-5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700">{n}</span>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-sm font-semibold text-ink-900">{title}</p>
        {children}
      </div>
    </div>
  );
}

function GuideRow({ name, badge, hint, children }: { name: string; badge?: React.ReactNode; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 px-4 py-3 sm:grid-cols-[190px_1fr] sm:gap-4">
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">{name}{badge}</p>
        {hint && <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{hint}</p>}
      </div>
      <div className="flex items-center text-sm text-ink-600">{children}</div>
    </div>
  );
}

function Chips({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-1.5">{children}</div>;
}
