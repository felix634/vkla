import type { Metadata } from "next";
import PageHero from "../../components/site/PageHero";
import PortableBody from "../../components/PortableBody";
import { getSzekciok } from "../../lib/sanity/tartalom";

export const metadata: Metadata = {
  title: "Impresszum — Vasas Kubala Akadémia",
};

export const revalidate = 300;

// A szöveg a Studióban szerkeszthető (Oldal-szekciók → Impresszum).
export default async function ImpresszumPage() {
  const szekciok = await getSzekciok();
  const impresszum = szekciok?.["impresszum"] ?? null;
  return (
    <main className="min-h-screen">
      <PageHero
        breadcrumb="Impresszum"
        eyebrow="Jogi információk"
        title={<>Impresszum</>}
        subtitle="A vkla.hu üzemeltetőjének adatai és jogi nyilatkozata."
      />
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          {impresszum?.body && impresszum.body.length > 0 ? (
            <PortableBody value={impresszum.body} />
          ) : (
            <p className="text-navy/60">A tartalom feltöltés alatt.</p>
          )}
        </div>
      </section>
    </main>
  );
}
