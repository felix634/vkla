import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "../../components/site/PageHero";
import { getEdzok, getSzekciok, type EdzoData } from "../../lib/sanity/tartalom";
import PortableBody from "../../components/PortableBody";
import SzekcioBlock from "../../components/SzekcioBlock";
import { sized } from "../../lib/sanity/imageUrl";
import Reveal from "../../components/motion/Reveal";
import HoverCard from "../../components/motion/HoverCard";

export const metadata: Metadata = {
  title: "Akadémia — Vasas Kubala Akadémia",
};

const VALUES = [
  { title: "Szakmai program", desc: "Egységes, nemzetközi módszertan a legkisebbektől a felnőtt csapatig." },
  { title: "Etikai kódex", desc: "Tisztelet, fegyelem és sportszerűség — ezek az értékek vezérelnek." },
  { title: "Egyéni fejlődés", desc: "Minden játékos saját fejlődési tervvel és visszajelzésekkel halad." },
  { title: "Család az első", desc: "Szoros együttműködés a szülőkkel, mert a háttér nélkül nincs eredmény." },
];

const LEADERSHIP = [
  { role: "Akadémia igazgató", name: "Nagy Miklós" },
  { role: "Szakmai vezető", name: "Tóth Csaba" },
  { role: "Alsó szekció vezetője", name: "Angyal Péter" },
  { role: "Szervezési és technikai vezető", name: "Kiss Dávid" },
];

const STAFF_PLACEHOLDER: EdzoData[] = Array.from({ length: 8 }, () => ({
  name: "Munkatárs neve",
  role: "Vezetőedző",
  order: null,
  photoUrl: null,
}));

function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0] ?? "").join("").toUpperCase();
}


export default async function AkademiaPage() {
  const [edzok, szekciok] = await Promise.all([getEdzok(), getSzekciok()]);
  const bemutatkozas = szekciok?.["bemutatkozas"] ?? null;
  const kubala = szekciok?.["kubala"] ?? null;
  // A vezetők külön kártyákon szerepelnek — a rácsban a szakmai stáb többi tagja.
  const leaderNames = new Set(LEADERSHIP.map((l) => l.name));
  const stab =
    edzok && edzok.length > 0
      ? edzok.filter((e) => !leaderNames.has(e.name))
      : STAFF_PLACEHOLDER;

  // A stáb csoportosított megjelenítése (Berkes Máté 2026.09.08-i kérése):
  // vezetőedzők korosztály-sorrendben, majd a szakmai csoportok. A besorolás a
  // szerepkörből jön, a sorrendet a Studio "Sorrend" mezője adja.
  const csoport = (pred: (r: string) => boolean) =>
    stab.filter((e) => pred((e.role ?? "").toLowerCase()));
  const stabCsoportok = [
    { title: "Vezetőedzők", tagok: csoport((r) => r.includes("vezetőedző")) },
    { title: "Asszisztensedzők", tagok: csoport((r) => r.includes("asszisztens")) },
    { title: "Erőnléti edzők", tagok: csoport((r) => r.includes("erőnléti") || r.includes("teljesítmény")) },
    { title: "Kapusedzők", tagok: csoport((r) => r.startsWith("kapusedző")) },
    { title: "Videóelemzők", tagok: csoport((r) => r.includes("videó") || r.includes("video")) },
    { title: "Rehabilitáció", tagok: csoport((r) => r.includes("fizioterapeuta") || r.includes("rehabilit")) },
  ].filter((cs) => cs.tagok.length > 0);
  // Ami egyik csoportba sem esett (pl. placeholder), az a végére kerül.
  const besorolt = new Set(stabCsoportok.flatMap((cs) => cs.tagok.map((t) => t.name)));
  const egyeb = stab.filter((e) => !besorolt.has(e.name));
  if (egyeb.length > 0) stabCsoportok.push({ title: "Szakembereink", tagok: egyeb });

  return (
    <main className="min-h-screen">
      <PageHero
        breadcrumb="Akadémia"
        eyebrow="Az Akadémiáról"
        title={
          <>
            Több, mint egy klub. <span className="text-gold-light">Egy hagyomány.</span>
          </>
        }
        subtitle="Tájékoztató oldal a Vasas Kubala Akadémia bemutatásához, szervezetéhez és működéséhez."
      />

      {/* Bemutatkozás */}
      <section id="bemutatkozas" className="bg-white scroll-mt-28">
        <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-12 gap-12 items-center">
          <Reveal direction="right" className="lg:col-span-6">
            <span className="section-eyebrow">Bemutatkozás</span>
            <h2 className="heading-display text-3xl md:text-4xl text-navy mt-3 mb-5">Az utánpótlás otthona 2007 óta</h2>
            <div className="gold-divider mb-6" />
            {bemutatkozas?.body ? (
              <PortableBody value={bemutatkozas.body.slice(0, 4)} />
            ) : (
              <>
                <p className="text-navy/75 leading-relaxed mb-4">
                  A Vasas Kubala Akadémia 2007-ben alakult, és azóta a magyar utánpótlás-labdarúgás
                  egyik meghatározó műhelye. Évente több, mint 450 fiatal sportoló edz nálunk, 16
                  korosztályban, a Fáy utcai sportkomplexumban.
                </p>
                <p className="text-navy/65 leading-relaxed">
                  Célunk, hogy a gyerekek technikai, taktikai és emberi fejlődése egyaránt fontos
                  legyen — az utánpótlástól a profi pályáig vezető úton. A Vasas FC és a Vasas SC
                  szoros együttműködésében dolgozunk.
                </p>
              </>
            )}
            <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-100">
              {[
                { n: "2007", l: "alapítás éve" },
                { n: "16", l: "korosztály" },
                { n: "450+", l: "aktív játékos" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display font-black text-3xl text-vasasRed">{s.n}</div>
                  <div className="text-xs uppercase tracking-widest text-navy/50 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal direction="left" delay={0.15} className="lg:col-span-6">
            <HoverCard lift={4} scale={1.01}>
              <div className="relative aspect-[4/3] rounded-md overflow-hidden bg-navy">
                <Image
                  src={bemutatkozas?.imageUrls?.[0] ? sized(bemutatkozas.imageUrls[0], 1000)! : "/images/team.jpg"}
                  alt="Vasas Kubala Akadémia"
                  fill
                  className="object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
              </div>
            </HoverCard>
          </Reveal>
        </div>
        {bemutatkozas?.body && bemutatkozas.body.length > 4 && (
          <div className="max-w-4xl mx-auto px-6 pb-16">
            <PortableBody value={bemutatkozas.body.slice(4)} />
            {bemutatkozas.imageUrls && bemutatkozas.imageUrls.length > 1 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8">
                {bemutatkozas.imageUrls.slice(1).map((u, i) => (
                  <div key={i} className="relative aspect-[3/2] rounded-md overflow-hidden bg-navy/5">
                    <Image src={sized(u, 700)!} alt={`Akadémia — fotó ${i + 2}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Kubala László */}
      <section id="kubala" className="bg-navy text-white scroll-mt-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-12 gap-12 items-center relative">
          <Reveal direction="right" className="lg:col-span-5">
            <div className="relative aspect-[4/5] rounded-md overflow-hidden bg-navy-dark border border-white/10">
              {kubala?.imageUrls?.[0] ? (
                <Image src={sized(kubala.imageUrls[0], 900)!} alt="Kubala László" fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-12">
                  <Image src="/images/logo.png" alt="Kubala László" width={320} height={320} className="object-contain drop-shadow-[0_0_40px_rgba(184,152,92,0.35)]" />
                </div>
              )}
            </div>
          </Reveal>
          <Reveal direction="left" delay={0.15} className="lg:col-span-7">
            <span className="section-eyebrow">Névadónk</span>
            <h2 className="heading-display text-3xl md:text-5xl mt-3 mb-5">Kubala László</h2>
            <div className="gold-divider mb-6" />
            <blockquote className="font-display italic text-2xl md:text-3xl text-gold-light leading-tight mb-6">
              „Akarni, küzdeni, játszani.”
            </blockquote>
            {kubala?.body ? (
              <div className="[&_p]:text-white/75 [&_h3]:text-gold-light">
                <PortableBody value={kubala.body} />
              </div>
            ) : (
              <p className="text-white/75 leading-relaxed">
                Akadémiánk névadója Kubala László, minden idők egyik legnagyobb magyar labdarúgója.
                Hagyatékát hűségesen ápoljuk — szellemisége minden korosztályunk munkájában jelen van.
              </p>
            )}
          </Reveal>
        </div>
      </section>

      {/* Értékek */}
      <section className="bg-cream">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <span className="section-eyebrow">Értékeink</span>
            <h2 className="heading-display text-3xl md:text-4xl text-navy mt-3">Amiben hiszünk</h2>
            <div className="gold-divider mx-auto mt-4" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08} className="h-full">
                <HoverCard className="h-full bg-white rounded-md border border-gray-100 p-6">
                <div className="w-10 h-10 rounded-sm bg-navy text-gold flex items-center justify-center mb-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="font-display font-bold text-navy text-lg mb-1">{v.title}</h3>
                <p className="text-sm text-navy/60 leading-relaxed">{v.desc}</p>
                </HoverCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Vezetőség */}
      <section id="vezetoseg" className="bg-white scroll-mt-28">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="mb-10">
            <span className="section-eyebrow">Szervezet</span>
            <h2 className="heading-display text-3xl md:text-4xl text-navy mt-3">Vezetőség</h2>
            <div className="gold-divider mt-4" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {LEADERSHIP.map((p, i) => (
              <Reveal key={p.role} delay={i * 0.08} className="h-full">
                <HoverCard className="h-full rounded-md border border-gray-100 bg-cream p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-navy/5 mx-auto mb-4 flex items-center justify-center text-navy/40 font-display font-black text-xl">
                    {initials(p.name)}
                  </div>
                  <div className="font-display font-bold text-navy">{p.name}</div>
                  <div className="text-xs uppercase tracking-widest text-vasasRed mt-1">{p.role}</div>
                </HoverCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Edzői stáb */}
      <section id="stab" className="bg-cream scroll-mt-28">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="mb-10">
            <span className="section-eyebrow">Csapat mögött a csapat</span>
            <h2 className="heading-display text-3xl md:text-4xl text-navy mt-3">Edzői stáb</h2>
            <div className="gold-divider mt-4" />
          </div>
          {stabCsoportok.map((cs) => (
            <div key={cs.title} className="mb-12 last:mb-0">
              <h3 className="font-display font-bold text-2xl text-navy mb-5 flex items-baseline gap-3">
                {cs.title}
                <span className="text-xs font-sans font-semibold text-navy/40">{cs.tagok.length} fő</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {cs.tagok.map((e, i) => (
                  <Reveal key={e.name + i} delay={(i % 4) * 0.08} className="h-full">
                    <HoverCard className="h-full bg-white rounded-md border border-gray-100 overflow-hidden">
                      {/* A portrék egységesen 2:3 arányúak (Patrik vágása) — a keret
                          ugyanilyen arányú, így a képből semmi nem vágódik le. */}
                      <div className="relative aspect-[2/3] bg-navy flex items-center justify-center">
                        {e.photoUrl ? (
                          <Image src={sized(e.photoUrl, 500)!} alt={e.name} fill className="object-cover opacity-90" />
                        ) : (
                          <span className="font-display font-black text-4xl text-white/15">
                            {initials(e.name)}
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="font-display font-bold text-navy">{e.name}</div>
                        <div className="text-xs uppercase tracking-widest text-navy/50 mt-1">{e.role}</div>
                      </div>
                    </HoverCard>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CMS-szekciók: Képzési modell, Együttműködések, Sportiskolai háttér */}
      {szekciok?.["kepzesi-modell"] && (
        <SzekcioBlock szekcio={szekciok["kepzesi-modell"]} id="kepzesi-modell" eyebrow="Szakmai munka" tone="cream" />
      )}
      {szekciok?.["egyuttmukodes-vasas"] && (
        <SzekcioBlock szekcio={szekciok["egyuttmukodes-vasas"]} id="egyuttmukodes" eyebrow="Együttműködés" />
      )}
      {szekciok?.["egyuttmukodes-osei"] && (
        <SzekcioBlock szekcio={szekciok["egyuttmukodes-osei"]} id="osei" eyebrow="Sportegészségügy" tone="cream" />
      )}
      {szekciok?.["egyuttmukodes-tf"] && (
        <SzekcioBlock szekcio={szekciok["egyuttmukodes-tf"]} id="tf" eyebrow="Együttműködés" />
      )}
      {szekciok?.["oktatasi-program"] && (
        <SzekcioBlock szekcio={szekciok["oktatasi-program"]} id="oktatas" eyebrow="Oktatás" />
      )}

    </main>
  );
}
