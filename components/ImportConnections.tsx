"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Info, Loader2 } from "lucide-react";
import ModernSelect from "@/components/Select";
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
import { INTEREST_TYPES, PRIORITIES, FOLLOW_UP_STATUSES } from "@/lib/types";

type Ex = { id: string; name: string };

type Check = {
  parsed: ParsedRow;
  // "duplicate" = probably already in their connections (or twice in the file),
  // "same_company" = known company, different person (fine, just a note).
  dup: { kind: "duplicate" | "same_company"; note: string } | null;
};

type Result = { imported: number; total: number; limitReached?: boolean; error?: string };

const card = "rounded-xl border border-ink-200 bg-white shadow-card";
const btnPrimary =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50";
const btnSecondary =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-ink-200 bg-white px-4 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50";

export default function ImportConnections({ exhibitions, remaining }: { exhibitions: Ex[]; remaining: number | null }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [exhibitionId, setExhibitionId] = useState(exhibitions[0]?.id ?? "");
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [existing, setExisting] = useState<{ suppliers: ExistingSupplier[]; contacts: ExistingContact[] } | null>(null);

  // The user's own connections, for the duplicate check (RLS scopes this).
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
  }, []);

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
        return { parsed: p, dup: { kind: "duplicate", note: `Same as row ${firstEmail ?? firstPerson} in this file` } };
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
      const why = m.reason === "email" ? "same email" : m.reason === "phone" ? "same phone" : "same company and name";
      return m.kind === "duplicate"
        ? { parsed: p, dup: { kind: "duplicate", note: `Already in your connections (${why}): ${m.company}` } }
        : { parsed: p, dup: { kind: "same_company", note: `You already have ${m.company}. This adds a new connection for it` } };
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
  }

  function toggle(i: number) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
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
        body: JSON.stringify({ exhibitionId: exhibitionId || null, rows: toSend }),
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
      router.refresh();
    } catch {
      setResult({ imported: 0, total: toSend.length, error: "Could not reach ExpoLead OS. Check your connection and try again." });
    } finally {
      setBusy(false);
    }
  }

  // ─── Result ──────────────────────────────────────────────────────────────
  if (result) {
    const ok = result.imported > 0;
    return (
      <div className={`${card} mx-auto max-w-2xl p-6`}>
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
            {ok && !result.error && !result.limitReached && (
              <p className="mt-1 text-sm text-ink-600">They are in your Connections now, ready for follow-ups.</p>
            )}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between gap-3">
          <button type="button" onClick={reset} className={btnSecondary}>Import another file</button>
          <Link href="/connections" className={btnPrimary}>View connections</Link>
        </div>
      </div>
    );
  }

  // ─── Preview ─────────────────────────────────────────────────────────────
  if (checks) {
    const ready = checks.filter((c) => c.parsed.row && !c.dup).length;
    const problems = checks.filter((c) => !c.parsed.row).length;
    const dups = checks.filter((c) => c.dup?.kind === "duplicate").length;
    const count = remaining === null ? selected.size : Math.min(selected.size, remaining);
    return (
      <div className="space-y-4">
        <div className={`${card} p-4`}>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2 font-medium text-ink-800"><FileSpreadsheet className="h-4 w-4 text-emerald-600" />{fileName}</span>
            <span className="text-ink-600">Importing into <strong className="text-ink-900">{exName ?? "No exhibition"}</strong></span>
            <span className="text-emerald-700">{ready} ready</span>
            {dups > 0 && <span className="text-amber-700">{dups} possible {dups === 1 ? "duplicate" : "duplicates"}</span>}
            {problems > 0 && <span className="text-rose-700">{problems} with problems</span>}
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
          <p className="mt-2 text-xs text-ink-500">Possible duplicates are not ticked. Tick them if you still want them.</p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white shadow-card">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-ink-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
              <tr>
                <th className="w-10 px-3 py-2.5"></th>
                <th className="w-14 px-3 py-2.5">Row</th>
                <th className="px-3 py-2.5">Company</th>
                <th className="px-3 py-2.5">Contact</th>
                <th className="px-3 py-2.5">Email</th>
                <th className="px-3 py-2.5">Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {checks.map((c, i) => {
                const r = c.parsed.row;
                return (
                  <tr key={c.parsed.line} className={!r ? "bg-rose-50/40" : undefined}>
                    <td className="px-3 py-2.5 align-top">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-emerald-600"
                        checked={selected.has(i)}
                        disabled={!r}
                        onChange={() => toggle(i)}
                        aria-label={`Import row ${c.parsed.line}`}
                      />
                    </td>
                    <td className="px-3 py-2.5 align-top text-ink-400">{c.parsed.line}</td>
                    <td className="px-3 py-2.5 align-top font-medium text-ink-900">{r?.company_name || <span className="text-ink-400">(empty)</span>}</td>
                    <td className="px-3 py-2.5 align-top text-ink-700">{r?.contact?.full_name ?? ""}</td>
                    <td className="px-3 py-2.5 align-top text-ink-700">{r?.contact?.email ?? ""}</td>
                    <td className="px-3 py-2.5 align-top text-xs">
                      {!r ? (
                        <span className="text-rose-700">{c.parsed.errors.join(". ")}</span>
                      ) : c.dup ? (
                        <span className={c.dup.kind === "duplicate" ? "text-amber-700" : "text-ink-500"}>{c.dup.note}</span>
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
    <div className="mx-auto max-w-3xl space-y-4">
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
            Open it in Excel or Google Sheets, paste your contacts under the column names, delete the example row and save it as <strong className="text-ink-700">CSV UTF-8</strong>.
          </p>
          <button type="button" onClick={downloadTemplate} className={btnSecondary}>
            <Download className="h-4 w-4" /> Download template
          </button>
          <ul className="mt-4 space-y-1.5 text-xs leading-relaxed text-ink-500">
            <li><strong className="text-ink-700">Only Company is required.</strong> Leave any other column empty if you do not have it.</li>
            <li><strong className="text-ink-700">Interest:</strong> {INTEREST_TYPES.map((t) => t.label).join(", ")}.</li>
            <li><strong className="text-ink-700">Priority:</strong> {PRIORITIES.map((t) => t.label).join(", ")}. <strong className="text-ink-700">Follow-up status:</strong> {FOLLOW_UP_STATUSES.map((t) => t.label).join(", ")}.</li>
            <li><strong className="text-ink-700">Dates:</strong> 2026-11-03 or 03/11/2026 (day first). <strong className="text-ink-700">Visited, Target:</strong> Yes or No.</li>
            <li><strong className="text-ink-700">Phone numbers:</strong> keep the + and country code. If Excel drops them, format the phone columns as Text before pasting.</li>
            <li>A file exported from ExpoLead OS can be imported too.</li>
          </ul>
        </Step>

        <Step n={3} title="Upload your file">
          <p className="mb-3 text-sm text-ink-500">You will see every row before anything is saved. Up to {IMPORT_MAX_ROWS.toLocaleString()} rows per file.</p>
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
          <p className="mt-3 text-xs text-ink-400">The file is read in your browser and is never stored.</p>
        </Step>
      </div>
      <div className="flex items-center justify-between">
        <Link href="/connections" className={btnSecondary}>Back</Link>
      </div>
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
