import type { Metadata } from "next";

// The features page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Product — ExpoLead OS",
  description:
    "See how ExpoLead OS captures booth connections, tracks products, samples and quotations, keeps follow-ups on schedule, and shows the ROI of every exhibition.",
  alternates: { canonical: "https://expoleados.com/features" },
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
