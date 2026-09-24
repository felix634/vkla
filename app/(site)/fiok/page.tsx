import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageHero from "../../components/site/PageHero";
import KilepesGomb from "../../components/fiok/KilepesGomb";
import FizetesGomb from "../../components/fiok/FizetesGomb";
import { fiokEnabled, szuloSzamlai, type Szamla } from "../../lib/fiok/db";
import { aktualisEmail, isAdmin } from "../../lib/fiok/auth";
import { BANKSZAMLA, KEDVEZMENYEZETT, datum, ft, idoszak, kozlemeny } from "../../lib/fiok/format";
import { kartyasFizetes } from "../../lib/fiok/stripe";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Szülői fiók — Vasas Kubala Akadémia",
  robots: { index: false },
};

function Allapot({ sz, ma }: { sz: Szamla; ma: string }) {
  if (sz.fizetve_at) {
    return (
      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm bg-royal/10 text-royal">
        Fizetve
      </span>
    );
  }
  // Lejártnak nem jelölünk semmit: a befizetéseket a pénzügy a saját
  // rendszerében követi, itt csak a határidőt mutatjuk.
  if (sz.hatarido && sz.hatarido >= ma) {
    return (
      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm bg-vasasRed/10 text-vasasRed">
        Esedékes
      </span>
    );
  }
  return null;
}

export default async function FiokPage({ searchParams }: { searchParams: { fizetes?: string } }) {
  if (!fiokEnabled) redirect("/belepes");
  const email = await aktualisEmail();
  if (!email) redirect("/belepes");

  const szamlak = await szuloSzamlai(email);
  const nev = szamlak.find((s) => s.vevo_nev)?.vevo_nev ?? null;
  const ma = new Date().toISOString().slice(0, 10);

  // A gyermekek a számlákból állnak össze (a legfrissebb korosztállyal).
  const gyermekek = new Map<string, string | null>();
  for (const s of szamlak) {
    if (s.gyermek_nev && !gyermekek.has(s.gyermek_nev)) gyermekek.set(s.gyermek_nev, s.korosztaly);
  }

  return (
    <main className="min-h-screen">
      <PageHero
        breadcrumb="Szülői fiók"
        eyebrow="Szülői fiók"
        title={nev ?? "Üdvözlünk!"}
        subtitle={email}
        aside={
          <div className="flex items-center gap-3">
            {isAdmin(email) && (
              <Link
                href="/fiok/admin"
                className="bg-gold hover:bg-gold-dark transition-colors text-navy font-bold px-4 py-2 rounded-md text-sm"
              >
                Számlák kezelése
              </Link>
            )}
            <KilepesGomb />
          </div>
        }
      />

      <section className="bg-cream">
        <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-12 gap-8 items-start">
          {/* Bal: gyermekek + befizetési információ */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-navy text-white rounded-lg p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
              <div className="relative">
                <div className="text-xs uppercase tracking-widest text-white/50 mb-3">Gyermek(ek)</div>
                {gyermekek.size ? (
                  <div className="space-y-2.5">
                    {[...gyermekek].map(([gy, kor]) => (
                      <div key={gy} className="flex items-center gap-3 rounded-md bg-white/5 border border-white/10 px-3 py-2.5">
                        <span className="h-8 w-8 rounded-full bg-vasasRed/80 flex items-center justify-center text-xs font-bold">
                          {gy
                            .split(/\s+/)
                            .map((r) => r[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </span>
                        <span className="text-sm">
                          {gy}
                          {kor && <span className="text-white/50"> · {kor}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/60">Az első számlával együtt jelennek meg.</p>
                )}
              </div>
            </div>

            <div className="rounded-md border border-gold/40 bg-gold/5 p-6">
              <h3 className="font-display font-bold text-lg text-navy mb-3">Befizetés átutalással</h3>
              <div className="text-sm text-navy/60">{KEDVEZMENYEZETT}</div>
              <div className="font-display font-black text-xl text-navy tracking-wider mb-3">{BANKSZAMLA}</div>
              <p className="text-sm text-navy/70">
                <span className="font-semibold text-navy">Közlemény:</span> a gyermek neve,
                korosztálya és a hónap. A számláknál ezt előre kitöltve mutatjuk.
              </p>
            </div>
          </div>

          {/* Jobb: számlák */}
          <div className="lg:col-span-8">
            {searchParams.fizetes === "siker" && (
              <div className="mb-5 rounded-md border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
                Köszönjük, a fizetés sikeres! A számla állapota néhány percen belül frissül.
              </div>
            )}
            <div className="bg-white rounded-lg border border-gray-100 p-6">
              <h2 className="font-display font-bold text-xl text-navy mb-4">Számlák</h2>
              {szamlak.length === 0 ? (
                <p className="text-sm text-navy/60 leading-relaxed">
                  Ehhez az e-mail-címhez még nem érkezett számla. A számlákat arra a címre
                  küldjük, amelyet a képzési szerződésben megadtál — ha több címet használsz,
                  lépj be azzal.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {szamlak.map((sz) => (
                    <div key={sz.id} className="py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-bold text-navy">{idoszak(sz.idoszak)}</span>
                          <Allapot sz={sz} ma={ma} />
                        </div>
                        <div className="text-sm text-navy/60">
                          {[sz.gyermek_nev, sz.korosztaly].filter(Boolean).join(" · ")}
                        </div>
                        <div className="text-xs text-navy/45 mt-1">
                          Számlaszám: {sz.szamlaszam}
                          {sz.hatarido && <> · Határidő: {datum(sz.hatarido)}</>}
                        </div>
                        {!sz.fizetve_at && kozlemeny(sz) && (
                          <div className="text-xs text-navy/45">Közlemény: {kozlemeny(sz)}</div>
                        )}
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <span className="font-display font-black text-lg text-navy whitespace-nowrap">{ft(sz.osszeg)}</span>
                        {kartyasFizetes && !sz.fizetve_at && <FizetesGomb id={sz.id} />}
                        <a
                          href={`/api/fiok/szamla/${sz.id}`}
                          target="_blank"
                          rel="noopener"
                          className="bg-navy hover:bg-royal transition-colors text-white font-semibold px-4 py-2 rounded-md text-sm whitespace-nowrap"
                        >
                          Számla (PDF)
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
