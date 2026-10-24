import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CAMPAIGNS } from "@/lib/survey-v2";
import SurveyFlow from "@/components/SurveyFlow";

// Public post-show survey for one show, e.g. /survey/sial-paris-2026, shared
// on LinkedIn and elsewhere. No sign-in. An optional ?src= tag (linkedin,
// whatsapp...) records where the answer came from.

type Params = { params: Promise<{ campaign: string }>; searchParams: Promise<{ src?: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { campaign } = await params;
  const c = CAMPAIGNS[campaign];
  if (!c) return { title: "Survey not found", robots: { index: false } };
  const title = `${c.label}: post-show check`;
  const description = `A 3 minute survey for everyone who exhibited at or visited ${c.exhibition}. Get your personal post-show report.`;
  const image = `https://expoleados.com/og/${c.slug}-survey.png`;
  return {
    title,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: `https://expoleados.com/survey/${c.slug}` },
    openGraph: { title, description, url: `https://expoleados.com/survey/${c.slug}`, siteName: "ExpoLead OS", type: "website", images: [{ url: image, width: 1200, height: 627 }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function SurveyPage({ params, searchParams }: Params) {
  const { campaign } = await params;
  const { src } = await searchParams;
  const c = CAMPAIGNS[campaign];
  if (!c) notFound();

  if (!c.open) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center">
          <h1 className="text-xl font-bold text-slate-900">This survey has closed</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">Thank you for your interest. Follow ExpoLead OS on LinkedIn for the combined results.</p>
        </div>
      </main>
    );
  }

  const source = typeof src === "string" ? src.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40) : "";
  return <SurveyFlow mode="public" exhibition={c.exhibition} campaignLabel={c.label} campaignSlug={c.slug} source={source} />;
}
