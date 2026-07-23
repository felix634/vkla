import type { Metadata } from "next";
import PageHero from "../components/site/PageHero";
import SoonBadge from "../components/site/SoonBadge";

export const metadata: Metadata = {
  title: "TAO — Vasas Kubala Akadémia",
};

const YEARS = ["2026", "2025", "2024"];

const DOCS = Array.from({ length: 4 }, () => ({
  name: "Dokumentum megnevezése",
  type: "PDF",
  date: "Dátum",
}));

function DocRow({ name, type, date }: { name: string; type: string; date: string }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-100 last:border-0 hover:bg-cream transition-colors">
      <span className="w-9 h-9 rounded-md bg-navy/5 text-navy flex items-center justify-center flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-navy text-sm truncate">{name}</div>
        <div className="text-xs text-navy/45">{type} · {date}</div>
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

export default function TaoPage() {
  return (
    <main className="min-h-screen">
      <PageHero
        breadcrumb="TAO"
        eyebrow="Társasági adó"
        title={
          <>
            TAO <span className="text-gold-light">elszámolások.</span>
          </>
        }
        subtitle="A TAO-támogatásokhoz kapcsolódó közzétételi és elszámolási dokumentumok. A feltöltés a CMS-en keresztül történik."
      />

      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
            <div className="flex flex-wrap gap-2">
              {YEARS.map((y, i) => (
                <span
                  key={y}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
                    i === 0 ? "bg-navy text-white border-navy" : "bg-white text-navy/70 border-gray-200"
                  }`}
                >
                  {y}
                </span>
              ))}
            </div>
            <SoonBadge label="CMS feltöltés — hamarosan" />
          </div>

          {YEARS.map((y) => (
            <div key={y} className="mb-8">
              <h2 className="font-display font-bold text-xl text-navy mb-3">{y}. évi dokumentumok</h2>
              <div className="border border-gray-100 rounded-md overflow-hidden bg-white">
                {DOCS.map((d, i) => (
                  <DocRow key={i} {...d} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
