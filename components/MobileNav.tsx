"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/exhibitions", label: "Exhibitions" },
  { href: "/suppliers", label: "Connections" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/follow-ups", label: "Follow-ups" },
  { href: "/reports", label: "Reports" },
  { href: "/profile", label: "Settings" },
];

function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="17" height="17" rx="3" stroke="#0f172a" strokeWidth="2.2" fill="none" />
      <rect x="22" y="1" width="17" height="17" rx="3" stroke="#0f172a" strokeWidth="2.2" fill="none" />
      <rect x="1" y="22" width="17" height="17" rx="3" stroke="#0f172a" strokeWidth="2.2" fill="none" />
      <rect x="22" y="22" width="17" height="17" rx="3" fill="#10b981" />
    </svg>
  );
}

export default function MobileNav({ email }: { email?: string | null }) {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("full_name, company_name, is_admin")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setFullName(data.full_name || "");
            setCompanyName(data.company_name || "");
            setIsAdmin(!!data.is_admin);
          }
        });
    });
  }, []);

  const initials = fullName
    ? fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : email
    ? email.slice(0, 2).toUpperCase()
    : "ME";

  async function signOut() {
    if (isSupabaseConfigured) await createClient().auth.signOut();
    setOpen(false);
    router.push("/login");
    router.refresh();
  }

  const item = "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm";

  return (
    <div className="contents md:hidden">
      {/* Top bar — sticky as a direct child of the page column */}
      <div className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-ink-100 bg-white px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo />
          <span className="flex items-center text-[17px] font-semibold leading-none tracking-tight">
            <span className="text-slate-900">Expo</span><span className="text-emerald-500">Lead</span><span className="ml-1 text-[12px] font-normal text-slate-400">OS</span>
          </span>
        </Link>

        <button
          onClick={() => setOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-ink-200 text-ink-600"
          aria-label="Open menu"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        </button>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} />

          <div className="fixed right-0 top-0 z-50 flex h-full w-[280px] flex-col overflow-y-auto bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-ink-100 p-4">
              <div className="flex items-center gap-2">
                <Logo size={22} />
                <span className="flex items-center text-[16px] font-semibold leading-none tracking-tight">
                  <span className="text-slate-900">Expo</span><span className="text-emerald-500">Lead</span><span className="ml-1 text-[11px] font-normal text-slate-400">OS</span>
                </span>
              </div>
              <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg border border-ink-200 text-ink-500" aria-label="Close menu">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {/* Account */}
            <div className="flex items-center gap-3 border-b border-ink-100 p-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">{initials}</div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-900">{fullName || "Your account"}</p>
                <p className="truncate text-xs text-ink-500">{companyName || email || ""}</p>
              </div>
            </div>

            <nav className="flex-1 space-y-1 p-3">
              {NAV.map((n) => {
                const active = n.href === "/dashboard" ? pathname === n.href : pathname.startsWith(n.href);
                return (
                  <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={`${item} ${active ? "bg-emerald-600 font-medium text-white" : "text-ink-700 hover:bg-ink-50"}`}>
                    {n.label}
                  </Link>
                );
              })}

              {isAdmin && (
                <>
                  <div className="my-2 border-t border-ink-100" />
                  <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wide text-ink-400">Admin</p>
                  <Link href="/admin/library" onClick={() => setOpen(false)} className={`${item} text-ink-700 hover:bg-ink-50`}>
                    Exhibition Library
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">Admin</span>
                  </Link>
                  <Link href="/admin/people" onClick={() => setOpen(false)} className={`${item} text-ink-700 hover:bg-ink-50`}>
                    People
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">Admin</span>
                  </Link>
                </>
              )}

              <div className="my-2 border-t border-ink-100" />
              <Link href="/upgrade" onClick={() => setOpen(false)} className={`${item} text-ink-700 hover:bg-ink-50`}>View plans</Link>
            </nav>

            <div className="border-t border-ink-100 p-3">
              <button onClick={signOut} className="w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50">
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
