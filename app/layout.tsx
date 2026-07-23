import type { Metadata } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";
import MockupBanner from "./components/MockupBanner";
import TopBar from "./components/TopBar";
import Header from "./components/Header";
import Footer from "./components/Footer";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu" className={`${inter.variable} ${display.variable}`}>
      <body>
        <SmoothScroll />
        {/* Közös chrome — minden aloldalon egységes */}
        <MockupBanner />
        <TopBar />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
