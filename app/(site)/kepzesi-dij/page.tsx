import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "../../components/site/PageHero";
import { BANKSZAMLA, KEDVEZMENYEZETT } from "../../lib/fiok/format";

export const metadata: Metadata = {
  title: "Képzési díj — Vasas Kubala Akadémia",
};

// A képzési díj a képzési szerződés alapján, havonta kiállított számlával
// fizetendő (a klub 2026.09.23-i tájékoztatása szerint). A számlák a szülői
// fiókban és e-mailben is megérkeznek.
const STEPS = [
  {
    n: "1",
    title: "Havi számla",
    desc: "A képzési díjról minden hónap második felében számlát állítunk ki, a képzési szerződés alapján.",
  },
  {
    n: "2",
    title: "Értesítés e-mailben",
    desc: "A számlát e-mailben is elküldjük, a PDF-et csatolva — így a levélből is könnyen fizethető.",
  },
  {
    n: "3",
    title: "Szülői fiók",
    desc: "Belépés jelszó nélkül, az e-mail-címeddel: minden gyermeked számlája egy helyen.",
  },
  {
    n: "4",
    title: "Fizetés átutalással",
    desc: "A fizetési határidő az adott hónap utolsó napja.",
  },
];

export default function KepzesiDijPage() {
  return (
    <main className="min-h-screen">
      <PageHero
        breadcrumb="Képzési díj"
        eyebrow="Szülői fiók"
        title={
          <>
            Képzési díj <span className="text-gold-light">egyszerűen.</span>
          </>
        }
        subtitle="A havi képzési díj számláját e-mailben és a szülői fiókban is megkapod — egy fiókban látod az összes gyermeked számláit."
        aside={
          <Link
            href="/belepes"
            className="inline-block bg-vasasRed hover:bg-vasasRedDark transition-colors text-white font-bold px-6 py-3 rounded-md text-sm"
          >
            Belépés a szülői fiókba
          </Link>
        }
      />

      {/* Így működik */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s) => (
              <div key={s.n} className="relative rounded-md border border-gray-100 bg-cream p-6">
                <div className="w-10 h-10 rounded-md bg-navy text-gold font-display font-black flex items-center justify-center mb-4">
                  {s.n}
                </div>
                <h3 className="font-display font-bold text-lg text-navy mb-1">{s.title}</h3>
                <p className="text-sm text-navy/60 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Befizetés átutalással */}
          <div className="rounded-md border border-gold/40 bg-gold/5 p-6 md:p-7">
            <h3 className="font-display font-bold text-lg text-navy mb-3">Befizetés átutalással</h3>
            <p className="text-sm text-navy/70 mb-4">
              A képzési díj a {KEDVEZMENYEZETT} bankszámlájára utalható:
            </p>
            <div className="font-display font-black text-2xl text-navy tracking-wider mb-4">{BANKSZAMLA}</div>
            <div className="text-sm text-navy/70">
              <span className="font-semibold text-navy">A közlemény rovatban kérjük feltüntetni:</span>{" "}
              a gyermek nevét, a gyermek korosztályát, valamint a hónapot, amelyre a
              képzési díj befizetésre kerül.
            </div>
          </div>

          {/* Szülői fiók */}
          <div className="bg-navy text-white rounded-lg p-6 md:p-7 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
            <div className="relative h-full flex flex-col">
              <h3 className="font-display font-bold text-lg mb-3">Szülői fiók</h3>
              <p className="text-sm text-white/70 leading-relaxed mb-6">
                Külön regisztráció nem kell: az az e-mail-cím a belépési azonosítód, amelyre a
                számlákat kapod. Belépéskor egy egyszer használatos linket küldünk erre a címre.
                Egy fiókban az összes gyermeked számlája megjelenik.
              </p>
              <div className="mt-auto">
                <Link
                  href="/belepes"
                  className="inline-block bg-vasasRed hover:bg-vasasRedDark transition-colors text-white font-bold px-5 py-3 rounded-md text-sm"
                >
                  Belépés
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
