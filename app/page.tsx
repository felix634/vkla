import TopBar from "./components/TopBar";
import Header from "./components/Header";
import Hero from "./components/Hero";
import QuickActions from "./components/QuickActions";
import News from "./components/News";
import Academy from "./components/Academy";
import Teams from "./components/Teams";
import Matches from "./components/Matches";
import Programs from "./components/Programs";
import Education from "./components/Education";
import Sponsors from "./components/Sponsors";
import JoinCTA from "./components/JoinCTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Mockup banner */}
      <div className="bg-gold text-navy text-center text-xs py-1.5 font-bold tracking-[0.2em] uppercase">
        Látványterv — nem kattintható, csak vizuális bemutató
      </div>

      <TopBar />
      <Header />
      <Hero />
      <QuickActions />
      <News />
      <Academy />
      <Teams />
      <Matches />
      <Programs />
      <Education />
      <Sponsors />
      <JoinCTA />
      <Footer />
    </main>
  );
}
