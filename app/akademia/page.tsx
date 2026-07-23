import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "../components/site/PageHero";

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
  { role: "Ügyvezető", name: "Név" },
  { role: "Szakmai igazgató", name: "Név" },
  { role: "Utánpótlás-koordinátor", name: "Név" },
  { role: "Gazdasági vezető", name: "Név" },
];

const STAFF = Array.from({ length: 8 }, () => ({ name: "Munkatárs neve", role: "Vezetőedző" }));

const DOCS = [
  { title: "Etikai kódex", id: "etika", desc: "Az akadémia működésének alapelvei és magatartási normái." },
  { title: "Házirend", id: "hazirend", desc: "A sportkomplexum használatának és a mindennapoknak a szabályai." },
];

export default function AkademiaPage() {
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
          <div className="lg:col-span-6">
            <span className="section-eyebrow">Bemutatkozás</span>
            <h2 className="heading-display text-3xl md:text-4xl text-navy mt-3 mb-5">Az utánpótlás otthona 2007 óta</h2>
            <div className="gold-divider mb-6" />
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
          </div>
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] rounded-md overflow-hidden bg-navy">
              <Image src="/images/team.jpg" alt="Vasas Kubala Akadémia" fill className="object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Kubala László */}
      <section id="kubala" className="bg-navy text-white scroll-mt-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-12 gap-12 items-center relative">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] rounded-md overflow-hidden bg-navy-dark border border-white/10 flex items-center justify-center p-12">
              <Image src="/images/logo.png" alt="Kubala László" width={320} height={320} className="object-contain drop-shadow-[0_0_40px_rgba(184,152,92,0.35)]" />
            </div>
          </div>
          <div className="lg:col-span-7">
            <span className="section-eyebrow">Névadónk</span>
            <h2 className="heading-display text-3xl md:text-5xl mt-3 mb-5">Kubala László</h2>
            <div className="gold-divider mb-6" />
            <blockquote className="font-display italic text-2xl md:text-3xl text-gold-light leading-tight mb-6">
              „Akarni, küzdeni, játszani.”
            </blockquote>
            <p className="text-white/75 leading-relaxed">
              Akadémiánk névadója Kubala László, minden idők egyik legnagyobb magyar labdarúgója.
              Hagyatékát hűségesen ápoljuk — szellemisége minden korosztályunk munkájában jelen van.
              (A részletes életrajz és képanyag a tartalomfeltöltés során kerül fel.)
            </p>
          </div>
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
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white rounded-md border border-gray-100 p-6">
                <div className="w-10 h-10 rounded-sm bg-navy text-gold flex items-center justify-center mb-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="font-display font-bold text-navy text-lg mb-1">{v.title}</h3>
                <p className="text-sm text-navy/60 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Szervezeti struktúra */}
      <section id="struktura" className="bg-white scroll-mt-28">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="mb-10">
            <span className="section-eyebrow">Szervezet</span>
            <h2 className="heading-display text-3xl md:text-4xl text-navy mt-3">Szervezeti struktúra</h2>
            <div className="gold-divider mt-4" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {LEADERSHIP.map((p) => (
              <div key={p.role} className="rounded-md border border-gray-100 bg-cream p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-navy/5 mx-auto mb-4 flex items-center justify-center text-navy/40 font-display font-black">
                  VKLA
                </div>
                <div className="font-display font-bold text-navy">{p.name}</div>
                <div className="text-xs uppercase tracking-widest text-vasasRed mt-1">{p.role}</div>
              </div>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {STAFF.map((s, i) => (
              <div key={i} className="bg-white rounded-md border border-gray-100 overflow-hidden">
                <div className="relative aspect-square bg-navy">
                  <Image src="/images/player.jpg" alt="Edző" fill className="object-cover opacity-90" />
                </div>
                <div className="p-4">
                  <div className="font-display font-bold text-navy">{s.name}</div>
                  <div className="text-xs uppercase tracking-widest text-navy/50 mt-1">{s.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Etikai kódex + Házirend */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-6">
          {DOCS.map((d) => (
            <div key={d.id} id={d.id} className="scroll-mt-28 rounded-md border border-gray-100 bg-cream p-7 flex items-start gap-5">
              <div className="w-12 h-12 rounded-md bg-navy text-gold flex items-center justify-center flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-navy mb-1">{d.title}</h3>
                <p className="text-sm text-navy/60 leading-relaxed mb-3">{d.desc}</p>
                <span className="no-click inline-flex items-center gap-2 text-sm font-bold text-royal">
                  Letöltés (PDF)
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
