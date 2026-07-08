import type { SelectHTMLAttributes } from "react";

// Modern, consistent dropdown used across the app. It keeps the native
// <select> (so the option list is never clipped inside scroll containers)
// but restyles the control with a custom chevron and focus ring.
export default function Select({ className = "", children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...rest}
        className={`w-full appearance-none rounded-lg border border-ink-200 bg-white py-2.5 pl-3 pr-9 text-sm font-semibold text-slate-800 outline-none transition-colors hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${className}`}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}
