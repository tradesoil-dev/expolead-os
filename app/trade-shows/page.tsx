import type { Metadata } from "next";
import { getExhibitionLibrary } from "@/lib/data";
import TradeShowsDirectory from "@/components/TradeShowsDirectory";
import PublicHeader from "@/components/PublicHeader";
import SiteFooter from "@/components/SiteFooter";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "Upcoming Trade Exhibitions Directory — ExpoLead OS",
  description:
    "Browse major B2B trade exhibitions by industry — dates, venues and sectors. Food & beverage, chemicals, coatings, fertilizer, private label and more. Track the shows you attend in ExpoLead OS.",
};

export default async function TradeShowsPage() {
  const shows = await getExhibitionLibrary();

  return (
    <main className="min-h-screen bg-[#f8f7f3] text-slate-950">
      <SmoothScroll />
      <PublicHeader />

      {/* HERO */}
      <section className="px-8 pb-10 pt-16 lg:px-16 lg:pt-20">
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">Exhibition directory</p>
          <h1 className="text-5xl font-extrabold leading-[1.03] tracking-tight text-slate-950 md:text-6xl">
            Upcoming trade <span className="whitespace-nowrap italic text-emerald-600">exhibitions.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-500">
            Browse major B2B trade shows by industry. Track the ones you attend in ExpoLead OS, with every lead, sample and follow-up in one place.
          </p>
        </div>
      </section>

      {/* DIRECTORY */}
      <section className="px-8 pb-24 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <TradeShowsDirectory shows={shows} />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
