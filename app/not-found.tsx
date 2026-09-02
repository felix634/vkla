import Link from "next/link";

// Gyökér-szintű 404 (chrome nélküli fallback — pl. többszintű ismeretlen útvonalak).
export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0c2143] text-white flex items-center justify-center px-6">
      <div className="text-center">
        <div className="font-display font-black text-[7rem] leading-none text-[#d4b886]">404</div>
        <h1 className="font-display font-bold text-2xl mb-3">Az oldal nem található</h1>
        <p className="text-white/60 mb-8 max-w-md mx-auto text-sm">
          A keresett cím nem létezik — lehet, hogy elköltözött, vagy hibás a link.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#b31b34] hover:opacity-90 transition text-white px-6 py-3 font-bold rounded-sm text-sm"
        >
          Vissza a főoldalra
        </Link>
      </div>
    </main>
  );
}
