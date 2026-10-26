"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GroupFilter from "./site/GroupFilter";
import { MLSZ_ADATBANK_URL, type MerkozesNezet, type MerkozesSor } from "../lib/mlsz";

// A Mérkőzések oldal (Tóth Patrik listája, 2026.10.23.): egy oldalon a
// következő mérkőzések és a frissülő eredmények (korosztály, dátum, párosítás,
// helyszín), legnagyobb korosztálytól lefelé szűrhetően, alatta korosztályonként
// választható bajnoki tabella. Az adat az MLSZ adatbankból jön (lib/mlsz.ts).

const HONAP = ["jan.", "febr.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."];
const NAP = ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"];
const LAPMERET = 8;

function datum(ido: string, maiEv: number) {
  const [d, t = ""] = ido.split("T");
  const [ev, ho, nap] = d.split("-").map(Number);
  const het = NAP[new Date(Date.UTC(ev, ho - 1, nap)).getUTCDay()];
  const ora = t.slice(0, 5) && t.slice(0, 5) !== "00:00" ? ` ${t.slice(0, 5)}` : "";
  return `${ev !== maiEv ? `${ev}. ` : ""}${HONAP[ho - 1]} ${nap}., ${het}${ora}`;
}

export default function MatchCenter({
  nezet,
  frissitve,
  evad,
  most,
}: {
  nezet: MerkozesNezet | null;
  frissitve?: string;
  evad?: string;
  most: string;
}) {
  const [filter, setFilter] = useState("Összes");
  const [limit, setLimit] = useState({ kovetkezo: LAPMERET, eredmeny: LAPMERET });
  const tabellaKorosztalyok = Array.from(new Set(nezet?.tabellak.map((t) => t.korosztaly) ?? []));
  const [tabKor, setTabKor] = useState(tabellaKorosztalyok[0] ?? "");

  // A fenti szűrő a tabellát is a választott korosztályra állítja, ha van neki.
  useEffect(() => {
    setLimit({ kovetkezo: LAPMERET, eredmeny: LAPMERET });
    if (tabellaKorosztalyok.includes(filter)) setTabKor(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  if (!nezet || nezet.sorok.length === 0) return <NincsAdat />;

  const maiEv = Number(most.slice(0, 4));
  const szurt = nezet.sorok.filter((s) => filter === "Összes" || s.korosztaly === filter);
  const kovetkezok = szurt.filter((s) => s.allapot === "kovetkezo").sort((a, b) => a.ido.localeCompare(b.ido));
  const eredmenyek = szurt
    .filter((s) => s.allapot !== "kovetkezo" && s.ido.slice(0, 10) <= most.slice(0, 10))
    .sort((a, b) => b.ido.localeCompare(a.ido));
  const eredmenyNelkul =
    filter !== "Összes" && eredmenyek.length > 0 && !eredmenyek.some((s) => s.allapot === "eredmeny");
  const tabellak = nezet.tabellak.filter((t) => t.korosztaly === tabKor);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <GroupFilter filter={filter} setFilter={setFilter} options={nezet.korosztalyok} />
        <p className="text-xs text-navy/50">
          {evad && <>{evad} · </>}Forrás:{" "}
          <a href={MLSZ_ADATBANK_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-vasasRed">
            MLSZ adatbank ↗
          </a>
          {frissitve && <> · frissítve: {frissitve}</>}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Lista
          cim="Következő mérkőzések"
          sorok={kovetkezok}
          limit={limit.kovetkezo}
          tobb={() => setLimit((l) => ({ ...l, kovetkezo: l.kovetkezo + 10 }))}
          ures="Ebben a korosztályban most nincs kiírt mérkőzés."
          maiEv={maiEv}
        />
        <Lista
          cim="Eredmények"
          sorok={eredmenyek}
          limit={limit.eredmeny}
          tobb={() => setLimit((l) => ({ ...l, eredmeny: l.eredmeny + 10 }))}
          ures="Ebben a korosztályban még nincs lejátszott mérkőzés."
          megjegyzes={
            eredmenyNelkul
              ? "Ebben a korosztályban az MLSZ nem közöl eredményt, ezért itt csak a lejátszott mérkőzések szerepelnek."
              : undefined
          }
          maiEv={maiEv}
        />
      </div>

      {tabellaKorosztalyok.length > 0 && (
        <section className="mt-16" aria-labelledby="tabella-cim">
          <span className="section-eyebrow">Tabella</span>
          <h2 id="tabella-cim" className="heading-display text-3xl md:text-4xl text-navy mt-3">
            Bajnoki tabella
          </h2>
          <div className="gold-divider mt-4 mb-6" />
          <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Tabella korosztálya">
            {tabellaKorosztalyok.map((k) => (
              <button
                key={k}
                onClick={() => setTabKor(k)}
                aria-pressed={tabKor === k}
                className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                  tabKor === k
                    ? "bg-vasasRed text-white border-vasasRed"
                    : "bg-white text-navy/70 border-gray-200 hover:border-vasasRed/50 hover:text-vasasRed"
                }`}
              >
                {k}
              </button>
            ))}
          </div>
          <div className="space-y-6">
            {tabellak.map((t) => (
              <div key={t.verseny} className="bg-white border border-gray-100 rounded-md overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 text-sm">
                  <span className="font-semibold text-navy">{t.verseny}</span>
                  {t.fordulo && <span className="text-navy/50"> · {t.fordulo} után</span>}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm tabular-nums">
                    <thead className="text-xs text-navy/50 uppercase tracking-wide">
                      <tr className="border-b border-gray-100">
                        <th className="text-right font-semibold pl-2 pr-1 sm:px-3 py-2 w-8 sm:w-10">#</th>
                        <th className="text-left font-semibold px-2 sm:px-3 py-2">Csapat</th>
                        <th className="text-center font-semibold px-1.5 sm:px-2 py-2" title="Mérkőzés">M</th>
                        <th className="text-center font-semibold px-1.5 sm:px-2 py-2" title="Győzelem">Gy</th>
                        <th className="text-center font-semibold px-1.5 sm:px-2 py-2" title="Döntetlen">D</th>
                        <th className="text-center font-semibold px-1.5 sm:px-2 py-2" title="Vereség">V</th>
                        <th className="text-center font-semibold px-1.5 sm:px-2 py-2 hidden sm:table-cell" title="Lőtt–kapott gól">Gól</th>
                        <th className="text-center font-semibold px-1.5 sm:px-2 py-2 hidden sm:table-cell" title="Gólkülönbség">Gk</th>
                        <th className="text-center font-semibold px-2 sm:px-3 py-2" title="Pont">P</th>
                      </tr>
                    </thead>
                    <tbody>
                      {t.sorok.map((s) => (
                        <tr
                          key={`${s.hely}-${s.csapat}`}
                          className={`border-b border-gray-50 last:border-0 ${s.vkla ? "bg-vasasRed/5 font-bold text-navy" : "text-navy/80"}`}
                        >
                          <td className="text-right pl-2 pr-1 sm:px-3 py-2">{s.hely}.</td>
                          <td className="px-2 sm:px-3 py-2 uppercase text-[12px] sm:text-[13px] leading-tight">{s.csapat}</td>
                          <td className="text-center px-1.5 sm:px-2 py-2">{s.m}</td>
                          <td className="text-center px-1.5 sm:px-2 py-2">{s.gy}</td>
                          <td className="text-center px-1.5 sm:px-2 py-2">{s.d}</td>
                          <td className="text-center px-1.5 sm:px-2 py-2">{s.v}</td>
                          <td className="text-center px-1.5 sm:px-2 py-2 hidden sm:table-cell">
                            {s.lg}–{s.kg}
                          </td>
                          <td className="text-center px-1.5 sm:px-2 py-2 hidden sm:table-cell">{s.gk > 0 ? `+${s.gk}` : s.gk}</td>
                          <td className="text-center px-2 sm:px-3 py-2 font-bold">{s.p}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Lista({
  cim,
  sorok,
  limit,
  tobb,
  ures,
  megjegyzes,
  maiEv,
}: {
  cim: string;
  sorok: MerkozesSor[];
  limit: number;
  tobb: () => void;
  ures: string;
  megjegyzes?: string;
  maiEv: number;
}) {
  return (
    <section aria-label={cim}>
      <h2 className="font-display font-black text-2xl text-navy mb-4">{cim}</h2>
      {megjegyzes && <p className="text-xs text-navy/50 mb-3">{megjegyzes}</p>}
      {sorok.length === 0 ? (
        <p className="bg-white border border-gray-100 rounded-md px-4 py-8 text-center text-sm text-navy/50">{ures}</p>
      ) : (
        <ul className="space-y-3">
          {sorok.slice(0, limit).map((s) => (
            <Sor key={s.kod} s={s} maiEv={maiEv} />
          ))}
        </ul>
      )}
      {sorok.length > limit && (
        <button
          onClick={tobb}
          className="mt-4 w-full border border-navy/15 hover:border-vasasRed/50 hover:text-vasasRed transition-colors text-navy/70 font-semibold text-sm py-2.5 rounded-md bg-white"
        >
          Továbbiak ({sorok.length - limit})
        </button>
      )}
    </section>
  );
}

const KIMENET_SZIN = { gy: "bg-emerald-600 text-white", d: "bg-navy/70 text-white", v: "bg-vasasRed text-white" };

function Sor({ s, maiEv }: { s: MerkozesSor; maiEv: number }) {
  const csapat = (nev: string, vkla: boolean, igazitas: string) => (
    <span
      className={`${igazitas} uppercase text-[13px] leading-tight break-words ${vkla ? "font-bold text-navy" : "font-semibold text-navy/70"}`}
    >
      {nev}
    </span>
  );
  const kozep =
    s.allapot === "eredmeny" ? (
      <span className={`font-display font-black text-lg px-2.5 py-0.5 rounded tabular-nums ${KIMENET_SZIN[s.kimenet!]}`}>
        {s.eredmeny}
      </span>
    ) : s.allapot === "kovetkezo" ? (
      <span className="font-display font-bold text-sm text-navy/60 px-2">–</span>
    ) : (
      // Eredményközlés nélküli korosztály, vagy még nem rögzített eredmény.
      <span className="font-display font-bold text-sm text-navy/40 px-2">–</span>
    );

  return (
    <li className="bg-white border border-gray-100 rounded-md px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
        <span className="flex items-center gap-2 min-w-0">
          <span className="bg-royal text-white font-bold px-2 py-0.5 rounded-sm shrink-0">{s.korosztaly}</span>
          <span className="text-navy/50 truncate">{s.verseny}</span>
        </span>
        <span className="text-navy/70 font-semibold">{datum(s.ido, maiEv)}</span>
      </div>
      <div className="mt-2.5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        {csapat(s.hazai, s.vklaHazai, "text-right")}
        {kozep}
        {csapat(s.vendeg, !s.vklaHazai, "text-left")}
      </div>
      {s.helyszin && <div className="mt-2 text-xs text-navy/45 text-center">{s.helyszin}</div>}
    </li>
  );
}

// Ha az MLSZ-adat épp nem érhető el (a szerver vagy az MLSZ nem válaszol).
function NincsAdat() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="bg-white border border-gray-100 rounded-lg p-8 md:p-12 grid md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-8">
          <span className="section-eyebrow">MLSZ adatbank</span>
          <h2 className="font-display font-black text-2xl md:text-3xl text-navy mt-3 mb-4">
            A mérkőzésadatok átmenetileg nem érhetők el
          </h2>
          <p className="text-navy/70 leading-relaxed">
            A menetrend, az eredmények és a tabellák az MLSZ adatbankjából frissülnek. Addig a hétvégi mérkőzésekről
            szóló beszámolókat a Hírek között, a hivatalos eredményeket és tabellákat az MLSZ adatbankban találod.
          </p>
        </div>
        <div className="md:col-span-4 flex flex-col gap-3">
          <Link
            href="/hirek"
            className="bg-navy hover:bg-royal transition-colors text-white font-semibold px-5 py-3 rounded-md text-sm text-center"
          >
            Mérkőzés-beszámolók a Hírekben
          </Link>
          <a
            href={MLSZ_ADATBANK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-navy/20 hover:bg-cream transition-colors text-navy font-semibold px-5 py-3 rounded-md text-sm text-center"
          >
            MLSZ adatbank ↗
          </a>
        </div>
      </div>
    </div>
  );
}
