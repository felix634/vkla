import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "../../components/site/PageHero";
import SoonBadge from "../../components/site/SoonBadge";
import PortableBody from "../../components/PortableBody";
import { getLetesitmenyek } from "../../lib/sanity/tartalom";
import { sized } from "../../lib/sanity/imageUrl";

export const metadata: Metadata = {
  title: "Létesítmények — Vasas Kubala Akadémia",
};

export const revalidate = 300;

// CMS nélküli placeholder (látványterv-állapot).
const FACILITIES = [
  {
    _id: "fay",
    name: "Fáy utcai Sportkomplexum",
    address: "1139 Budapest, Fáy utca 58.",
    body: null,
    amenities: ["2 nagypálya (füves)", "1 műfüves pálya", "Öltözők és kiszolgáló helyiségek", "Fedett lelátó", "Parkolás"],
    rentInfo: null,
    imageUrls: ["/images/flag.jpg"],
    mapImageUrl: null,
  },
  {
    _id: "ii",
    name: "II. számú Létesítmény",
    address: "Cím — hamarosan",
    body: null,
    amenities: ["Edzőpályák", "Műfüves pálya", "Öltözők", "Kiegészítő terek", "Megközelítés tömegközlekedéssel"],
    rentInfo: null,
    imageUrls: ["/images/player.jpg"],
    mapImageUrl: null,
  },
];

// Amíg nincs feltöltött fotó, ezek a brand-képek forognak a helyükön.
const FALLBACK_IMAGES = ["/images/flag.jpg", "/images/vasas.jpeg", "/images/player.jpg"];

const SZAMNEV: Record<number, string> = { 1: "Egy", 2: "Két", 3: "Három", 4: "Négy" };

export default async function LetesitmenyekPage() {
  const cms = await getLetesitmenyek();
  const facilities = cms && cms.length > 0 ? cms : FACILITIES;
  const cmsOn = !!(cms && cms.length > 0);

  return (
    <main className="min-h-screen">
      <PageHero
        breadcrumb="Létesítmények"
        eyebrow="Létesítmények"
        title={
          <>
            Ahol a jövő <span className="text-gold-light">pályára lép.</span>
          </>
        }
        subtitle={`${SZAMNEV[facilities.length] ?? facilities.length} korszerű helyszínen edzenek csapataink. A pályák és termek szabad időpontokban bérelhetők is.`}
      />

      {facilities.map((f, idx) => {
        const img = f.imageUrls?.[0]
          ? sized(f.imageUrls[0], 1400)!
          : FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
        return (
        <section key={f._id} id={f._id} className={`scroll-mt-28 ${idx % 2 === 0 ? "bg-white" : "bg-cream"}`}>
          <div className={`max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-12 gap-10 items-start ${idx % 2 === 1 ? "lg:[direction:rtl]" : ""}`}>
            <div className="lg:col-span-6 lg:[direction:ltr]">
              <div className="relative aspect-[16/10] rounded-md overflow-hidden bg-navy">
                <Image src={img} alt={f.name} fill className="object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
                {f.rentInfo != null && (
                  <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider bg-gold text-navy px-3 py-1 rounded-sm">
                    Bérelhető
                  </span>
                )}
              </div>
              {f.amenities && f.amenities.length > 0 && (
                <ul className="grid sm:grid-cols-2 gap-2.5 mt-6">
                  {f.amenities.map((a) => (
                    <li key={a} className="flex items-center gap-2 text-sm text-navy/75">
                      <span className="w-5 h-5 rounded-full bg-royal/10 text-royal flex items-center justify-center flex-shrink-0">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      {a}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="lg:col-span-6 lg:[direction:ltr]">
              <span className="section-eyebrow">Helyszín {idx + 1}</span>
              <h2 className="heading-display text-3xl md:text-4xl text-navy mt-3 mb-3">{f.name}</h2>
              <div className="gold-divider mb-5" />
              {f.address && (
                <div className="flex items-center gap-2 text-navy/60 text-sm mb-6">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-vasasRed">
                    <path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10z" />
                    <circle cx="12" cy="11" r="2" />
                  </svg>
                  {f.address}
                </div>
              )}
              {f.body && f.body.length > 0 && (
                <div className="mb-6">
                  <PortableBody value={f.body} />
                </div>
              )}
              {f.rentInfo && (
                <div className="rounded-md bg-gold/10 border border-gold/30 px-5 py-4 text-sm text-navy/80 mb-6">
                  {f.rentInfo}
                </div>
              )}
              <Link
                href="/kapcsolat"
                className="inline-flex items-center gap-2 bg-navy hover:bg-royal transition-colors text-white px-6 py-3 font-bold rounded-sm text-sm"
              >
                Bérlés iránti érdeklődés
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
        );
      })}

      {/* Térkép / sporttelep rajz — CMS-ből, amíg nincs: hamarosan */}
      <section className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <span className="section-eyebrow">Megközelítés</span>
            <h2 className="heading-display text-3xl md:text-4xl mt-3">Sporttelep-térképek</h2>
            <div className="gold-divider mx-auto mt-4" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((f) => (
              <div key={f._id} className="rounded-md border border-white/10 bg-white/5 relative min-h-[260px] flex items-center justify-center overflow-hidden">
                {f.mapImageUrl ? (
                  <Image src={sized(f.mapImageUrl, 900)!} alt={`${f.name} — térkép`} fill className="object-cover" />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-grid opacity-30" />
                    <div className="relative text-center px-6">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 text-gold">
                        <polygon points="1 6 8 3 16 6 23 3 23 18 16 21 8 18 1 21 1 6" />
                        <line x1="8" y1="3" x2="8" y2="18" />
                        <line x1="16" y1="6" x2="16" y2="21" />
                      </svg>
                      <div className="font-display font-bold">{f.name}</div>
                      <div className="mt-3">
                        <SoonBadge label="Térkép és pályarajz — hamarosan" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-md bg-gold/10 border border-gold/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <div className="font-display font-bold text-xl text-white">Bérelnél pályát vagy termet?</div>
              <div className="text-white/70 text-sm">
                {cmsOn ? "Pályáink, a VIP terem és a skyboxok is bérelhetők — kérj ajánlatot." : "Mindkét létesítményben van szabad kapacitás — kérj ajánlatot."}
              </div>
            </div>
            <Link href="/kapcsolat" className="bg-vasasRed hover:bg-vasasRedDark transition-colors text-white px-6 py-3 font-bold rounded-sm text-sm flex-shrink-0">
              Ajánlatkérés
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
