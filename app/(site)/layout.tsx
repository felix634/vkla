import SmoothScroll from "../components/SmoothScroll";
import MockupBanner from "../components/MockupBanner";
import TopBar from "../components/TopBar";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Közös chrome minden publikus oldalhoz. A /studio nem ide tartozik.
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SmoothScroll />
      <MockupBanner />
      <TopBar />
      <Header />
      {children}
      <Footer />
    </>
  );
}
