import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExpoLead OS",
  description: "Capture suppliers, track opportunities, and follow up faster from every exhibition you attend.",
  metadataBase: new URL("https://expolead-os.vercel.app"),
  openGraph: {
    title: "ExpoLead OS",
    description: "Capture suppliers, track opportunities, and follow up faster from every exhibition you attend.",
    url: "https://expolead-os.vercel.app",
    siteName: "ExpoLead OS",
    type: "website",
    images: [{ url: "https://expolead-os.vercel.app/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ExpoLead OS",
    description: "Capture suppliers, track opportunities, and follow up faster from every exhibition you attend.",
    images: ["https://expolead-os.vercel.app/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
