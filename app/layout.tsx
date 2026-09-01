import type { Metadata } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const display = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vasas Kubala Akadémia — Látványterv",
  description:
    "Vasas Kubala Akadémia új weboldalának teljes látványterve. Prometheus Digital Kft.",
  // Látványterv — ne kerüljön a keresőkbe a vkla.hu mellé
  robots: { index: false, follow: false },
};

// Csupasz gyökér-layout: csak a betűtípusok és a globális stílus.
// A site-chrome (banner, menü, lábléc, Lenis) az app/(site)/layout.tsx-ben van,
// így a /studio (Sanity) saját, chrome-mentes felületet kap.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu" className={`${inter.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
