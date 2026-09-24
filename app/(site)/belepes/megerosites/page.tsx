import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "../../../components/site/PageHero";
import MegerositesGomb from "../../../components/fiok/MegerositesGomb";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Belépés a szülői fiókba — Vasas Kubala Akadémia",
  robots: { index: false },
  // A token ne kerüljön Referer fejlécbe.
  referrer: "no-referrer",
};

export default function MegerositesPage({ searchParams }: { searchParams: { t?: string } }) {
  const token = searchParams.t ?? "";
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
      />
      <section className="bg-cream">
        <div className="max-w-xl mx-auto px-6 py-16">
          <div className="bg-white rounded-lg border border-gray-100 p-6 md:p-8">
            {token ? (
              <>
                <h2 className="font-display font-bold text-xl text-navy mb-2">Még egy kattintás</h2>
                <p className="text-sm text-navy/60 mb-6">
                  A gombra kattintva belépsz a szülői fiókodba.
                </p>
                <MegerositesGomb token={token} />
              </>
            ) : (
              <>
                <h2 className="font-display font-bold text-xl text-navy mb-2">Hiányzó belépési link</h2>
                <p className="text-sm text-navy/60 mb-4">
                  A link hiányos. Nyisd meg újra a levélből, vagy kérj újat.
                </p>
                <Link href="/belepes" className="text-sm font-semibold text-royal hover:text-navy underline">
                  Új belépési link kérése
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
