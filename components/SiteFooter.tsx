import Link from "next/link";

/**
 * Shared public footer for the redesign (light look). Deliberately honest:
 * NO invented office locations (the Lovable concept had "London / Hong Kong /
 * NYC", which is false) and NO "GDPR compliant" badge (an unbacked legal
 * claim). Only claims we can stand behind.
 */
export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-[#f4f3ee] px-8 py-12 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="text-[15px] font-bold uppercase tracking-tight" aria-label="ExpoLead OS home">
              <span className="text-slate-900">EXPOLEAD</span>
              <span className="text-emerald-600">&nbsp;OS</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Built for exhibitions. Designed for revenue growth.
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              <a
                href="mailto:hello.expolead@tradesoil.com"
                aria-label="Email ExpoLead OS"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>
              </a>
              <a
                href="https://www.linkedin.com/company/expolead-os/"
                target="_blank"
                rel="noreferrer"
                aria-label="ExpoLead OS on LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zM8 8h3.83v2.19h.05c.53-1 1.84-2.19 3.79-2.19 4.05 0 4.8 2.67 4.8 6.14V24h-4v-7.03c0-1.68-.03-3.84-2.34-3.84-2.34 0-2.7 1.83-2.7 3.72V24H8V8z" /></svg>
              </a>
            </div>
          </div>

          {/* Columns */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:gap-16">
            <div>
              <p className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Product</p>
              <div className="flex flex-col gap-3 text-sm">
                <Link href="/pricing" className="text-slate-700 transition-colors hover:text-slate-950">Pricing</Link>
                <Link href="/trade-shows" className="text-slate-700 transition-colors hover:text-slate-950">Exhibitions</Link>
                <Link href="/login?mode=signup" className="text-slate-700 transition-colors hover:text-slate-950">Start free trial</Link>
              </div>
            </div>
            <div>
              <p className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Legal</p>
              <div className="flex flex-col gap-3 text-sm">
                <Link href="/privacy" className="text-slate-700 transition-colors hover:text-slate-950">Privacy</Link>
                <Link href="/terms" className="text-slate-700 transition-colors hover:text-slate-950">Terms</Link>
              </div>
            </div>
            <div>
              <p className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Contact</p>
              <a href="mailto:hello.expolead@tradesoil.com" className="text-sm text-slate-700 transition-colors hover:text-slate-950">
                hello.expolead@tradesoil.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400">
            © 2026 ExpoLead OS · HTTPS/TLS encrypted · Export anytime
          </p>
        </div>
      </div>
    </footer>
  );
}
