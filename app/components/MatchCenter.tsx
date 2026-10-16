import Link from "next/link";

// A Mérkőzések oldal tartalma. A menetrend, az eredmények és a tabellák az
// MLSZ adatbankból (Sportszervezeti API) jönnek majd; amíg a hozzáférés nem él,
// helykitöltő sorok helyett tájékoztatás és két valódi forrás látszik.
export const MLSZ_ADATBANK_URL = "https://adatbank.mlsz.hu";

export default function MatchCenter() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="bg-white border border-gray-100 rounded-lg p-8 md:p-12 grid md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-8">
          <span className="section-eyebrow">MLSZ adatbank</span>
          <h2 className="font-display font-black text-2xl md:text-3xl text-navy mt-3 mb-4">
            Mérkőzések, eredmények és tabellák — automatikusan
          </h2>
          <p className="text-navy/70 leading-relaxed">
            A VKLA csapatainak menetrendje, eredményei és bajnoki tabellái hamarosan közvetlenül az MLSZ
            adatbankjából, automatikusan frissülve jelennek meg ezen az oldalon, korosztály szerint szűrhetően.
          </p>
          <p className="text-navy/70 leading-relaxed mt-3">
            Addig a hétvégi mérkőzésekről szóló beszámolókat a Hírek között, a hivatalos eredményeket és
            tabellákat az MLSZ adatbankban találod.
          </p>
        </div>
        <div className="md:col-span-4 flex flex-col gap-3">
          <Link
            href="/hirek"
            className="bg-navy hover:bg-royal transition-colors text-white font-semibold px-5 py-3 rounded-md text-sm text-center"
          >
            Mérkőzés-beszámolók a Hírekben
          </Link>
          <a
            href={MLSZ_ADATBANK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-navy/20 hover:bg-cream transition-colors text-navy font-semibold px-5 py-3 rounded-md text-sm text-center"
          >
            MLSZ adatbank ↗
          </a>
        </div>
      </div>
    </div>
  );
}
