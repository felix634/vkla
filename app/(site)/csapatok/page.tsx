import type { Metadata } from "next";
import PageHero from "../../components/site/PageHero";
import CoachRoster from "../../components/CoachRoster";
import { getCsapatok } from "../../lib/sanity/tartalom";

export const metadata: Metadata = {
  title: "Csapatok – Vasas Kubala Akadémia",
};

export const revalidate = 300;

// Felosztás Berkes Máté 2026.09.09-i döntése szerint: Akadémia (U15–U19),
// Pre-akadémia (U12–U14), Női szakág — az U5–U11 fiúcsapatok nem szerepelnek.
// A Vasas FC II. legfelül, saját kerettel (Tóth Patrik, 2026.10.23.). A „cms” a Studio
// szekció-értéke, a „name” a kiírt cím (római szám után pont: Tóth Patrik, 2. kör, 2026.11.16.).
const SECTIONS = [
  { id: "vasas-fc-ii", cms: "Vasas FC II", name: "Vasas FC II." },
  { id: "akademia", cms: "Akadémia", name: "Akadémia" },
  { id: "pre-akademia", cms: "Pre-akadémia", name: "Pre-akadémia" },
  { id: "noi", cms: "Női szakág", name: "Női szakág" },
];

export default async function CsapatokPage() {
  const csapatok = await getCsapatok();

  return (
    <main className="min-h-screen">
      <PageHero
        breadcrumb="Csapatok"
        eyebrow="Vasas Kubala Akadémia"
        title={<span className="text-gold-light">Csapataink</span>}
        subtitle="Válaszd ki a korosztályt, és az edzőre kattintva megnézheted a stábot és a keretet."
      />

      <section className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">
          {csapatok && csapatok.length > 0 ? (
            SECTIONS.map((sec) => {
              const teams = csapatok.filter((c) => c.section === sec.cms);
              if (teams.length === 0) return null;
              return (
                <div key={sec.id} id={sec.id} className="scroll-mt-28">
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="font-display font-black text-2xl md:text-3xl text-white">
                      {sec.name}
                    </h2>
                    <span className="flex-1 h-px bg-white/10" />
                    {teams.length > 1 && <span className="text-sm text-white/50">{teams.length} korosztály</span>}
                  </div>
                  <CoachRoster teams={teams} />
                </div>
              );
            })
          ) : (
            <CoachRoster teams={null} />
          )}
        </div>
      </section>
    </main>
  );
}
