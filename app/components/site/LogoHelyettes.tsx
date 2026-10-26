import Image from "next/image";

// Kép nélküli hírnél a klub logója áll a kép helyén (Felix, 2026.10.26.).
// A szülő `relative` és méretezett doboz; a `meret` a logó magassága benne.
export default function LogoHelyettes({ meret = "h-1/2", className = "" }: { meret?: string; className?: string }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center bg-navy-dark ${className}`}>
      <div className={`relative ${meret} aspect-square`}>
        <Image src="/images/logo.png" alt="" fill sizes="240px" className="object-contain" />
      </div>
    </div>
  );
}
