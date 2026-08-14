import { MetadataRoute } from "next";

/**
 * Public marketing/content is fully crawlable. The logged-in application
 * routes are disallowed (they redirect to /login for anyone not signed in, so
 * there is nothing useful to crawl there). The auth pages (/login,
 * /reset-password, /update-password) are deliberately NOT disallowed here so
 * Google can crawl them and honour their noindex meta.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/suppliers",
        "/opportunities",
        "/follow-ups",
        "/reports",
        "/profile",
        "/billing",
        "/upgrade",
        "/admin",
        "/auth",
      ],
    },
    sitemap: "https://expoleados.com/sitemap.xml",
    host: "https://expoleados.com",
  };
}
