import Link from "next/link";

// 404 a site-chrome-mal (a (site) route-group not-found határa).
export default function NotFound() {
  return (
    <main className="min-h-[70vh] bg-navy text-white relative overflow-hidden flex items-center">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-royal/25 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gold-gradient" />
      <div className="relative max-w-3xl mx-auto px-6 py-24 text-center">
        <div className="font-display font-black text-[7rem] leading-none text-gold-light/90">404</div>
        <h1 className="heading-display text-3xl md:text-4xl mt-2 mb-4">
          Ez a labda <span className="text-gold-light">kiment az alapvonalon.</span>
        </h1>
        <p className="text-white/70 max-w-xl mx-auto mb-8">
          A keresett oldal nem található — lehet, hogy elköltözött, vagy hibás a link.
          A hírarchívumban és a főoldalon minden fontos tartalmat megtalálsz.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="bg-vasasRed hover:bg-vasasRedDark transition-colors text-white px-6 py-3 font-bold rounded-sm text-sm"
          >
            Vissza a főoldalra
          </Link>
          <Link
            href="/hirek"
            className="border-2 border-gold/50 text-gold hover:bg-gold hover:text-navy transition-colors px-6 py-3 font-bold rounded-sm text-sm"
          >
            Hírek böngészése
          </Link>
        </div>
      </div>
    </main>
  );
}
