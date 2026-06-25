import Link from "next/link";
import type { Metadata } from "next";
import { getExhibitionLibrary } from "@/lib/data";
import TradeShowsDirectory from "@/components/TradeShowsDirectory";

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
      <header className="sticky top-0 z-50 flex items-center justify-between bg-slate-900 px-6 py-4 shadow-sm shadow-black/20 lg:px-16">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="grid grid-cols-2 gap-[3.5px] shrink-0">
            <div className="w-[10px] h-[10px] rounded-[2px] border-[1.8px] border-white" />
            <div className="w-[10px] h-[10px] rounded-[2px] border-[1.8px] border-white" />
            <div className="w-[10px] h-[10px] rounded-[2px] border-[1.8px] border-white" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-500" />
          </div>
          <span className="flex items-center text-[16px] tracking-tight leading-none">
            <span className="font-semibold text-white">Expo</span>
            <span className="font-semibold text-emerald-400">Lead</span>
            <span className="font-normal text-slate-400"> OS</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Log in
          </Link>
          <Link href="/login?mode=signup" className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors">
            Start free trial
          </Link>
        </div>
      </header>

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
