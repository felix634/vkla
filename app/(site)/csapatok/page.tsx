import type { Metadata } from "next";
import PageHero from "../../components/site/PageHero";
import CoachRoster from "../../components/CoachRoster";
import { getCsapatok } from "../../lib/sanity/tartalom";
import { EXTERNAL } from "../../lib/nav";

export const metadata: Metadata = {
  title: "Csapatok — Vasas Kubala Akadémia",
};

export const revalidate = 300;

// Felosztás Berkes Máté 2026.09.09-i döntése szerint: Akadémia (U15–U19),
// Pre-akadémia (U12–U14), Női szakág — az U5–U11 fiúcsapatok nem szerepelnek.
const SECTIONS = [
  { id: "akademia", name: "Akadémia" },
  { id: "pre-akademia", name: "Pre-akadémia" },
  { id: "noi", name: "Női szakág" },
];

export default async function CsapatokPage() {
  const csapatok = await getCsapatok();
  const lathato = csapatok?.filter((c) => SECTIONS.some((s) => s.name === c.section));

  return (
    <main className="min-h-screen">
      <PageHero
        breadcrumb="Csapatok"
        eyebrow="Csapataink"
        title={
          <>
            {lathato?.length ?? 16} korosztály,{" "}
            <span className="text-gold-light">egy közös cél.</span>
          </>
        }
        subtitle="Válaszd ki a korosztályt, és az edzőre kattintva megnézheted a stábot és a keretet. A játékos-névsorok és a fotók folyamatosan töltődnek fel."
      />

      <section className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">
          {csapatok && csapatok.length > 0 ? (
            SECTIONS.map((sec) => {
              const teams = csapatok.filter((c) => c.section === sec.name);
              if (teams.length === 0) return null;
              return (
                <div key={sec.id} id={sec.id} className="scroll-mt-28">
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="font-display font-black text-2xl md:text-3xl text-white">
                      {sec.name}
                    </h2>
                    <span className="flex-1 h-px bg-white/10" />
                    <span className="text-sm text-white/50">{teams.length} korosztály</span>
                  </div>
                  <CoachRoster teams={teams} />
                </div>
              );
            })
          ) : (
            <CoachRoster teams={null} />
          )}

          {/* Vasas FC II — átkötő link (jegyzőkönyv) */}
          <div className="rounded-md border border-white/10 bg-white/5 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="font-display font-black text-2xl text-gold-light mb-1">Vasas FC II</h3>
              <p className="text-white/70 text-sm max-w-lg">
                A második csapat a Vasas FC weboldalán érhető el — a gomb átirányít a hivatalos oldalra.
              </p>
            </div>
            <a
              href={EXTERNAL.vasasFcII}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-2 border-gold/50 text-gold hover:bg-gold hover:text-navy transition-colors px-6 py-3 font-bold rounded-sm text-sm flex-shrink-0"
            >
              Vasas FC II oldala
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M7 17L17 7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
