"use client";

import Link from "next/link";
import { useState } from "react";

export default function WelcomeCard() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-emerald-800">Welcome to ExpoLead OS</p>
        <p className="mt-1 text-sm text-emerald-700">
          New here? We've added sample data to help you explore.{" "}
          <Link href="/getting-started" className="font-bold underline hover:text-emerald-900">
            Read the getting started guide →
          </Link>
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 text-emerald-500 hover:text-emerald-800 transition-colors"
        aria-label="Dismiss"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
