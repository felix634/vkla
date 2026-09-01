import { notFound, permanentRedirect } from "next/navigation";
import { hirLetezik } from "../../lib/sanity/hirek";

// Örökölt URL-ek a régi vkla.hu-ról: ott a cikkek a gyökérben éltek
// (vkla.hu/cikk-cime), az új oldalon a /hirek/cikk-cime alatt. Ez az
// útvonal minden máshoz nem illő címet megnéz a CMS-ben, és ha létező
// hír, 308-cal átirányít — így a Google-találatok és a régi posztok
// linkjei élesítés után is működnek.
export default async function LegacySlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const letezik = await hirLetezik(params.slug);
  if (letezik) permanentRedirect(`/hirek/${params.slug}`);
  notFound();
}
