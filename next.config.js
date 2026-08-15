const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root to this project. A stray package-lock.json in a
  // parent folder (a home-directory npm install) otherwise makes Next infer
  // the wrong root, which breaks Tailwind's content detection and prints a
  // "multiple lockfiles" warning on every build.
  outputFileTracingRoot: path.join(__dirname),

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
