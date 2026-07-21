import Link from "next/link";
import type { Metadata } from "next";
import { getExhibitionLibrary } from "@/lib/data";
import TradeShowsDirectory from "@/components/TradeShowsDirectory";
import PublicHeader from "@/components/PublicHeader";

export const metadata: Metadata = {
  title: "Upcoming Trade Exhibitions Directory — ExpoLead OS",
  description:
    "Browse major B2B trade exhibitions by industry — dates, venues and sectors. Food & beverage, chemicals, coatings, fertilizer, private label and more. Track the shows you attend in ExpoLead OS.",
};

export default async function TradeShowsPage() {
  const shows = await getExhibitionLibrary();

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-emerald-50/40 to-sky-50/40 text-slate-950">
      {/* HEADER */}
      <PublicHeader />

      {/* HERO */}
      <section className="px-6 pt-8 pb-8 lg:px-16">
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
          ← Back to home
        </Link>
        <div className="mt-6 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">Exhibition directory</p>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Upcoming trade exhibitions</h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-600">
          Browse major B2B trade shows by industry. Track the ones you attend in ExpoLead OS — with every lead, sample and follow-up in one place.
        </p>
        </div>
      </section>

      {/* DIRECTORY */}
      <section className="mx-auto max-w-5xl px-6 pb-20 lg:px-16">
        <TradeShowsDirectory shows={shows} />
      </section>
    </main>
  );
}
