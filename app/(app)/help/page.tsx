import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { HELP_ARTICLES } from "@/lib/help-articles";

export const metadata = { title: "Help Center — ExpoLead OS" };

export default function HelpPage() {
  return (
    <>
      <PageHeader title="Help Center" subtitle="Short guides for getting the most out of ExpoLead OS" />
      <main className="flex-1 p-6 md:p-8">
        <div className="grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
          {HELP_ARTICLES.map((a) => (
            <Link
              key={a.slug}
              href={`/help/${a.slug}`}
              className="group rounded-xl border border-ink-200 bg-white p-5 shadow-card transition-colors hover:border-emerald-300"
            >
              <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700">{a.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{a.summary}</p>
              <span className="mt-3 inline-block text-xs font-semibold text-emerald-600">Read guide →</span>
            </Link>
          ))}
        </div>

        <div className="mt-6 max-w-3xl rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-800">
            Can&rsquo;t find what you need? Email us at{" "}
            <a href="mailto:hello@expoleados.com?subject=ExpoLead%20OS%20support%20request" className="font-semibold underline hover:text-emerald-900">
              hello@expoleados.com
            </a>{" "}
            and we&rsquo;ll help.
          </p>
        </div>
      </main>
    </>
  );
}
