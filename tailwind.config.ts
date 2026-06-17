import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand chrome — confident indigo
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#5b5ef0",
          600: "#4f46e5",
          700: "#4338ca",
        },
        // Neutral ink + paper canvas
        ink: {
          900: "#16161d",
          700: "#3a3a44",
          500: "#6b6b78",
          400: "#9a9aa6",
          200: "#e4e4ea",
          100: "#eeeef2",
          50: "#f7f7f9",
        },
        paper: "#fafaf8",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,16,29,0.04), 0 1px 3px rgba(16,16,29,0.06)",
        lift: "0 4px 16px rgba(16,16,29,0.08)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};

export default config;
