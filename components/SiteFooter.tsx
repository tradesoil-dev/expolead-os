import Link from "next/link";

/**
 * Shared public footer for the redesign (light look). Deliberately honest:
 * only real locations (Sri Lanka, Australia) and only claims we can stand
 * behind — NO invented offices, NO unbacked "GDPR compliant" badge.
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
                href="https://wa.me/94763070841"
                target="_blank"
                rel="noreferrer"
                aria-label="ExpoLead OS on WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.44 9.44 0 0 1-1.45-5.04c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.9.99 6.69 2.78a9.42 9.42 0 0 1 2.77 6.7c-.01 5.22-4.26 9.47-9.48 9.47zm8.06-17.53A11.36 11.36 0 0 0 12.05.62C5.8.62.73 5.69.73 11.94c0 2 .52 3.95 1.52 5.67L.63 23.38l5.9-1.55a11.31 11.31 0 0 0 5.42 1.38h.01c6.25 0 11.32-5.07 11.33-11.32a11.26 11.26 0 0 0-3.18-7.92z" /></svg>
              </a>
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

          {/* Columns — ExpoLead OS (About), Product, Legal, Contact */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 md:gap-12">
            <div>
              <p className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">ExpoLead OS</p>
              <div className="flex flex-col gap-3 text-sm">
                <Link href="/about" className="text-slate-700 transition-colors hover:text-emerald-600">About</Link>
                <Link href="/features" className="text-slate-700 transition-colors hover:text-emerald-600">Product overview</Link>
              </div>
            </div>
            <div>
              <p className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Product</p>
              <div className="flex flex-col gap-3 text-sm">
                <Link href="/pricing" className="text-slate-700 transition-colors hover:text-emerald-600">Pricing</Link>
                <Link href="/trade-shows" className="text-slate-700 transition-colors hover:text-emerald-600">Exhibitions</Link>
                <Link href="/login?mode=signup" className="text-slate-700 transition-colors hover:text-emerald-600">Start free trial</Link>
              </div>
            </div>
            <div>
              <p className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Legal</p>
              <div className="flex flex-col gap-3 text-sm">
                <Link href="/privacy" className="text-slate-700 transition-colors hover:text-emerald-600">Privacy</Link>
                <Link href="/terms" className="text-slate-700 transition-colors hover:text-emerald-600">Terms</Link>
              </div>
            </div>
            <div>
              <p className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Contact</p>
              <a href="mailto:hello.expolead@tradesoil.com" className="text-sm text-slate-700 transition-colors hover:text-emerald-600">
                hello.expolead@tradesoil.com
              </a>
              <p className="mt-3 text-sm text-slate-500">Sri Lanka | Australia</p>
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
