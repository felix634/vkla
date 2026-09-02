import SmoothScroll from "../components/SmoothScroll";
import MockupBanner from "../components/MockupBanner";
import TopBar from "../components/TopBar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getBeallitasok } from "../lib/sanity/tartalom";

export const revalidate = 300;

// Közös chrome minden publikus oldalhoz. A /studio nem ide tartozik.
// Az elérhetőségek/social linkek a CMS "Oldal beállítások" dokumentumából jönnek.
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const beallitasok = await getBeallitasok();
  return (
    <>
      <SmoothScroll />
      <MockupBanner />
      <TopBar b={beallitasok} />
      <Header />
      {children}
      <Footer b={beallitasok} />
    </>
  );
}
