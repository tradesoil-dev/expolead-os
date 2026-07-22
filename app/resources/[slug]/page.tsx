import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES, getArticle } from "@/lib/articles";
import ShareButtons from "@/components/ShareButtons";
import PublicHeader from "@/components/PublicHeader";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const url = `https://expolead.tradesoil.com/resources/${article.slug}`;
  // Social crawlers cannot render SVG, so share previews point at the PNG copy
  // of the cover illustration. Defining openGraph here replaces the one in the
  // root layout wholesale, so the image has to be repeated or the card shows
  // with no picture at all.
  const image = article.image
    ? `https://expolead.tradesoil.com/articles/og/${article.slug}.png`
    : "https://expolead.tradesoil.com/og.png";
  return {
    title: `${article.title} | ExpoLead OS`,
    description: article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url,
      type: "article",
      siteName: "ExpoLead OS",
      images: [{ url: image, width: 1200, height: 630, alt: article.imageAlt ?? article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [image],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const related = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedISO,
    author: { "@type": "Organization", name: "ExpoLead OS" },
    publisher: { "@type": "Organization", name: "ExpoLead OS" },
    mainEntityOfPage: `https://expolead.tradesoil.com/resources/${article.slug}`,
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PublicHeader />

      <article className="mx-auto max-w-2xl px-6 py-14">
        <p className="text-sm text-slate-400">
          <Link href="/resources" className="text-emerald-600 hover:text-emerald-700">Resources</Link>
          <span className="mx-1.5">·</span>{article.topic}
        </p>
        <h1 className="mt-3 text-3xl font-black leading-[1.15] tracking-tight text-slate-900 md:text-4xl">{article.title}</h1>
        <p className="mt-4 text-sm text-slate-400">
          By ExpoLead OS <span className="mx-1.5 text-slate-300">|</span> {article.readMinutes} min read{" "}
          <span className="mx-1.5 text-slate-300">|</span> Published on{" "}
          {new Date(article.publishedISO).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
        </p>

        {article.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={article.image}
            alt={article.imageAlt ?? ""}
            width={1200}
            height={630}
            className="mt-8 w-full rounded-2xl"
          />
        ) : (
          <div className="mt-8 flex h-44 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8" /><rect x="3" y="5" width="18" height="14" rx="2" /></svg>
          </div>
        )}

        <div className="mt-10">
          {article.body.map((block, i) => {
            if (block.type === "h2") {
              return <h2 key={i} className="mt-9 mb-3 text-xl font-black tracking-tight text-slate-900">{block.text}</h2>;
            }
            if (block.type === "h3") {
              return <h3 key={i} className="mt-6 mb-2 text-base font-bold text-slate-900">{block.text}</h3>;
            }
            if (block.type === "ul") {
              return (
                <ul key={i} className="mb-4 ml-1 space-y-2">
                  {block.items.map((item, j) => (
                    <li key={j} className="flex gap-3 text-[17px] leading-8 text-slate-700">
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              );
            }
            return <p key={i} className="mb-4 text-[17px] leading-8 text-slate-700">{block.text}</p>;
          })}
        </div>

        <ShareButtons
          url={`https://expolead.tradesoil.com/resources/${article.slug}`}
          title={article.title}
        />

        {/* CTA */}
        <div className="mt-12 rounded-2xl px-7 py-9 text-center text-white" style={{ background: "linear-gradient(115deg, #0f172a 0%, #065f46 48%, #10b981 100%)" }}>
          <h2 className="text-xl font-black tracking-tight">Stop losing leads after the show ends</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/85">ExpoLead OS captures every connection and reminds you when to follow up.</p>
          <Link href="/login?mode=signup" className="mt-5 inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">Start free trial</Link>
        </div>

        {/* Related */}
        <div className="mt-12">
          <p className="text-sm font-bold text-slate-500">Related articles</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {related.map((a) => (
              <Link key={a.slug} href={`/resources/${a.slug}`} className="group rounded-xl border border-slate-200 p-4 transition hover:border-emerald-300">
                <span className="text-xs font-bold uppercase tracking-wide text-emerald-600">{a.topic}</span>
                <p className="mt-1 text-[15px] font-semibold leading-snug text-slate-900 group-hover:text-emerald-700">{a.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </article>

      <footer className="bg-slate-900 px-6 py-8 text-center text-sm text-slate-400 lg:px-16">
        © 2026 ExpoLead OS. Built for exhibitions. Designed for revenue growth.
      </footer>
    </main>
  );
}
