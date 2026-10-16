import Link from "next/link";
import { MLSZ_ADATBANK_URL } from "./MatchCenter";

// Főoldali mérkőzés-sáv. Amíg az MLSZ adatbank bekötése nem él, helykitöltő
// mérkőzések helyett a jelenleg is elérhető forrásokra mutat (Hírek, MLSZ).
export default function Matches() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <span className="section-eyebrow">Mérkőzések</span>
        <h2 className="heading-display text-4xl md:text-5xl lg:text-6xl text-navy mt-3 mb-4">
          A pályán találkozunk.
        </h2>
        <div className="gold-divider mx-auto mb-6" />
        <p className="text-navy/70 leading-relaxed max-w-2xl mx-auto">
          A hétvégi mérkőzésekről korosztályonként a Hírek között olvashatsz beszámolót. A menetrend, az eredmények és
          a tabellák hamarosan automatikusan, az MLSZ adatbankjából is megjelennek az oldalon.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/hirek"
            className="bg-navy hover:bg-royal transition-colors text-white font-semibold px-6 py-3 rounded-md text-sm"
          >
            Mérkőzés-beszámolók
          </Link>
          <a
            href={MLSZ_ADATBANK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-navy/20 hover:bg-cream transition-colors text-navy font-semibold px-6 py-3 rounded-md text-sm"
          >
            MLSZ adatbank ↗
          </a>
        </div>
      </div>
    </section>
  );
}
