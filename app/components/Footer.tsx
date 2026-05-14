import Image from "next/image";

const FOOTER_NAV = [
  {
    title: "Akadémia",
    links: ["Bemutatkozás", "Kubala László", "Edzői stáb", "Etikai kódex", "Házirend", "TAO"],
  },
  {
    title: "Csapatok",
    links: ["U5–U9", "U10–U13", "U14–U19", "Női csapat", "Vasas FC II"],
  },
  {
    title: "Mérkőzések",
    links: ["Naptár", "Eredmények", "Bajnoki tabella", "Galéria", "Videók"],
  },
  {
    title: "Tagság",
    links: ["Jelentkezés", "Tagdíj fizetés", "Oktatási anyagok", "Webshop", "Dokumentumok"],
  },
];

export default function Footer() {
  return (
    <footer className="bg-navy-dark text-white">
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-12 gap-10">
          {/* Brand block */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-5">
              <Image
                src="/images/logo.png"
                alt="VKLA"
                width={56}
                height={56}
                className="h-14 w-14 object-contain"
              />
              <div className="leading-tight">
                <div className="font-display font-black text-lg tracking-wide">VASAS KUBALA</div>
                <div className="font-display font-bold text-gold text-sm tracking-[0.3em]">AKADÉMIA</div>
              </div>
            </div>
            <p className="text-white/65 text-sm leading-relaxed max-w-sm mb-6">
              Magyarország egyik legnagyobb hagyománnyal rendelkező labdarúgó
              akadémiája — 1911 óta a fiatal tehetségek otthona.
            </p>
            <div className="flex items-center gap-3">
              {["FB", "IG", "YT", "TW"].map((s) => (
                <span
                  key={s}
                  className="no-click w-9 h-9 rounded-sm bg-white/5 hover:bg-vasasRed transition flex items-center justify-center text-xs font-bold border border-white/10"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {FOOTER_NAV.map((col) => (
            <div key={col.title} className="lg:col-span-2">
              <h4 className="font-display font-bold text-sm tracking-[0.2em] uppercase text-gold-light mb-5">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l} className="no-click text-sm text-white/65 hover:text-white transition cursor-default">
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
        <div>© 2026 Vasas Kubala Akadémia. Minden jog fenntartva.</div>
        <div className="flex items-center gap-5">
          <span className="no-click hover:text-white">Adatvédelem</span>
          <span className="no-click hover:text-white">ÁSZF</span>
          <span className="no-click hover:text-white">Impresszum</span>
          <span className="no-click hover:text-white">Süti beállítások</span>
        </div>
      </div>

      {/* Prometheus credit */}
      <div className="border-t border-white/5 py-4 text-center text-[11px] text-white/40">
        Készítette: <span className="text-gold">Prometheus Digital</span> · Látványterv
      </div>
    </footer>
  );
}
