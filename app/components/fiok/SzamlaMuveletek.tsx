"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Soronkénti pénzügyi műveletek a számlalistában.
export default function SzamlaMuveletek({
  id,
  szamlaszam,
  fizetve,
  levelEnabled,
}: {
  id: string;
  szamlaszam: string;
  fizetve: boolean;
  levelEnabled: boolean;
}) {
  const router = useRouter();
  const [fut, setFut] = useState(false);

  async function muvelet(m: "ujrakuldes" | "fizetve" | "nemfizetve" | "torles") {
    if (m === "torles" && !confirm(`Biztosan törlöd a(z) ${szamlaszam} számlát? A szülő fiókjából is eltűnik.`)) return;
    if (m === "ujrakuldes" && !confirm(`Újraküldöd az értesítő levelet a(z) ${szamlaszam} számláról?`)) return;
    setFut(true);
    const res = await fetch(`/api/admin/szamla/${id}`, {
      method: m === "torles" ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: m === "torles" ? undefined : JSON.stringify({ muvelet: m }),
    }).catch(() => null);
    setFut(false);
    if (!res?.ok) {
      const adat = await res?.json().catch(() => ({}));
      alert(adat?.error ?? "A művelet nem sikerült.");
      return;
    }
    if (m === "ujrakuldes") alert("A levél elküldve.");
    router.refresh();
  }

  const gomb = "text-xs font-semibold px-2.5 py-1.5 rounded border transition-colors disabled:opacity-50";
  return (
    <div className="flex flex-wrap gap-1.5 justify-end">
      <a href={`/api/fiok/szamla/${id}`} target="_blank" rel="noopener" className={`${gomb} border-gray-200 text-navy hover:bg-cream`}>
        PDF
      </a>
      <button type="button" disabled={fut || !levelEnabled} onClick={() => muvelet("ujrakuldes")} className={`${gomb} border-gray-200 text-navy hover:bg-cream`}>
        Levél újra
      </button>
      <button
        type="button"
        disabled={fut}
        onClick={() => muvelet(fizetve ? "nemfizetve" : "fizetve")}
        className={`${gomb} ${fizetve ? "border-gray-200 text-navy/60 hover:bg-cream" : "border-royal/30 text-royal hover:bg-royal/5"}`}
      >
        {fizetve ? "Mégsem fizetve" : "Fizetve"}
      </button>
      <button type="button" disabled={fut} onClick={() => muvelet("torles")} className={`${gomb} border-vasasRed/30 text-vasasRed hover:bg-vasasRed/5`}>
        Törlés
      </button>
    </div>
  );
}
