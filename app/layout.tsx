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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vkla.vercel.app";
// Az indexelés env-kapcsolós: éles domainre állásig (vkla.hu) noindex marad,
// hogy a keresők ne duplikálják a régi oldal mellé. Élesítéskor:
// NEXT_PUBLIC_SITE_INDEXABLE=true a Vercelen.
const INDEXABLE = process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vasas Kubala Akadémia",
    template: "%s",
  },
  description:
    "A Vasas Kubala Akadémia hivatalos oldala — hírek, csapatok, edzői stáb, programok, létesítmények, tagdíjfizetés és szponzoráció.",
  openGraph: {
    siteName: "Vasas Kubala Akadémia",
    locale: "hu_HU",
    type: "website",
    images: ["/images/team.jpg"],
  },
  robots: INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
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
