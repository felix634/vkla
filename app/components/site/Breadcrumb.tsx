import Link from "next/link";

// Egyszerű morzsamenü az aloldalak fejlécében: Főoldal / aktuális.

export default function Breadcrumb({ current }: { current: string }) {
  return (
    <nav aria-label="Morzsamenü" className="flex items-center gap-2 text-xs text-white/60">
      <Link href="/" className="hover:text-gold transition-colors">
        Főoldal
      </Link>
      <span className="text-white/30">/</span>
      <span className="text-gold-light font-semibold">{current}</span>
    </nav>
  );
}
