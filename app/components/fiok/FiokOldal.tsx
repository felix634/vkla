import type { ReactNode } from "react";
import PageHero from "../site/PageHero";

// A szülői fiók kis oldalainak (belépés, regisztráció, jelszó) közös kerete.
export default function FiokOldal({
  cim,
  alcim,
  megjegyzes,
  children,
}: {
  cim: string;
  alcim?: string;
  megjegyzes?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen">
      <PageHero
        breadcrumb="Szülői fiók"
        eyebrow="Képzési díj"
        title={
          <>
            Szülői <span className="text-gold-light">fiók.</span>
          </>
        }
        subtitle={alcim}
      />
      <section className="bg-cream">
        <div className="max-w-xl mx-auto px-6 py-16">
          <div className="bg-white rounded-lg border border-gray-100 p-6 md:p-8">
            <h2 className="font-display font-bold text-xl text-navy mb-5">{cim}</h2>
            {children}
          </div>
          {megjegyzes && <div className="text-sm text-navy/55 leading-relaxed mt-6">{megjegyzes}</div>}
        </div>
      </section>
    </main>
  );
}
