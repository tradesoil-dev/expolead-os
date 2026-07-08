"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: GridIcon, soon: false },
  { href: "/exhibitions", label: "Exhibitions", icon: CalendarIcon, soon: false },
  { href: "/suppliers", label: "Connections", icon: TableIcon, soon: false },
  { href: "/opportunities", label: "Opportunities", icon: TargetIcon, soon: false },
  { href: "/reports", label: "Reports", icon: ChartIcon, soon: true },
];

export default function Sidebar({ email: _email }: { email: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col bg-slate-800 shadow-lg">
      <div className="flex items-center gap-2 px-4 h-14 border-b border-white/10">
        <svg width="26" height="26" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="17" height="17" rx="3" stroke="white" strokeWidth="2.2" fill="none"/>
          <rect x="22" y="1" width="17" height="17" rx="3" stroke="white" strokeWidth="2.2" fill="none"/>
          <rect x="1" y="22" width="17" height="17" rx="3" stroke="white" strokeWidth="2.2" fill="none"/>
          <rect x="22" y="22" width="17" height="17" rx="3" fill="#10b981"/>
        </svg>
        <span className="flex items-center text-[17px] font-semibold tracking-tight leading-none">
          <span className="text-white">Expo</span><span className="text-emerald-400">Lead</span><span className="text-slate-500 text-[12px] font-normal ml-1">OS</span>
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon, soon }) => {
          const active =
            href === "/dashboard"
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:bg-white/10 hover:text-white"
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              {label}
              {soon && (
                <span className="ml-auto rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-300">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function TableIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M9 9v11" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" strokeLinecap="round" />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 14l3-3 3 3 4-5" />
    </svg>
  );
}

