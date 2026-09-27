import Link from "next/link";
import PageHero from "../site/PageHero";
import KilepesGomb from "./KilepesGomb";

// A pénzügyi felület közös fejléce: cím, számok és a két fül (számlák, névjegyzék).
export default function AdminFejlec({ aktiv, alcim }: { aktiv: "szamlak" | "nevjegyzek"; alcim: string }) {
  const fulek = [
    { kulcs: "szamlak", cimke: "Számlák", href: "/fiok/admin" },
    { kulcs: "nevjegyzek", cimke: "Szülői névjegyzék", href: "/fiok/admin/nevjegyzek" },
  ] as const;
  return (
    <>
      <PageHero
        breadcrumb="Pénzügy"
        eyebrow="Pénzügy"
        title={aktiv === "szamlak" ? "Számlák kezelése" : "Szülői névjegyzék"}
        subtitle={alcim}
        aside={
          <div className="flex items-center gap-3">
            <Link href="/fiok" className="border border-white/25 hover:bg-white/10 transition-colors text-white font-semibold px-4 py-2 rounded-md text-sm">
              Saját fiók
            </Link>
            <KilepesGomb />
          </div>
        }
      />
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex gap-6">
          {fulek.map((f) => (
            <Link
              key={f.kulcs}
              href={f.href}
              className={`py-4 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                aktiv === f.kulcs ? "border-vasasRed text-navy" : "border-transparent text-navy/50 hover:text-navy"
              }`}
            >
              {f.cimke}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
