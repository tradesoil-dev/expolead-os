"use client";

import { useMemo, useState } from "react";

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

export default function AdminPeople({ people }: { people: Person[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending" | "company" | "never">("all");

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

  return (
    <div className="space-y-5">
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
      </div>

      <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white shadow-card">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs font-medium text-ink-500">
              <th className="whitespace-nowrap px-4 py-2.5">Email</th>
              <th className="whitespace-nowrap px-4 py-2.5">Name / Company</th>
              <th className="whitespace-nowrap px-4 py-2.5">Type</th>
              <th className="whitespace-nowrap px-4 py-2.5">Country</th>
              <th className="whitespace-nowrap px-4 py-2.5">Signed up</th>
              <th className="whitespace-nowrap px-4 py-2.5">Trial ends</th>
              <th className="whitespace-nowrap px-4 py-2.5">Last active</th>
              <th className="whitespace-nowrap px-4 py-2.5">Status</th>
              <th className="whitespace-nowrap px-4 py-2.5">Plan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-ink-400">No people match.</td></tr>
            ) : (
              rows.map((p) => {
                const plan = planOf(p);
                const company = isCompany(p.email);
                return (
                  <tr key={p.id} className={`transition-colors hover:bg-ink-50 ${!p.confirmed_at ? "bg-amber-50/40" : ""}`}>
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
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-ink-400">Showing {rows.length} of {people.length} people. Private admin view — share aggregate numbers, not individual emails.</p>
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
