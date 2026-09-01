import type { Metadata } from "next";
import PageHero from "../../components/site/PageHero";
import SoonBadge from "../../components/site/SoonBadge";

export const metadata: Metadata = {
  title: "Dokumentumok — Vasas Kubala Akadémia",
};

const CATEGORIES = [
  { title: "Szabályzatok", count: 4 },
  { title: "Nyomtatványok", count: 3 },
  { title: "Adatvédelem", count: 2 },
  { title: "Egyéb dokumentumok", count: 3 },
];

function DocRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-100 last:border-0 hover:bg-cream transition-colors">
      <span className="w-9 h-9 rounded-md bg-navy/5 text-navy flex items-center justify-center flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-navy text-sm truncate">Dokumentum megnevezése</div>
        <div className="text-xs text-navy/45">PDF · Dátum</div>
      </div>
      <span className="no-click inline-flex items-center gap-2 text-sm font-bold text-royal flex-shrink-0">
        Letöltés
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </span>
    </div>
  );
}

export default function DokumentumokPage() {
  return (
    <main className="min-h-screen">
      <PageHero
        breadcrumb="Dokumentumok"
        eyebrow="Letöltések"
        title={
          <>
            Dokumentumok <span className="text-gold-light">és nyomtatványok.</span>
          </>
        }
        subtitle="Szabályzatok, nyomtatványok és egyéb hasznos dokumentumok — kategóriákba rendezve, letölthető formában."
      />

      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16 space-y-10">
          <div className="flex items-center gap-2 text-xs text-navy/50">
            <SoonBadge label="CMS feltöltés — hamarosan" />
            <span>A dokumentumok a tartalomfeltöltés során kerülnek fel.</span>
          </div>
          {CATEGORIES.map((c) => (
            <div key={c.title}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="font-display font-bold text-xl text-navy">{c.title}</h2>
                <span className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-navy/45">{c.count} dokumentum</span>
              </div>
              <div className="border border-gray-100 rounded-md overflow-hidden bg-white">
                {Array.from({ length: c.count }, (_, i) => (
                  <DocRow key={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
