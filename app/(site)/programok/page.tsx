import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "../../components/site/PageHero";
import WeeklySchedule from "../../components/WeeklySchedule";
import SzekcioBlock from "../../components/SzekcioBlock";
import { getSzekciok } from "../../lib/sanity/tartalom";

export const metadata: Metadata = {
  title: "Programok — Vasas Kubala Akadémia",
};

export const revalidate = 300;

export default async function ProgramokPage() {
  const szekciok = await getSzekciok();
  return (
    <main className="min-h-screen">
      <PageHero
        breadcrumb="Programok"
        eyebrow="Programok"
        title={
          <>
            Több, mint <span className="text-gold-light">edzés.</span>
          </>
        }
        subtitle="Heti edzésterv minden korosztályhoz és karitatív program — minden, ami az akadémiai életet jelenti."
      />

      {/* Heti edzésterv */}
      <section id="edzesterv" className="bg-white scroll-mt-28">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="mb-10">
            <span className="section-eyebrow">Heti program</span>
            <h2 className="heading-display text-3xl md:text-4xl text-navy mt-3">Heti edzésterv</h2>
            <div className="gold-divider mt-4" />
            <p className="text-navy/60 mt-4 text-sm">
              Korosztályonként lebontott heti beosztás. A pontos időpontok a CMS-ből frissülnek.
            </p>
          </div>
          <WeeklySchedule />
        </div>
      </section>

      {/* Akadémiai előadások (CMS) */}
      {szekciok?.["eloadasok"] && (
        <SzekcioBlock szekcio={szekciok["eloadasok"]} id="eloadasok" eyebrow="Edukáció" tone="cream" />
      )}

      {/* Karitatív */}
      <section id="karitativ" className="bg-navy text-white scroll-mt-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 py-16 relative">
          <div className="rounded-lg bg-gradient-to-br from-vasasRed to-vasasRedDark p-8 md:p-12 relative overflow-hidden">
            <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
            <div className="relative max-w-2xl">
              <span className="inline-block text-[10px] font-bold tracking-[0.25em] uppercase bg-white/15 px-3 py-1.5 rounded-sm mb-5">
                Karitatív
              </span>
              <h2 className="heading-display text-3xl md:text-4xl mb-4">Hajrá Vasas — Karitatív program</h2>
              <p className="text-white/85 leading-relaxed mb-6">
                Hátrányos helyzetű gyermekek bevonása a labdarúgásba — ingyenes edzésekkel és
                felszereléssel. Hiszünk benne, hogy a sport mindenkié.
              </p>
              <Link href="/kapcsolat" className="inline-block bg-white text-vasasRed hover:bg-cream transition-colors px-6 py-3 font-bold rounded-sm text-sm">
                Csatlakozom a programhoz
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Karitatív program részletei (CMS) */}
      {szekciok?.["karitativ"] && (
        <SzekcioBlock szekcio={szekciok["karitativ"]} id="karitativ-reszletek" eyebrow="Hajrá Vasas" />
      )}
    </main>
  );
}
