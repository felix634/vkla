"use client";

import { useState } from "react";
import Link from "next/link";

// Próbaedzés-jelentkezési űrlap — a /api/probaedzes végpontra küld.
// Kötelező mezők Berkes Máté 2026.09.08-i kérése szerint; amíg az
// e-mail-küldés nincs bekapcsolva (enabled=false), a gomb inaktív.

const inputCls =
  "w-full rounded-md bg-white/10 border border-white/15 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition";
const labelCls = "block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5";

const MEZOK: { nev: string; cimke: string; tipus: string; placeholder?: string; extra?: string }[] = [
  { nev: "gyermekNev", cimke: "Gyermek neve *", tipus: "text", placeholder: "Gyermek teljes neve" },
  { nev: "szuletesiIdo", cimke: "Születési idő *", tipus: "date", extra: " [color-scheme:dark]" },
  { nev: "szuletesiHely", cimke: "Születési hely *", tipus: "text", placeholder: "pl. Budapest" },
  { nev: "anyjaNeve", cimke: "Édesanyja leánykori neve *", tipus: "text", placeholder: "Teljes név" },
  { nev: "jelenlegiCsapat", cimke: "Jelenlegi csapata *", tipus: "text", placeholder: "pl. XYZ SE U9 (ha nincs, írd: nincs)" },
  { nev: "szuloNev", cimke: "Szülő neve *", tipus: "text", placeholder: "Szülő teljes neve" },
  { nev: "telefon", cimke: "Telefonszám *", tipus: "tel", placeholder: "+36 …" },
  { nev: "email", cimke: "E-mail *", tipus: "email", placeholder: "szulo@email.hu" },
];

export default function ProbaedzesForm({ enabled }: { enabled: boolean }) {
  const [allapot, setAllapot] = useState<"urlap" | "kuldes" | "siker">("urlap");
  const [hiba, setHiba] = useState<string | null>(null);

  async function kuldes(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHiba(null);
    const fd = new FormData(e.currentTarget);
    setAllapot("kuldes");
    try {
      const res = await fetch("/api/probaedzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fd.entries())),
      });
      const adat = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(adat.error ?? "A jelentkezés elküldése nem sikerült.");
      setAllapot("siker");
    } catch (err) {
      setAllapot("urlap");
      setHiba(err instanceof Error ? err.message : "A jelentkezés elküldése nem sikerült.");
    }
  }

  if (allapot === "siker") {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 rounded-full bg-gold/20 text-gold flex items-center justify-center mx-auto mb-4">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <div className="font-display font-bold text-xl mb-1">Jelentkezés elküldve!</div>
        <p className="text-sm text-white/60">Köszönjük — kollégáink hamarosan felveszik veled a kapcsolatot.</p>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={kuldes}>
      <div className="grid sm:grid-cols-2 gap-4">
        {MEZOK.map((m) => (
          <div key={m.nev}>
            <label className={labelCls}>{m.cimke}</label>
            <input
              type={m.tipus}
              name={m.nev}
              required
              placeholder={m.placeholder}
              className={inputCls + (m.extra ?? "")}
            />
          </div>
        ))}
      </div>
      <div>
        <label className={labelCls}>Megjegyzés</label>
        <textarea rows={4} name="megjegyzes" placeholder="Bármi, amit fontosnak tartasz…" className={inputCls} />
      </div>
      {/* Honeypot — emberi látogató nem látja, robot kitölti */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <label className="flex items-start gap-2.5 text-xs text-white/60 cursor-pointer">
        <input type="checkbox" required className="mt-0.5 accent-[#d4af37]" />
        <span>
          Elfogadom az{" "}
          <Link href="/dokumentumok" className="underline hover:text-white" target="_blank">
            Adatkezelési Tájékoztatóban
          </Link>{" "}
          foglaltakat, és hozzájárulok a megadott adatok kezeléséhez. *
        </span>
      </label>
      {hiba && <p className="text-sm text-gold font-semibold">{hiba}</p>}
      <button
        type="submit"
        disabled={!enabled || allapot === "kuldes"}
        className="w-full bg-vasasRed hover:bg-vasasRedDark transition-colors text-white font-bold py-3.5 rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {allapot === "kuldes" ? "Küldés…" : "Jelentkezés elküldése"}
      </button>
      {!enabled && (
        <p className="text-center text-xs text-white/45">
          Az online jelentkezés hamarosan indul — addig a fenti központi e-mail címen várjuk a jelentkezést.
        </p>
      )}
    </form>
  );
}
