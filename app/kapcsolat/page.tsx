import type { Metadata } from "next";
import PageHero from "../components/site/PageHero";
import SoonBadge from "../components/site/SoonBadge";

export const metadata: Metadata = {
  title: "Kapcsolat — Vasas Kubala Akadémia",
};

const CONTACTS = [
  { label: "Cím", value: "1139 Budapest, Fáy utca 58.", icon: "M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10z M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
  { label: "Telefon", value: "+36 20 378 4880", icon: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.98.36 1.92.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.34 1.83.57 2.81.7A2 2 0 0 1 22 16.92z" },
  { label: "E-mail", value: "info@vkla.hu", icon: "M4 4h16v16H4z M22 6l-10 7L2 6" },
  { label: "Iroda nyitvatartás", value: "Hétfő–Péntek: 9:00–17:00", icon: "M12 6v6l4 2 M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" },
];

const inputCls =
  "w-full rounded-md border border-gray-200 px-3.5 py-2.5 text-sm text-navy placeholder:text-navy/35 focus:outline-none focus:border-royal focus:ring-2 focus:ring-royal/15 transition";

const labelCls = "block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5";

export default function KapcsolatPage() {
  return (
    <main className="min-h-screen">
      <PageHero
        breadcrumb="Kapcsolat"
        eyebrow="Kapcsolat"
        title={
          <>
            Írj nekünk, <span className="text-gold-light">vagy gyere el.</span>
          </>
        }
        subtitle="Kérdésed van, vagy próbaedzésre jelentkeznél? Töltsd ki az űrlapot, és felvesszük veled a kapcsolatot."
      />

      {/* Elérhetőségek */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CONTACTS.map((c) => (
              <div key={c.label} className="rounded-md border border-gray-100 bg-cream p-6">
                <div className="w-11 h-11 rounded-md bg-navy text-gold flex items-center justify-center mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d={c.icon} />
                  </svg>
                </div>
                <div className="text-xs uppercase tracking-widest text-navy/45 mb-1">{c.label}</div>
                <div className="font-semibold text-navy text-sm leading-snug">{c.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kapcsolati űrlap + térkép */}
      <section className="bg-cream">
        <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-8 items-stretch">
          <div className="bg-white rounded-lg border border-gray-100 shadow-xl shadow-navy/5 p-7">
            <h2 className="font-display font-bold text-2xl text-navy mb-1">Általános megkeresés</h2>
            <p className="text-sm text-navy/55 mb-6">Válaszolunk, amint tudunk.</p>
            <form className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Név</label>
                  <input type="text" placeholder="Teljes név" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>E-mail</label>
                  <input type="email" placeholder="email@pelda.hu" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Tárgy</label>
                <input type="text" placeholder="Miben segíthetünk?" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Üzenet</label>
                <textarea rows={5} placeholder="Írd le a kérdésed…" className={inputCls} />
              </div>
              <button type="button" className="no-click w-full bg-navy hover:bg-royal transition-colors text-white font-bold py-3 rounded-md text-sm">
                Üzenet küldése
              </button>
            </form>
          </div>

          {/* Térkép placeholder */}
          <div className="rounded-lg overflow-hidden border border-gray-100 bg-navy relative min-h-[340px] flex items-center justify-center">
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-br from-navy-dark/60 to-royal/30" />
            <div className="relative text-center text-white/80 px-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="mx-auto mb-3 text-gold">
                <path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10z" />
                <circle cx="12" cy="11" r="2" />
              </svg>
              <div className="font-display font-bold text-lg">Fáy utcai Sportkomplexum</div>
              <div className="text-sm text-white/60 mt-1">1139 Budapest, Fáy utca 58.</div>
              <div className="mt-4">
                <SoonBadge label="Interaktív térkép — hamarosan" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Próbaedzés jelentkezés (központi email címre) */}
      <section id="probaedzes" className="bg-navy text-white scroll-mt-28">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <span className="section-eyebrow">Próbaedzés</span>
            <h2 className="heading-display text-3xl md:text-5xl mt-3 mb-4">
              Jelentkezz ingyenes <span className="text-gold-light">próbaedzésre.</span>
            </h2>
            <div className="gold-divider mx-auto" />
            <p className="text-white/70 mt-6 max-w-2xl mx-auto">
              U5-től U9-ig folyamatosan várjuk a focit szerető gyerekeket. A jelentkezés
              a központi e-mail címünkre (info@vkla.hu) érkezik, kollégáink hamarosan
              felveszik veled a kapcsolatot.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-7 backdrop-blur-sm">
            <form className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Gyermek neve</label>
                  <input type="text" placeholder="Gyermek teljes neve" className="w-full rounded-md bg-white/10 border border-white/15 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Születési év / korosztály</label>
                  <input type="text" placeholder="pl. 2016 / U9" className="w-full rounded-md bg-white/10 border border-white/15 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Szülő neve</label>
                  <input type="text" placeholder="Szülő teljes neve" className="w-full rounded-md bg-white/10 border border-white/15 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Telefonszám</label>
                  <input type="tel" placeholder="+36 …" className="w-full rounded-md bg-white/10 border border-white/15 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">E-mail</label>
                <input type="email" placeholder="szulo@email.hu" className="w-full rounded-md bg-white/10 border border-white/15 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Megjegyzés</label>
                <textarea rows={4} placeholder="Bármi, amit fontosnak tartasz…" className="w-full rounded-md bg-white/10 border border-white/15 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition" />
              </div>
              <button type="button" className="no-click w-full bg-vasasRed hover:bg-vasasRedDark transition-colors text-white font-bold py-3.5 rounded-md">
                Jelentkezés elküldése
              </button>
              <p className="text-center text-xs text-white/45">
                A küldés gomb a backend fázisban kapcsolódik a központi e-mail címhez.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
