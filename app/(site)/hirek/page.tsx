import type { Metadata } from "next";
import PageHero from "../../components/site/PageHero";
import HirekList from "../../components/HirekList";
import { getHirek, HIREK_OLDALMERET } from "../../lib/sanity/hirek";
import { sanityEnabled } from "../../lib/sanity/client";
import { getBeallitasok } from "../../lib/sanity/tartalom";

export const metadata: Metadata = {
  title: "Hírek — Vasas Kubala Akadémia",
};

export default async function HirekPage({
  searchParams,
}: {
  searchParams: { kategoria?: string; oldal?: string };
}) {
  const category = searchParams.kategoria ?? "";
  const page = Math.max(1, Number(searchParams.oldal) || 1);
  // A klub kérésére a lista csak az aktuális szezon híreit mutatja (Studio:
  // Oldal beállítások → Hírlista kezdő dátuma); a régebbiek linkkel elérhetők.
  const b = await getBeallitasok();
  const { items, total } = await getHirek({ category, page, since: b?.hirekKezdete });

  return (
    <main className="min-h-screen">
      <PageHero
        breadcrumb="Hírek"
        eyebrow="Aktuális"
        title={
          <>
            Hírek és <span className="text-gold-light">események.</span>
          </>
        }
        subtitle="Közérdekű információk, mérkőzés-összefoglalók és akadémiai hírek egy helyen."
      />
      <HirekList
        items={items}
        total={total}
        category={category}
        page={page}
        pageSize={HIREK_OLDALMERET}
        cmsOn={sanityEnabled}
      />
    </main>
  );
}
