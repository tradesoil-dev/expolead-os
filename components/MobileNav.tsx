"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AccountMenu from "@/components/AccountMenu";

const NAV = [
  { href: "/dashboard", label: "Dashboard", soon: false },
  { href: "/exhibitions", label: "Exhibitions", soon: false },
  { href: "/suppliers", label: "Connections", soon: false },
  { href: "/opportunities", label: "Opportunities", soon: false },
  { href: "/follow-ups", label: "Follow-ups", soon: false },
  { href: "/reports", label: "Reports", soon: true },
  { href: "/profile", label: "Settings", soon: false },
];

export default function MobileNav({ email }: { email?: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href;
  }

  return (
    <div className="block md:hidden">
      <div className="flex items-center justify-between h-14 px-4 border-b bg-white sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="17" height="17" rx="3" stroke="#0f172a" strokeWidth="2.2" fill="none"/>
            <rect x="22" y="1" width="17" height="17" rx="3" stroke="#0f172a" strokeWidth="2.2" fill="none"/>
            <rect x="1" y="22" width="17" height="17" rx="3" stroke="#0f172a" strokeWidth="2.2" fill="none"/>
            <rect x="22" y="22" width="17" height="17" rx="3" fill="#10b981"/>
          </svg>
          <span className="flex items-center text-[17px] font-semibold tracking-tight leading-none">
            <span className="text-slate-900">Expo</span><span className="text-emerald-500">Lead</span><span className="text-slate-400 text-[12px] font-normal ml-1">OS</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <AccountMenu email={email ?? null} />
          <button
            onClick={() => setOpen(true)}
            className="h-11 w-11 grid place-items-center rounded-md border"
            aria-label="Open navigation"
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setOpen(false)}
          />

          <div className="fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <svg width="22" height="22" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="17" height="17" rx="3" stroke="#0f172a" strokeWidth="2.2" fill="none"/>
                  <rect x="22" y="1" width="17" height="17" rx="3" stroke="#0f172a" strokeWidth="2.2" fill="none"/>
                  <rect x="1" y="22" width="17" height="17" rx="3" stroke="#0f172a" strokeWidth="2.2" fill="none"/>
                  <rect x="22" y="22" width="17" height="17" rx="3" fill="#10b981"/>
                </svg>
                <span className="flex items-center text-[16px] font-semibold tracking-tight leading-none">
                  <span className="text-slate-900">Expo</span><span className="text-emerald-500">Lead</span><span className="text-slate-400 text-[11px] font-normal ml-1">OS</span>
                </span>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="h-11 w-11 grid place-items-center rounded-md border"
              >
                ✕
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-2">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                    isActive(item.href)
                      ? "bg-emerald-600 text-white"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.soon && (
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                      Soon
                    </span>
                  )}
                </Link>
              ))}
            </nav>

          </div>
        </>
      )}
    </div>
  );
}