"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/suppliers", label: "Suppliers" },
  { href: "/exhibitions", label: "Exhibitions" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/profile", label: "Profile" },
];

export default function MobileNav({
  email,
}: {
  email?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    if (isSupabaseConfigured) {
      await createClient().auth.signOut();
    }
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string) {
    return pathname === href;
  }

  return (
    <div className="block md:hidden">
      <div className="flex items-center justify-between h-14 px-4 border-b bg-white sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="grid place-items-center h-8 w-8 rounded-full bg-emerald-600 text-white font-bold">
            EL
          </div>
          <div>
            <p className="font-semibold text-sm">ExpoLead OS</p>
          </div>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="h-11 w-11 grid place-items-center rounded-md border"
          aria-label="Open navigation"
        >
          ☰
        </button>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setOpen(false)}
          />

          <div className="fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold">ExpoLead OS</span>

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
                  className={`block rounded-lg px-3 py-2 ${
                    isActive(item.href)
                      ? "bg-emerald-600 text-white"
                      : "hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="border-t p-3">
              <p className="text-xs text-slate-500 mb-3 truncate">
                {email ?? "User"}
              </p>

              <button
                onClick={signOut}
                className="w-full rounded-lg border px-3 py-2 text-left"
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}