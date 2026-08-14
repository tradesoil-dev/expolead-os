import type { Metadata } from "next";

// Auth page: crawlable (not disallowed in robots) but noindex, so Google
// drops it from the index instead of showing a login screen in results.
export const metadata: Metadata = {
  title: "Log in — ExpoLead OS",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
