"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/components/useConfirm";
import { useToast } from "@/components/useToast";

type Person = {
  id: string;
  email: string;
  created_at: string | null;
  confirmed_at: string | null;
  last_sign_in_at: string | null;
  signup_country: string | null;
  full_name: string | null;
  company_name: string | null;
  trial_ends_at: string | null;
  subscription_status: string | null;
  is_admin: boolean;
};

const FREE_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "hotmail.com", "hotmail.co.uk",
  "outlook.com", "live.com", "msn.com", "icloud.com", "me.com", "aol.com", "proton.me",
  "protonmail.com", "gmx.com", "mail.com", "yandex.com", "zoho.com", "qq.com", "163.com",
  "126.com", "sina.com", "foxmail.com",
]);

function domainOf(email: string) {
  return (email.split("@")[1] || "").toLowerCase();
}
function isCompany(email: string) {
  const d = domainOf(email);
  return d.length > 0 && !FREE_DOMAINS.has(d);
}
function fmtDate(s: string | null) {
  return s ? new Date(s).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";
}
function fmtShort(s: string | null) {
  return s ? new Date(s).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "—";
}
function flag(cc: string | null) {
  if (!cc || cc.length !== 2) return "";
  return String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
}
function daysAgo(s: string | null) {
  if (!s) return Infinity;
  return (Date.now() - new Date(s).getTime()) / 86400000;
}

function planOf(p: Person): { label: string; cls: string } {
  if (p.is_admin) return { label: "Admin", cls: "bg-emerald-100 text-emerald-800" };
  if (p.subscription_status === "active") return { label: "Active", cls: "bg-emerald-50 text-emerald-700" };
  if (p.trial_ends_at && new Date(p.trial_ends_at).getTime() > Date.now()) return { label: "Trial", cls: "bg-sky-50 text-sky-700" };
  return { label: "Expired", cls: "bg-slate-100 text-slate-500" };
}
function trialWindow(p: Person): string {
  if (p.is_admin) return "Unlimited";
  if (p.subscription_status === "active") return "Subscribed";
  if (!p.trial_ends_at) return "—";
  return fmtDate(p.trial_ends_at);
}

const PER_PAGE = 10;

export default function AdminPeople({ people }: { people: Person[] }) {
  const router = useRouter();
  const { confirm, ConfirmUI } = useConfirm();
  const { showToast, ToastUI } = useToast();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending" | "company" | "never">("all");
  const [page, setPage] = useState(1);
  const [cleaning, setCleaning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Never-confirmed accounts older than 24h: the safe-to-remove bot/abandoned
  // set. Matches exactly what admin_delete_unconfirmed() removes on the server.
  const deletable = useMemo(
    () => people.filter((p) => !p.confirmed_at && daysAgo(p.created_at) >= 1).length,
    [people]
  );

  async function cleanupUnconfirmed() {
    if (deletable === 0) return;
    if (
      !(await confirm(
        `Delete ${deletable} unconfirmed account${deletable === 1 ? "" : "s"} older than 24 hours? This cannot be undone.`,
        { title: "Delete unconfirmed accounts", confirmLabel: "Delete" }
      ))
    )
      return;
    setCleaning(true);
    try {
      const res = await fetch("/api/admin/delete-unconfirmed", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Cleanup failed");
      router.refresh();
    } catch (e: any) {
      showToast(e.message || "Cleanup failed", "error");
    } finally {
      setCleaning(false);
    }
  }

  function toggleOne(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  // Delete specific accounts (per-row = one id, bulk = the ticked set). Admin
  // rows are never selectable, and the server refuses self/admin anyway.
  async function deleteUsers(ids: string[], noun: string) {
    if (ids.length === 0) return;
    if (
      !(await confirm(
        `Permanently delete ${ids.length} ${noun}? This removes the account and all of its data and cannot be undone.`,
        { title: `Delete ${ids.length} ${ids.length === 1 ? "account" : "accounts"}`, confirmLabel: "Delete" }
      ))
    )
      return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/delete-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");
      setSelected(new Set());
      router.refresh();
    } catch (e: any) {
      showToast(e.message || "Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  }

  const stats = useMemo(() => {
    const total = people.length;
    const confirmed = people.filter((p) => p.confirmed_at).length;
    const pending = total - confirmed;
    const company = people.filter((p) => isCompany(p.email)).length;
    const never = people.filter((p) => !p.last_sign_in_at).length;
    const week = people.filter((p) => daysAgo(p.created_at) <= 7).length;
    const month = people.filter((p) => daysAgo(p.created_at) <= 30).length;
    return { total, confirmed, pending, company, never, companyPct: total ? Math.round((company / total) * 100) : 0, week, month };
  }, [people]);

  const topCountries = useMemo(() => {
    const m = new Map<string, number>();
    people.forEach((p) => { if (p.signup_country) m.set(p.signup_country, (m.get(p.signup_country) ?? 0) + 1); });
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [people]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return people.filter((p) => {
      if (filter === "confirmed" && !p.confirmed_at) return false;
      if (filter === "pending" && p.confirmed_at) return false;
      if (filter === "company" && !isCompany(p.email)) return false;
      if (filter === "never" && p.last_sign_in_at) return false;
      if (term) {
        const hay = `${p.email} ${p.full_name ?? ""} ${p.company_name ?? ""}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [people, q, filter]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(
    () => rows.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE),
    [rows, currentPage]
  );
  useEffect(() => { setPage(1); setSelected(new Set()); }, [q, filter]);

  // "Select all" acts on the non-admin rows of the current page only.
  const pageSelectableIds = paged.filter((p) => !p.is_admin).map((p) => p.id);
  const allPageSelected = pageSelectableIds.length > 0 && pageSelectableIds.every((id) => selected.has(id));
  function toggleAllPage() {
    setSelected((s) => {
      const n = new Set(s);
      if (allPageSelected) pageSelectableIds.forEach((id) => n.delete(id));
      else pageSelectableIds.forEach((id) => n.add(id));
      return n;
    });
  }

  return (
    <div className="space-y-5">
      {ConfirmUI}
      {ToastUI}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat label="Total signups" value={stats.total} sub={stats.week > 0 ? `+${stats.week} this week` : undefined} />
        <Stat label="Confirmed" value={stats.confirmed} />
        <Stat label="Not confirmed" value={stats.pending} tone={stats.pending > 0 ? "amber" : undefined} />
        <Stat label="Company emails" value={`${stats.companyPct}%`} sub={`${stats.company} of ${stats.total}`} tone="emerald" />
        <Stat label="New this month" value={stats.month} />
        <Stat label="Never signed in" value={stats.never} tone={stats.never > 0 ? "amber" : undefined} />
      </div>

      {topCountries.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3">
          <span className="text-xs font-semibold text-slate-500">Top countries</span>
          {topCountries.map(([cc, n]) => (
            <span key={cc} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              {flag(cc)} {cc} · {n}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search email, name, company…"
            className="w-full rounded-lg border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
          />
        </div>
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
          {([["all", "All"], ["confirmed", "Confirmed"], ["pending", "Not confirmed"], ["never", "Never signed in"], ["company", "Company"]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setFilter(k)} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${filter === k ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{label}</button>
          ))}
        </div>
        {deletable > 0 && (
          <button
            onClick={cleanupUnconfirmed}
            disabled={cleaning}
            title="Removes never-confirmed accounts older than 24 hours. Confirmed users are never touched."
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100 disabled:opacity-50"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            {cleaning ? "Removing…" : `Remove ${deletable} unconfirmed`}
          </button>
        )}
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5">
          <span className="text-sm font-semibold text-rose-800">{selected.size} selected</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setSelected(new Set())} className="rounded-md px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white">Clear</button>
            <button
              onClick={() => deleteUsers([...selected], selected.size === 1 ? "account" : "accounts")}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              {deleting ? "Deleting…" : `Delete selected`}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white shadow-card">
        <table className="w-full min-w-[1080px] text-sm">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs font-medium text-ink-500">
              <th className="w-10 px-4 py-2.5">
                <input type="checkbox" checked={allPageSelected} onChange={toggleAllPage} aria-label="Select all on this page" className="h-4 w-4 cursor-pointer accent-emerald-600" />
              </th>
              <th className="whitespace-nowrap px-4 py-2.5">Email</th>
              <th className="whitespace-nowrap px-4 py-2.5">Name / Company</th>
              <th className="whitespace-nowrap px-4 py-2.5">Type</th>
              <th className="whitespace-nowrap px-4 py-2.5">Country</th>
              <th className="whitespace-nowrap px-4 py-2.5">Signed up</th>
              <th className="whitespace-nowrap px-4 py-2.5">Trial ends</th>
              <th className="whitespace-nowrap px-4 py-2.5">Last active</th>
              <th className="whitespace-nowrap px-4 py-2.5">Status</th>
              <th className="whitespace-nowrap px-4 py-2.5">Plan</th>
              <th className="w-12 px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {paged.length === 0 ? (
              <tr><td colSpan={11} className="px-4 py-12 text-center text-ink-400">No people match.</td></tr>
            ) : (
              paged.map((p) => {
                const plan = planOf(p);
                const company = isCompany(p.email);
                return (
                  <tr key={p.id} className={`transition-colors hover:bg-ink-50 ${selected.has(p.id) ? "bg-rose-50/50" : !p.confirmed_at ? "bg-amber-50/40" : ""}`}>
                    <td className="px-4 py-3">
                      {!p.is_admin && (
                        <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleOne(p.id)} aria-label={`Select ${p.email}`} className="h-4 w-4 cursor-pointer accent-emerald-600" />
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="font-medium text-ink-900">{p.email}</span>
                      {p.is_admin && <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">ADMIN</span>}
                    </td>
                    <td className="px-4 py-3 text-ink-700">
                      {p.full_name || "—"}
                      {p.company_name && <span className="block text-xs text-ink-400">{p.company_name}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${company ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {company ? "Company" : "Personal"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-700">
                      {p.signup_country ? <span>{flag(p.signup_country)} {p.signup_country}</span> : <span className="text-ink-400">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-600">{fmtDate(p.created_at)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-600">{trialWindow(p)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {p.last_sign_in_at ? (
                        <span className="text-ink-600">{fmtDate(p.last_sign_in_at)}</span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Never</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {p.confirmed_at ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Confirmed</span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Didn&rsquo;t finish</span>
                      )}
                    </td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${plan.cls}`}>{plan.label}</span></td>
                    <td className="px-4 py-3 text-right">
                      {!p.is_admin && (
                        <button
                          onClick={() => deleteUsers([p.id], "account")}
                          disabled={deleting}
                          title="Delete this account and all its data"
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-xs text-ink-400">
          {rows.length === 0
            ? "No people match."
            : `Showing ${(currentPage - 1) * PER_PAGE + 1}–${Math.min(currentPage * PER_PAGE, rows.length)} of ${rows.length}`}
          {rows.length !== people.length ? ` (filtered from ${people.length})` : ""}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-md border border-ink-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${n === currentPage ? "bg-emerald-600 text-white" : "border border-ink-200 text-slate-600 hover:bg-slate-50"}`}>{n}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-md border border-ink-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
      <p className="text-xs text-ink-400">Private admin view. Share aggregate numbers, not individual emails.</p>
    </div>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string | number; sub?: string; tone?: "emerald" | "amber" }) {
  const valColor = tone === "amber" ? "text-amber-600" : tone === "emerald" ? "text-emerald-600" : "text-slate-900";
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-4">
      <p className="text-[11px] font-semibold text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold tabular-nums ${valColor}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] font-medium text-slate-400">{sub}</p>}
    </div>
  );
}
