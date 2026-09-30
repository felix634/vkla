"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Azoknak a számláknak az értesítő levele, amelyeknél a feltöltéskor kért
// levél nem ment ki (pl. betelt a levelező napi/óránkénti korlátja). Egyesével,
// lassan küldi újra; ha a levelező sorozatban hibát ad, megáll — később a
// gombbal onnan folytatható.
const TEMPO_MS = 700;
const MAX_HIBA_SOROZAT = 3;

export default function LevelPotlas({
  szamlak,
  levelEnabled,
}: {
  szamlak: { id: string; szamlaszam: string }[];
  levelEnabled: boolean;
}) {
  const router = useRouter();
  const [fut, setFut] = useState(false);
  const [allapot, setAllapot] = useState<string | null>(null);

  // Befejezés után az összegzés akkor is látszik, ha már nem maradt pótolandó.
  if (szamlak.length === 0 && !allapot) return null;

  async function inditas() {
    setFut(true);
    let kesz = 0;
    let nincsCim = 0;
    let hibas = 0;
    let hibaSorozat = 0;
    let megallt = false;
    for (const [i, sz] of szamlak.entries()) {
      setAllapot(`Küldés: ${i + 1} / ${szamlak.length} (${sz.szamlaszam})`);
      const res = await fetch(`/api/admin/szamla/${sz.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ muvelet: "ujrakuldes" }),
      }).catch(() => null);
      if (res?.ok) {
        kesz++;
        hibaSorozat = 0;
      } else if (res?.status === 422) {
        nincsCim++;
      } else {
        hibas++;
        if (++hibaSorozat >= MAX_HIBA_SOROZAT) {
          megallt = true;
          break;
        }
      }
      await new Promise((r) => setTimeout(r, TEMPO_MS));
    }
    setFut(false);
    setAllapot(
      [
        `${kesz} levél kiment.`,
        nincsCim ? `${nincsCim} gyermekhez nincs szülői e-mail-cím a névjegyzékben.` : "",
        megallt
          ? "A levelező most nem fogad több levelet (valószínűleg betelt a küldési korlát). Próbáld újra később — a gomb a maradékkal folytatja."
          : hibas
            ? `${hibas} levél most sem ment ki — próbáld újra később.`
            : "",
      ]
        .filter(Boolean)
        .join(" ")
    );
    router.refresh();
  }

  return (
    <div className="rounded-md border border-gold/40 bg-gold/5 p-5 flex flex-wrap items-center justify-between gap-4">
      <div className="text-sm text-navy/80">
        {szamlak.length ? (
          <>
            <span className="font-semibold text-navy">{szamlak.length} számla értesítő levele nem ment ki</span> a
            feltöltéskor.
          </>
        ) : (
          <span className="font-semibold text-navy">Minden pótlandó levél kiment.</span>
        )}
        {allapot && <div className="mt-1 text-navy/60">{allapot}</div>}
      </div>
      <button
        type="button"
        disabled={fut || !levelEnabled || szamlak.length === 0}
        onClick={inditas}
        className="bg-navy hover:bg-royal transition-colors text-white font-semibold px-4 py-2 rounded-md text-sm disabled:opacity-50"
      >
        {fut ? "Küldés folyamatban…" : "Levelek pótlása"}
      </button>
    </div>
  );
}
