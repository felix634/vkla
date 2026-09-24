import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageHero from "../../../components/site/PageHero";
import KilepesGomb from "../../../components/fiok/KilepesGomb";
import SzamlaFeltolto from "../../../components/fiok/SzamlaFeltolto";
import SzamlaMuveletek from "../../../components/fiok/SzamlaMuveletek";
import { emailEnabled } from "../../../lib/email";
import { SZAMLA_MEZOK, fiokEnabled, sql, type Szamla } from "../../../lib/fiok/db";
import { aktualisEmail, isAdmin } from "../../../lib/fiok/auth";
import { datum, ft, idoszak } from "../../../lib/fiok/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Számlák kezelése — Vasas Kubala Akadémia",
  robots: { index: false },
};

// Pénzügyi felület: számlák feltöltése és a feltöltött számlák kezelése.
// Csak az ADMIN_EMAILS-ben felsorolt címekkel belépve érhető el.
export default async function SzamlaAdminPage({ searchParams }: { searchParams: { q?: string } }) {
  if (!fiokEnabled) redirect("/belepes");
  const email = await aktualisEmail();
  if (!email) redirect("/belepes");
  if (!isAdmin(email)) redirect("/fiok");

  const q = (searchParams.q ?? "").trim();
  const db = sql();
  const szamlak = (
    q
      ? await db.query(
          `SELECT ${SZAMLA_MEZOK} FROM szamla
           WHERE email ILIKE $1 OR szamlaszam ILIKE $1 OR gyermek_nev ILIKE $1 OR vevo_nev ILIKE $1
           ORDER BY created_at DESC LIMIT 200`,
          [`%${q}%`]
        )
      : await db.query(`SELECT ${SZAMLA_MEZOK} FROM szamla ORDER BY created_at DESC LIMIT 100`)
  ) as Szamla[];
  const [stat] = (await db.query(
    `SELECT count(*)::int AS osszes,
            count(*) FILTER (WHERE ertesitve_at IS NULL)::int AS nincs_ertesitve,
            count(DISTINCT email)::int AS szulok
     FROM szamla`
  )) as { osszes: number; nincs_ertesitve: number; szulok: number }[];

  return (
    <main className="min-h-screen">
      <PageHero
        breadcrumb="Számlák kezelése"
        eyebrow="Pénzügy"
        title="Számlák kezelése"
        subtitle={`${stat.osszes} számla · ${stat.szulok} szülő · ${stat.nincs_ertesitve} értesítés nélkül`}
        aside={
          <div className="flex items-center gap-3">
            <Link href="/fiok" className="border border-white/25 hover:bg-white/10 transition-colors text-white font-semibold px-4 py-2 rounded-md text-sm">
              Saját fiók
            </Link>
            <KilepesGomb />
          </div>
        }
      />

      <section className="bg-cream">
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
          <SzamlaFeltolto levelEnabled={emailEnabled} />

          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="font-display font-bold text-xl text-navy">
                {q ? `Keresés: „${q}”` : "Legutóbb feltöltött számlák"}
              </h2>
              <form className="flex gap-2">
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="E-mail, számlaszám, név…"
                  className="rounded-md border border-gray-200 px-3 py-2 text-sm text-navy focus:outline-none focus:border-royal"
                />
                <button className="bg-navy hover:bg-royal transition-colors text-white font-semibold px-4 py-2 rounded-md text-sm">
                  Keresés
                </button>
              </form>
            </div>
            {szamlak.length === 0 ? (
              <p className="text-sm text-navy/60">{q ? "Nincs találat." : "Még nincs feltöltött számla."}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wider text-navy/55 border-b border-gray-100">
                    <tr>
                      <th className="py-2 pr-3">Számlaszám</th>
                      <th className="py-2 pr-3">Szülő</th>
                      <th className="py-2 pr-3">Gyermek</th>
                      <th className="py-2 pr-3">Időszak</th>
                      <th className="py-2 pr-3 text-right">Összeg</th>
                      <th className="py-2 pr-3">Határidő</th>
                      <th className="py-2 pr-3">Állapot</th>
                      <th className="py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {szamlak.map((sz) => (
                      <tr key={sz.id} className="align-top">
                        <td className="py-2.5 pr-3 whitespace-nowrap font-semibold text-navy">{sz.szamlaszam}</td>
                        <td className="py-2.5 pr-3">
                          <div className="text-navy">{sz.vevo_nev ?? "—"}</div>
                          <div className="text-xs text-navy/50">{sz.email}</div>
                        </td>
                        <td className="py-2.5 pr-3">{[sz.gyermek_nev, sz.korosztaly].filter(Boolean).join(" · ") || "—"}</td>
                        <td className="py-2.5 pr-3 whitespace-nowrap">{idoszak(sz.idoszak)}</td>
                        <td className="py-2.5 pr-3 text-right whitespace-nowrap">{ft(sz.osszeg)}</td>
                        <td className="py-2.5 pr-3 whitespace-nowrap">{datum(sz.hatarido)}</td>
                        <td className="py-2.5 pr-3 text-xs whitespace-nowrap">
                          <div className={sz.fizetve_at ? "text-royal font-semibold" : "text-navy/50"}>
                            {sz.fizetve_at ? "Fizetve" : "Nincs jelölve"}
                          </div>
                          <div className={sz.ertesitve_at ? "text-green-700" : "text-vasasRed"}>
                            {sz.ertesitve_at ? "Levél elküldve" : "Nincs levél"}
                          </div>
                        </td>
                        <td className="py-2.5">
                          <SzamlaMuveletek
                            id={sz.id}
                            szamlaszam={sz.szamlaszam}
                            fizetve={!!sz.fizetve_at}
                            levelEnabled={emailEnabled}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
