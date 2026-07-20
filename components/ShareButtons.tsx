"use client";

import { useState } from "react";

type Props = {
  /** Absolute URL of the article being shared. */
  url: string;
  /** Article title, used as the pre-filled message on WhatsApp and X. */
  title: string;
};

/**
 * Plain share links, no third-party widgets. The official Facebook/X/LinkedIn
 * button scripts load tracking into the page and slow it down; these are just
 * anchor tags to each network's share endpoint, so nothing is loaded and no
 * reader is tracked.
 */
export default function ShareButtons({ url, title }: Props) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: (
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM2.4 21h5.16V9.24H2.4V21zM10.2 9.24h4.95v1.6h.07c.69-1.24 2.37-2.55 4.88-2.55 5.22 0 6.18 3.3 6.18 7.6V21h-5.15v-4.6c0-1.1-.02-2.5-1.6-2.5-1.6 0-1.85 1.19-1.85 2.42V21H10.2V9.24z" />
      ),
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      icon: (
        <path d="M12.04 2c-5.5 0-9.97 4.46-9.97 9.96 0 1.76.46 3.47 1.34 4.98L2 22l5.2-1.36a9.94 9.94 0 0 0 4.84 1.24h.01c5.5 0 9.96-4.47 9.96-9.97 0-2.66-1.04-5.16-2.92-7.04A9.9 9.9 0 0 0 12.04 2zm5.83 14.24c-.25.7-1.44 1.33-1.99 1.41-.53.08-1.2.11-1.94-.12-.45-.14-1.02-.33-1.76-.65-3.1-1.34-5.12-4.46-5.28-4.67-.15-.21-1.26-1.67-1.26-3.19 0-1.51.79-2.26 1.08-2.57.28-.31.61-.38.82-.38l.59.01c.19 0 .44-.07.69.53.25.6.86 2.11.94 2.26.08.16.13.34.03.55-.11.2-.16.33-.31.51-.16.18-.33.4-.47.54-.16.15-.32.32-.14.63.19.31.83 1.36 1.77 2.2 1.22 1.08 2.24 1.42 2.56 1.58.31.15.5.13.68-.08.19-.21.79-.92 1-1.24.2-.31.41-.26.68-.15.28.1 1.78.84 2.09.99.3.16.5.23.58.36.07.13.07.75-.18 1.47z" />
      ),
    },
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: (
        <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.66l7.73-8.84L1.24 2.25h6.83l4.71 6.23 5.46-6.23zm-1.16 17.52h1.83L7.08 4.13H5.11l11.97 15.64z" />
      ),
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context or denied permission) — leave the
      // label alone rather than claiming a copy that did not happen.
    }
  }

  return (
    <div className="mt-12 border-t border-slate-200 pt-6">
      <p className="text-sm font-bold text-slate-500">Share this article</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${link.name}`}
            className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              {link.icon}
            </svg>
            {link.name}
          </a>
        ))}

        <button
          type="button"
          onClick={copyLink}
          className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {copied ? "Link copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
