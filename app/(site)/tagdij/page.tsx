import type { Metadata } from "next";
import PageHero from "../../components/site/PageHero";
import SoonBadge from "../../components/site/SoonBadge";

export const metadata: Metadata = {
  title: "Tagdíj fizetés — Vasas Kubala Akadémia",
};

const STEPS = [
  { n: "1", title: "Regisztráció", desc: "A szülő létrehozza saját fiókját néhány perc alatt." },
  { n: "2", title: "Gyermek hozzáadása", desc: "A fiókhoz rendeli gyermeke(i) adatait és korosztályát." },
  { n: "3", title: "Havi tagdíj", desc: "Az esedékes tagdíj automatikusan megjelenik a felületen." },
  { n: "4", title: "Online fizetés", desc: "Bankkártyás fizetés a fizetési kapun keresztül, pár kattintással." },
];

const HISTORY = [
  { period: "Aktuális hónap", amount: "— Ft", status: "Esedékes", pending: true },
  { period: "Előző hónap", amount: "— Ft", status: "Fizetve" },
  { period: "2 hónapja", amount: "— Ft", status: "Fizetve" },
];

const inputCls =
  "w-full rounded-md border border-gray-200 px-3.5 py-2.5 text-sm text-navy placeholder:text-navy/35 focus:outline-none focus:border-royal focus:ring-2 focus:ring-royal/15 transition";

export default function TagdijPage() {
  return (
    <main className="min-h-screen">
      <PageHero
        breadcrumb="Tagdíj fizetés"
        eyebrow="Szülői felület"
        title={
          <>
            Tagdíj fizetés <span className="text-gold-light">egyszerűen.</span>
          </>
        }
        subtitle="Minden szülőnek saját regisztrációs felület: itt kezelheti gyermeke tagságát és rendezheti a havi tagdíjat online, biztonságosan."
      />

      {/* Így működik */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s) => (
              <div key={s.n} className="relative rounded-md border border-gray-100 bg-cream p-6">
                <div className="w-10 h-10 rounded-md bg-navy text-gold font-display font-black flex items-center justify-center mb-4">
                  {s.n}
                </div>
                <h3 className="font-display font-bold text-lg text-navy mb-1">{s.title}</h3>
                <p className="text-sm text-navy/60 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portál: regisztráció/bejelentkezés + szülői dashboard */}
      <section className="bg-cream">
        <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-12 gap-8 items-start">
          {/* Bal: belépés / regisztráció */}
          <div className="lg:col-span-5 bg-white rounded-lg border border-gray-100 shadow-xl shadow-navy/5 p-7">
            <div className="flex gap-2 mb-6 p-1 bg-cream rounded-md">
              <span className="flex-1 text-center py-2 rounded-md bg-white shadow-sm font-semibold text-sm text-navy">
                Bejelentkezés
              </span>
              <span className="flex-1 text-center py-2 rounded-md font-semibold text-sm text-navy/50">
                Regisztráció
              </span>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">E-mail</label>
                <input type="email" placeholder="szulo@email.hu" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">Jelszó</label>
                <input type="password" placeholder="••••••••" className={inputCls} />
              </div>
              <button
                type="button"
                className="no-click w-full bg-navy hover:bg-royal transition-colors text-white font-bold py-3 rounded-md text-sm"
              >
                Belépés
              </button>
              <p className="text-center text-xs text-navy/45">
                Új szülő vagy? <span className="text-royal font-semibold">Regisztrálj itt</span>
              </p>
            </form>
            <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-xs text-navy/50">
              <span>Fizetési kapu:</span>
              <span className="flex items-center gap-2 font-semibold text-navy/70">SimplePay · Stripe <SoonBadge /></span>
            </div>
          </div>

          {/* Jobb: szülői dashboard előnézet */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-navy text-white rounded-lg p-6 md:p-7 relative overflow-hidden">
              <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-white/50">Üdvözlünk</div>
                    <div className="font-display font-black text-2xl">Szülő neve</div>
                  </div>
                  <span className="h-11 w-11 rounded-full bg-white/10 flex items-center justify-center font-bold text-gold-light">SZ</span>
                </div>

                {/* Gyermekek */}
                <div className="text-xs uppercase tracking-widest text-white/50 mb-2">Gyermek(ek)</div>
                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  {["Gyermek neve · U10", "Gyermek neve · U13"].map((c) => (
                    <div key={c} className="flex items-center gap-3 rounded-md bg-white/5 border border-white/10 px-3 py-2.5">
                      <span className="h-8 w-8 rounded-full bg-vasasRed/80 flex items-center justify-center text-xs font-bold">GY</span>
                      <span className="text-sm">{c}</span>
                    </div>
                  ))}
                </div>

                {/* Esedékes tagdíj */}
                <div className="rounded-md bg-gold/10 border border-gold/30 p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-gold-light mb-1">Aktuális havi tagdíj</div>
                    <div className="font-display font-black text-3xl text-white">— Ft</div>
                  </div>
                  <button className="no-click bg-vasasRed hover:bg-vasasRedDark transition-colors text-white font-bold px-5 py-3 rounded-md text-sm">
                    Tagdíj befizetése
                  </button>
                </div>
              </div>
            </div>

            {/* Befizetési előzmények */}
            <div className="bg-white rounded-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-lg text-navy">Befizetési előzmények</h3>
                <SoonBadge label="Big Mac könyvelés — hamarosan" />
              </div>
              <div className="divide-y divide-gray-100">
                {HISTORY.map((h) => (
                  <div key={h.period} className="flex items-center justify-between py-3">
                    <div className="text-sm text-navy/70">{h.period}</div>
                    <div className="flex items-center gap-4">
                      <span className="font-display font-bold text-navy">{h.amount}</span>
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm ${
                          h.pending ? "bg-vasasRed/10 text-vasasRed" : "bg-royal/10 text-royal"
                        }`}
                      >
                        {h.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
