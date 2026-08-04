const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root to this project. A stray package-lock.json in a
  // parent folder (a home-directory npm install) otherwise makes Next infer
  // the wrong root, which breaks Tailwind's content detection and prints a
  // "multiple lockfiles" warning on every build.
  outputFileTracingRoot: path.join(__dirname),
};
module.exports = nextConfig;
