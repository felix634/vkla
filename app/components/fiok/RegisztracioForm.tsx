"use client";

import { useState } from "react";
import Link from "next/link";
import { Honeypot, LevelElkuldve, gombCls, inputCls, kuld, labelCls } from "./urlap";

// Regisztráció: név + e-mail-cím. A jelszót a szülő az e-mailben kapott
// linken állítja be — így csak a postafiók tulajdonosa hozhat létre fiókot.
export default function RegisztracioForm({ enabled }: { enabled: boolean }) {
  const [fut, setFut] = useState(false);
  const [hiba, setHiba] = useState<string | null>(null);
  const [kesz, setKesz] = useState<string | null>(null);

  async function regisztracio(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHiba(null);
    setFut(true);
    const fd = new FormData(e.currentTarget);
    const v = await kuld("/api/fiok/regisztracio", Object.fromEntries(fd.entries()));
    setFut(false);
    if (v.ok) setKesz(String(fd.get("email")));
    else setHiba(v.error ?? "A regisztráció nem sikerült.");
  }

  if (kesz) {
    return <LevelElkuldve email={kesz} szoveg="Elküldtük a jelszó beállításához szükséges linket erre a címre:" />;
  }

  return (
    <form className="space-y-4" onSubmit={regisztracio}>
      <div>
        <label className={labelCls}>Név</label>
        <input type="text" name="nev" required autoComplete="name" placeholder="Szülő neve" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>E-mail-cím</label>
        <input type="email" name="email" required autoComplete="email" placeholder="amelyet a klubnál megadtál" className={inputCls} />
      </div>
      <Honeypot />
      <label className="flex items-start gap-2.5 text-xs text-navy/60 cursor-pointer">
        <input type="checkbox" required className="mt-0.5 accent-[#123274]" />
        <span>
          Elfogadom az{" "}
          <Link href="/dokumentumok" className="underline hover:text-navy" target="_blank">
            Adatkezelési Tájékoztatóban
          </Link>{" "}
          foglaltakat. *
        </span>
      </label>
      {hiba && <p className="text-sm text-vasasRed font-semibold">{hiba}</p>}
      <button type="submit" disabled={!enabled || fut} className={gombCls}>
        {fut ? "Küldés…" : "Regisztráció"}
      </button>
      {!enabled ? (
        <p className="text-center text-xs text-navy/45">A szülői fiók hamarosan indul.</p>
      ) : (
        <p className="text-center text-sm text-navy/60">
          Van már fiókod?{" "}
          <Link href="/belepes" className="font-semibold text-royal hover:text-navy underline">
            Belépés
          </Link>
        </p>
      )}
    </form>
  );
}
