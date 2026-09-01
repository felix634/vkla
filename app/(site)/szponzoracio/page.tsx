import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "../../components/site/PageHero";

export const metadata: Metadata = {
  title: "Szponzoráció — Vasas Kubala Akadémia",
};

const MAIN = ["Fő támogató 1", "Fő támogató 2", "Fő támogató 3"];
const PARTNERS = Array.from({ length: 12 }, (_, i) => `Partner ${i + 1}`);

const PACKAGES = [
  {
    tier: "Bronz",
    price: "— Ft / év",
    accent: "border-gray-200",
    perks: ["Logó a szponzori oldalon", "Említés a közösségi médiában", "2 db meccsnapi megjelenés"],
  },
  {
    tier: "Ezüst",
    price: "— Ft / év",
    accent: "border-royal/40",
    featured: false,
    perks: ["Minden Bronz elem", "Logó a főoldali partnersávban", "Mezreklám lehetőség", "Rendezvény-meghívók"],
  },
  {
    tier: "Arany",
    price: "— Ft / év",
    accent: "border-gold/60",
    featured: true,
    perks: ["Minden Ezüst elem", "Kiemelt „Fő támogató” megjelenés", "Névadó szponzoráció lehetősége", "Egyedi aktivációk"],
  },
];

export default function SzponzoracioPage() {
  return (
    <main className="min-h-screen">
      <PageHero
        breadcrumb="Szponzoráció"
        eyebrow="Partnereink"
        title={
          <>
            Együtt építjük <span className="text-gold-light">a jövőt.</span>
          </>
        }
        subtitle="Támogatóink nélkül nem menne. Ismerd meg partnereinket, és csatlakozz Te is az akadémia támogatóihoz."
      />

      {/* Fő támogatók */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <span className="section-eyebrow">Kiemelt támogatók</span>
            <h2 className="heading-display text-3xl md:text-4xl text-navy mt-3">Fő támogatóink</h2>
            <div className="gold-divider mx-auto mt-4" />
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {MAIN.map((s) => (
              <div key={s} className="relative rounded-md border border-gold/40 bg-gradient-to-br from-cream to-white p-10 flex items-center justify-center min-h-[150px]">
                <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-[0.2em] text-gold-dark">Fő támogató</span>
                <span className="font-display font-black text-2xl tracking-wider text-navy/70">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* További partnerek */}
      <section className="bg-cream">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <span className="section-eyebrow">Partnereink</span>
            <h2 className="heading-display text-3xl md:text-4xl text-navy mt-3">Támogatóink köre</h2>
            <div className="gold-divider mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-gray-200 border border-gray-200 rounded-md overflow-hidden">
            {PARTNERS.map((p) => (
              <div key={p} className="bg-white p-8 flex items-center justify-center min-h-[110px]">
                <span className="font-display font-bold text-lg tracking-wider text-navy/40">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Szponzorációs csomagok */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <span className="section-eyebrow">Csatlakozz</span>
            <h2 className="heading-display text-3xl md:text-4xl text-navy mt-3">Szponzorációs csomagok</h2>
            <div className="gold-divider mx-auto mt-4" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.tier}
                className={`rounded-lg border-2 ${pkg.accent} p-7 flex flex-col ${
                  pkg.featured ? "bg-navy text-white shadow-xl shadow-navy/20" : "bg-white"
                }`}
              >
                <div className={`text-xs uppercase tracking-[0.2em] font-bold mb-2 ${pkg.featured ? "text-gold-light" : "text-vasasRed"}`}>
                  {pkg.tier} csomag
                </div>
                <div className={`font-display font-black text-3xl mb-6 ${pkg.featured ? "text-white" : "text-navy"}`}>
                  {pkg.price}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {pkg.perks.map((perk) => (
                    <li key={perk} className={`flex items-start gap-2.5 text-sm ${pkg.featured ? "text-white/85" : "text-navy/70"}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={pkg.featured ? "text-gold-light mt-0.5 flex-shrink-0" : "text-royal mt-0.5 flex-shrink-0"}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/kapcsolat"
                  className={`text-center font-bold py-3 rounded-md text-sm transition-colors ${
                    pkg.featured ? "bg-gold text-navy hover:bg-gold-light" : "bg-navy text-white hover:bg-royal"
                  }`}
                >
                  Ajánlatkérés
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-navy/40 mt-6">
            Az árak és a csomagok tartalma egyeztetés alatt — a végleges feltételek a tartalomfeltöltés során kerülnek fel.
          </p>
        </div>
      </section>
    </main>
  );
}
