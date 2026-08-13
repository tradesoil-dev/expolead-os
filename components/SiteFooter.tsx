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
              Exhibition connection and lead management. Powered by Tradesoil.
            </p>
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
