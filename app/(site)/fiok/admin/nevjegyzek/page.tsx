import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminFejlec from "../../../../components/fiok/AdminFejlec";
import GyermekSor from "../../../../components/fiok/GyermekSor";
import NevjegyzekImport from "../../../../components/fiok/NevjegyzekImport";
import { fiokEnabled, sql } from "../../../../lib/fiok/db";
import { aktualisEmail, isAdmin } from "../../../../lib/fiok/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Szülői névjegyzék — Vasas Kubala Akadémia",
  robots: { index: false },
};

type Sor = {
  id: string;
  nev: string;
  korosztaly: string | null;
  vevokod: string | null;
  emailek: { email: string; regisztralt: boolean }[];
  szamlak: number;
};

// Pénzügyi felület: melyik gyermekhez melyik szülői e-mail-cím(ek) tartoznak.
// Egy szülő azoknak a gyermekeknek a számláit látja, akiknél a címe szerepel.
export default async function NevjegyzekPage({ searchParams }: { searchParams: { q?: string } }) {
  if (!fiokEnabled) redirect("/belepes");
  const email = await aktualisEmail();
  if (!email) redirect("/belepes");
  if (!isAdmin(email)) redirect("/fiok");

  const q = (searchParams.q ?? "").trim();
  const db = sql();
  const sorok = (await db.query(
    `SELECT g.id, g.nev, g.korosztaly, g.vevokod,
       COALESCE(json_agg(json_build_object('email', ge.email, 'regisztralt', sz.megerositve_at IS NOT NULL)
                ORDER BY ge.email) FILTER (WHERE ge.email IS NOT NULL), '[]') AS emailek,
       (SELECT count(*) FROM szamla s WHERE s.gyermek_id = g.id)::int AS szamlak
     FROM gyermek g
     LEFT JOIN gyermek_email ge ON ge.gyermek_id = g.id
     LEFT JOIN szulo sz ON sz.email = ge.email
     WHERE $1 = '' OR g.nev ILIKE $2 OR g.vevokod ILIKE $2 OR g.korosztaly ILIKE $2
        OR EXISTS (SELECT 1 FROM gyermek_email x WHERE x.gyermek_id = g.id AND x.email ILIKE $2)
     GROUP BY g.id
     ORDER BY g.nev
     LIMIT 1000`,
    [q, `%${q}%`]
  )) as Sor[];
  const [stat] = (await db.query(
    `SELECT (SELECT count(*) FROM gyermek)::int AS gyermekek,
            (SELECT count(*) FROM gyermek g WHERE NOT EXISTS (SELECT 1 FROM gyermek_email ge WHERE ge.gyermek_id = g.id))::int AS cim_nelkul,
            (SELECT count(DISTINCT email) FROM gyermek_email)::int AS cimek,
            (SELECT count(*) FROM szulo s WHERE s.megerositve_at IS NOT NULL
               AND EXISTS (SELECT 1 FROM gyermek_email ge WHERE ge.email = s.email))::int AS regisztralt`
  )) as { gyermekek: number; cim_nelkul: number; cimek: number; regisztralt: number }[];

  return (
    <main className="min-h-screen">
      <AdminFejlec
        aktiv="nevjegyzek"
        alcim={`${stat.gyermekek} gyermek · ${stat.cimek} szülői cím · ${stat.regisztralt} regisztrált szülő · ${stat.cim_nelkul} gyermek cím nélkül`}
      />

      <section className="bg-cream">
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
          <NevjegyzekImport />

          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <h2 className="font-display font-bold text-xl text-navy">
                {q ? `Keresés: „${q}”` : "Gyermekek és szülői címek"}
              </h2>
              <form className="flex gap-2">
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Név, e-mail, korosztály…"
                  className="rounded-md border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-royal"
                />
                <button className="bg-navy hover:bg-royal transition-colors text-white font-semibold px-4 py-2 rounded-md text-sm">
                  Keresés
                </button>
              </form>
            </div>
            <p className="text-xs text-navy/50 mb-4">
              Zöld pipa: a szülő már regisztrált. Új cím hozzáadásához írd be a címet a sor végén, és nyomj Entert.
            </p>
            {sorok.length === 0 ? (
              <p className="text-sm text-navy/60">{q ? "Nincs találat." : "A névjegyzék még üres — töltsd fel a fenti táblázattal."}</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {sorok.map((g) => (
                  <div key={g.id} className="py-3 grid md:grid-cols-12 gap-2 md:gap-4 items-start">
                    <div className="md:col-span-4">
                      <div className="font-semibold text-navy">{g.nev}</div>
                      <div className="text-xs text-navy/50">
                        {[g.korosztaly, g.vevokod && `vevőkód: ${g.vevokod}`, g.szamlak ? `${g.szamlak} számla` : null]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </div>
                    </div>
                    <div className="md:col-span-8">
                      <GyermekSor id={g.id} nev={g.nev} emailek={g.emailek} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
