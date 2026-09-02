const path = require("path");

// Derive the Supabase origin (and its websocket form) from the public env so the
// CSP allows the browser's Supabase calls without hardcoding the project URL.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
let supabaseOrigin = "";
try {
  if (supabaseUrl) supabaseOrigin = new URL(supabaseUrl).origin;
} catch {
  supabaseOrigin = "";
}
const supabaseWss = supabaseOrigin ? supabaseOrigin.replace(/^https:/, "wss:") : "";

// Content Security Policy. 'unsafe-inline' on script/style is required by the
// Next App Router (it injects inline bootstrap script and styles); a nonce-based
// policy is a later hardening step. Fonts are self-hosted (next/font), so no
// external font origins are needed. The only cross-origin the browser talks to
// is Supabase (REST/auth over https, realtime over wss) plus Supabase Storage
// for avatars (img-src).
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  `img-src 'self' data: blob:${supabaseOrigin ? " " + supabaseOrigin : ""}`,
  `connect-src 'self'${supabaseOrigin ? " " + supabaseOrigin : ""}${supabaseWss ? " " + supabaseWss : ""}`,
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), browsing-topics=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root to this project. A stray package-lock.json in a
  // parent folder (a home-directory npm install) otherwise makes Next infer
  // the wrong root, which breaks Tailwind's content detection and prints a
  // "multiple lockfiles" warning on every build.
  outputFileTracingRoot: path.join(__dirname),

  // Security headers applied to every route.
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  // The connections feature used to live at /suppliers. Keep old bookmarks and
  // links working with permanent (308) redirects to the new /connections path.
  async redirects() {
    return [
      { source: "/suppliers", destination: "/connections", permanent: true },
      { source: "/suppliers/:path*", destination: "/connections/:path*", permanent: true },
    ];
  },
};
module.exports = nextConfig;
