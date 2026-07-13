import { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/articles";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://expolead.tradesoil.com";

  const articleUrls: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${base}/resources/${a.slug}`,
    lastModified: new Date(a.publishedISO),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/features`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/resources`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/trade-shows`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    ...articleUrls,
  ];
}
