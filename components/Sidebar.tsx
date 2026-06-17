"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: GridIcon },
  { href: "/suppliers", label: "Suppliers", icon: TableIcon },
  { href: "/exhibitions", label: "Exhibitions", icon: CalendarIcon },
  { href: "/opportunities", label: "Opportunities", icon: GridIcon },
  { href: "/profile", label: "Profile", icon: GridIcon },
];

export default function Sidebar({ email }: { email: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profileName, setProfileName] = useState("");
  const [profileRole, setProfileRole] = useState("");
const [profileCompany, setProfileCompany] = useState("");

  const initials = profileName
  ? profileName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  : email
    ? email.slice(0, 2).toUpperCase()
    : "ME";
    useEffect(() => {
  loadProfile();
}, []);
async function loadProfile() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data } = await supabase
    .from("profiles")
    .select("full_name, company_name, role")
    .eq("id", user.id)
    .single();

  if (data) {
  setProfileName(data.full_name || "");
  setProfileCompany(data.company_name || "");
  setProfileRole(data.role || "");
}
}
  async function signOut() {
    if (isSupabaseConfigured) {
      await createClient().auth.signOut();
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-emerald-100 bg-gradient-to-b from-white via-emerald-50/40 to-emerald-100/60 shadow-sm">
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-ink-200">
        <div className="grid place-items-center h-10 w-10 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-sm">
  EL
</div>
        <div className="leading-tight">
          <div className="text-[15px] font-semibold tracking-tight">
            ExpoLead OS
          </div>
          <div className="text-[11px] font-medium text-emerald-600 -mt-0.5">
  Powered by Tradesoil
</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-5">
        {NAV.map(({ href, label, icon: Icon }) => {
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
                  ? "bg-emerald-600 text-white shadow-sm"
: "text-ink-700 hover:bg-emerald-50 hover:text-emerald-700"
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-ink-200">
  <div className="rounded-xl border border-ink-200 bg-white/80 p-2.5 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-ink-900">
          {profileName || "User"}
        </div>
        <div className="truncate text-xs text-ink-500">
          {profileCompany || profileRole || "Member"}
        </div>
      </div>
    </div>

    <button
      onClick={signOut}
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs font-medium text-ink-700 hover:bg-emerald-50 hover:text-emerald-700"
    >
      <SignOutIcon className="h-4 w-4" />
      Sign out
    </button>
  </div>
</div>
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

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
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

function SignOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
