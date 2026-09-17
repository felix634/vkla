"use client";

import { useState } from "react";
import Link from "next/link";

// Általános kapcsolatfelvételi űrlap — a /api/kapcsolat végpontra küld.
// Amíg az e-mail-küldés nincs bekapcsolva (enabled=false), a gomb inaktív.

const inputCls =
  "w-full rounded-md border border-gray-200 px-3.5 py-2.5 text-sm text-navy placeholder:text-navy/35 focus:outline-none focus:border-royal focus:ring-2 focus:ring-royal/15 transition";
const labelCls = "block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5";

export default function KapcsolatForm({ enabled }: { enabled: boolean }) {
  const [allapot, setAllapot] = useState<"urlap" | "kuldes" | "siker">("urlap");
  const [hiba, setHiba] = useState<string | null>(null);

  async function kuldes(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHiba(null);
    const fd = new FormData(e.currentTarget);
    setAllapot("kuldes");
    try {
      const res = await fetch("/api/kapcsolat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fd.entries())),
      });
      const adat = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(adat.error ?? "Az üzenet elküldése nem sikerült.");
      setAllapot("siker");
    } catch (err) {
      setAllapot("urlap");
      setHiba(err instanceof Error ? err.message : "Az üzenet elküldése nem sikerült.");
    }
  }

  if (allapot === "siker") {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-4">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <div className="font-display font-bold text-xl text-navy mb-1">Üzenet elküldve!</div>
        <p className="text-sm text-navy/60">Köszönjük a megkeresést — hamarosan válaszolunk.</p>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={kuldes}>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Név</label>
          <input type="text" name="nev" required placeholder="Teljes név" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>E-mail</label>
          <input type="email" name="email" required placeholder="email@pelda.hu" className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Tárgy</label>
        <input type="text" name="targy" required placeholder="Miben segíthetünk?" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Üzenet</label>
        <textarea rows={5} name="uzenet" required placeholder="Írd le a kérdésed…" className={inputCls} />
      </div>
      {/* Honeypot — emberi látogató nem látja, robot kitölti */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <label className="flex items-start gap-2.5 text-xs text-navy/60 cursor-pointer">
        <input type="checkbox" required className="mt-0.5 accent-[#123274]" />
        <span>
          Elfogadom az{" "}
          <Link href="/dokumentumok" className="underline hover:text-navy" target="_blank">
            Adatkezelési Tájékoztatóban
          </Link>{" "}
          foglaltakat, és hozzájárulok a megadott adataim kezeléséhez. *
        </span>
      </label>
      {hiba && <p className="text-sm text-vasasRed font-semibold">{hiba}</p>}
      <button
        type="submit"
        disabled={!enabled || allapot === "kuldes"}
        className="w-full bg-navy hover:bg-royal transition-colors text-white font-bold py-3 rounded-md text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {allapot === "kuldes" ? "Küldés…" : "Üzenet küldése"}
      </button>
      {!enabled && (
        <p className="text-center text-xs text-navy/45">
          Az online üzenetküldés hamarosan indul — addig írj közvetlenül e-mailben.
        </p>
      )}
    </form>
  );
}
