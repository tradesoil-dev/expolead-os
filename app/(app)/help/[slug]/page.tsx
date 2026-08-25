import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import type { Block } from "@/lib/articles";
import { getHelpArticle, HELP_ARTICLES } from "@/lib/help-articles";

export function generateStaticParams() {
  return HELP_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getHelpArticle(slug);
  return { title: article ? `${article.title} — Help — ExpoLead OS` : "Help — ExpoLead OS" };
}

export default async function HelpArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getHelpArticle(slug);
  if (!article) notFound();

  return (
    <>
      <div className="px-6 md:px-8 pt-6">
        <Link href="/help" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
          ← Back to Help Center
        </Link>
      </div>
      <PageHeader title={article.title} subtitle={article.summary} />
      <main className="flex-1 p-6 md:p-8">
        <article className="max-w-2xl space-y-4">
          {article.body.map((block, i) => (
            <BlockView key={i} block={block} />
          ))}
        </article>
      </main>
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "h2":
      return <h2 className="pt-2 text-base font-bold text-slate-900">{block.text}</h2>;
    case "h3":
      return <h3 className="pt-1 text-sm font-bold text-slate-900">{block.text}</h3>;
    case "ul":
      return (
        <ul className="ml-1 space-y-1.5">
          {block.items.map((it, i) => (
            <li key={i} className="relative pl-5 text-sm leading-relaxed text-slate-600">
              <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {it}
            </li>
          ))}
        </ul>
      );
    default:
      return <p className="text-sm leading-relaxed text-slate-600">{block.text}</p>;
  }
}
