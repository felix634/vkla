import Hero from "../components/Hero";
import QuickActions from "../components/QuickActions";
import News from "../components/News";
import Academy from "../components/Academy";
import Teams from "../components/Teams";
import Matches from "../components/Matches";
import Programs from "../components/Programs";
import FacilitiesTeaser from "../components/FacilitiesTeaser";
import Sponsors from "../components/Sponsors";
import JoinCTA from "../components/JoinCTA";

// A chrome (banner, TopBar, Header, Footer) a layout.tsx-ben van — minden aloldal osztozik rajta.
// Az "Oktatás" szekció kikerült; helyére a Létesítmények teaser került (jegyzőkönyv).
export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <QuickActions />
      <News />
      <Academy />
      <Teams />
      <Matches />
      <Programs />
      <FacilitiesTeaser />
      <Sponsors />
      <JoinCTA />
    </main>
  );
}
