import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExpoLead OS — Exhibition Lead Management for Trade Professionals",
  description: "Capture booth visits, qualify buyers, track samples and follow-ups in one workspace built for international trade exhibitions. Start your free 14-day trial, no credit card required.",
  metadataBase: new URL("https://expolead.tradesoil.com"),
  openGraph: {
    title: "ExpoLead OS — Exhibition Lead Management for Trade Professionals",
    description: "Capture booth visits, qualify buyers, track samples and follow-ups in one workspace built for international trade exhibitions. Start your free 14-day trial, no credit card required.",
    url: "https://expolead.tradesoil.com",
    siteName: "ExpoLead OS",
    type: "website",
    images: [{ url: "https://expolead.tradesoil.com/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ExpoLead OS — Exhibition Lead Management for Trade Professionals",
    description: "Capture booth visits, qualify buyers, track samples and follow-ups in one workspace built for international trade exhibitions. Start your free 14-day trial, no credit card required.",
    images: ["https://expolead.tradesoil.com/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
