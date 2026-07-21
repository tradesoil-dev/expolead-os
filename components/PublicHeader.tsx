"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Props = {
  /**
   * Rendered to the right of the nav, before the mobile menu button. Used by
   * the landing page to inject its language dropdown, which only it needs
   * because only it is translated.
   */
  children?: ReactNode;
  /** Nav labels, so the landing page can pass Chinese. Defaults to English. */
  labels?: { product: string; resources: string; pricing: string; login: string; trial: string };
};

const DEFAULT_LABELS = {
  product: "Product",
  resources: "Resources",
  pricing: "Pricing",
  login: "Log in",
  trial: "Start free trial",
};

const NAV = [
  { href: "/features", key: "product" as const },
  { href: "/resources", key: "resources" as const },
  { href: "/pricing", key: "pricing" as const },
];

/**
 * The single header for every public page. Before this existed each page
 * hand-rolled its own, so links appeared and vanished and the background
 * changed colour as you moved around the site.
 *
 * Login state resolves in the browser, so the signed-out buttons render
 * first and swap to "Back to dashboard" for a signed-in visitor. Header
 * height and layout do not change between the two, so nothing shifts.
 */
export default function PublicHeader({ children, labels = DEFAULT_LABELS }: Props) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (active) setLoggedIn(Boolean(data.user));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="sticky top-0 z-50">
      <header className="flex items-center justify-between bg-slate-900 px-4 py-3 shadow-sm shadow-black/20 lg:px-16 lg:py-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label="ExpoLead OS home">
          <div className="grid grid-cols-2 gap-[3.5px] shrink-0">
            <div className="h-[10px] w-[10px] rounded-[2px] border-[1.8px] border-white" />
            <div className="h-[10px] w-[10px] rounded-[2px] border-[1.8px] border-white" />
            <div className="h-[10px] w-[10px] rounded-[2px] border-[1.8px] border-white" />
            <div className="h-[10px] w-[10px] rounded-[2px] bg-emerald-500" />
          </div>
          <span className="flex items-center text-[16px] leading-none tracking-tight">
            <span className="font-semibold text-white">Expo</span>
            <span className="font-semibold text-emerald-400">Lead</span>
            <span className="font-normal text-slate-400"> OS</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="mr-1 hidden items-center gap-7 md:flex lg:gap-8">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
              >
                {labels[item.key]}
              </Link>
            ))}
          </div>

          {loggedIn ? (
            <Link
              href="/dashboard"
              className="hidden shrink-0 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 md:block"
            >
              &larr; Back to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden items-center rounded-full border border-slate-600 px-5 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-400 hover:text-white md:inline-flex"
              >
                {labels.login}
              </Link>
              <Link
                href="/login?mode=signup"
                className="hidden shrink-0 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 md:block"
              >
                {labels.trial}
              </Link>
            </>
          )}

          {children}

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 md:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="border-t border-slate-800 bg-slate-900 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                {labels[item.key]}
              </Link>
            ))}
            {loggedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="mt-1 rounded-lg bg-emerald-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
              >
                &larr; Back to dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  {labels.login}
                </Link>
                <Link
                  href="/login?mode=signup"
                  onClick={() => setMenuOpen(false)}
                  className="mt-1 rounded-lg bg-emerald-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
                >
                  {labels.trial}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
