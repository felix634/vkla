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
import { getHirek } from "../lib/sanity/hirek";
import { getCsapatok, getSzponzorok } from "../lib/sanity/tartalom";

export const revalidate = 300;

// A chrome (banner, TopBar, Header, Footer) a layout.tsx-ben van — minden aloldal osztozik rajta.
// Az "Oktatás" szekció kikerült; helyére a Létesítmények teaser került (jegyzőkönyv).
export default async function Home() {
  // A 3 legfrissebb hír a CMS-ből; env nélkül a News a saját placeholderét mutatja.
  const [{ items }, csapatok, szponzorok] = await Promise.all([
    getHirek({ page: 1 }),
    getCsapatok(),
    getSzponzorok(),
  ]);

  return (
    <main className="min-h-screen">
      <Hero />
      <QuickActions />
      <News items={items.slice(0, 3)} />
      <Academy />
      <Teams teams={csapatok} />
      <Matches />
      <Programs />
      <FacilitiesTeaser />
      <Sponsors szponzorok={szponzorok} />
      <JoinCTA />
    </main>
  );
}
