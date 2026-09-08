import type { Metadata } from "next";
import PageHero from "../../components/site/PageHero";
import WeeklySchedule from "../../components/WeeklySchedule";
import { getHetirend } from "../../lib/sanity/tartalom";

export const metadata: Metadata = {
  title: "Programok — Vasas Kubala Akadémia",
};

export const revalidate = 300;

// A karitatív program és az akadémiai előadások szekció az ügyfél kérésére
// lekerült (Berkes Máté, 2026.09.08).
export default async function ProgramokPage() {
  const hetirend = await getHetirend();
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
        subtitle="Korosztályonként lebontott heti edzésterv — minden, ami az akadémiai élet ritmusát adja."
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
          <WeeklySchedule rendek={hetirend} />
        </div>
      </section>
    </main>
  );
}
