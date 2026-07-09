"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";

export default function HelpMenu() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function handleOpen() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setOpen((o) => !o);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={handleOpen}
        className={`h-9 w-9 rounded-full flex items-center justify-center transition-colors ${open ? "bg-emerald-100 text-emerald-700" : "text-ink-400 hover:bg-ink-100 hover:text-ink-700"}`}
        aria-label="Help"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" strokeLinecap="round" />
          <circle cx="12" cy="17" r="0.5" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{ top: pos.top, right: pos.right }}
          className="fixed z-[9999] w-56 rounded-xl border border-ink-200 bg-white shadow-lg overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-ink-100">
            <p className="text-sm font-semibold text-ink-900">Help & Support</p>
          </div>
          <div className="py-1">
            <Link
              href="/getting-started"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
            >
              <GettingStartedIcon className="h-4 w-4 text-ink-400" />
              Getting started
            </Link>
            <a
              href="mailto:hello.expolead@tradesoil.com?subject=ExpoLead%20OS%20support%20request"
              className="flex items-center gap-3 px-4 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              <EmailIcon className="h-4 w-4 text-ink-400" />
              Email support
            </a>
            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
            >
              <PlansIcon className="h-4 w-4 text-ink-400" />
              View plans
            </Link>
            <div className="flex items-center gap-3 px-4 py-2 text-sm text-ink-300 cursor-not-allowed select-none">
              <DocsIcon className="h-4 w-4" />
              Documentation
              <span className="ml-auto text-[10px] font-semibold border border-ink-200 rounded px-1.5 py-0.5">Soon</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GettingStartedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" strokeLinecap="round" />
    </svg>
  );
}

function PlansIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" strokeLinecap="round" />
    </svg>
  );
}

function DocsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  );
}
