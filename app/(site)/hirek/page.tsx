import type { Metadata } from "next";
import PageHero from "../../components/site/PageHero";
import HirekList from "../../components/HirekList";
import { getHirek, HIREK_OLDALMERET } from "../../lib/sanity/hirek";
import { sanityEnabled } from "../../lib/sanity/client";

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
  const { items, total } = await getHirek({ category, page });

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
