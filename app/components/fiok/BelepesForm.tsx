"use client";

import { useState } from "react";

// Belépési link kérése — a szülő az e-mail-címét adja meg, amelyre a
// képzési díj számláit kapja.

const inputCls =
  "w-full rounded-md border border-gray-200 px-3.5 py-2.5 text-sm text-navy placeholder:text-navy/35 focus:outline-none focus:border-royal focus:ring-2 focus:ring-royal/15 transition";

export default function BelepesForm({ enabled }: { enabled: boolean }) {
  const [allapot, setAllapot] = useState<"urlap" | "kuldes" | "elkuldve">("urlap");
  const [email, setEmail] = useState("");
  const [hiba, setHiba] = useState<string | null>(null);

  async function kuldes(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHiba(null);
    const fd = new FormData(e.currentTarget);
    setAllapot("kuldes");
    try {
      const res = await fetch("/api/fiok/belepes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fd.entries())),
      });
      const adat = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(adat.error ?? "A belépési link elküldése nem sikerült.");
      setAllapot("elkuldve");
    } catch (err) {
      setAllapot("urlap");
      setHiba(err instanceof Error ? err.message : "A belépési link elküldése nem sikerült.");
    }
  }

  if (allapot === "elkuldve") {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-4">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <div className="font-display font-bold text-xl text-navy mb-2">Nézd meg a postafiókod!</div>
        <p className="text-sm text-navy/65 leading-relaxed">
          Elküldtük a belépési linket a(z) <strong className="text-navy">{email}</strong> címre.
          A link 30 percig érvényes. Ha nem találod, nézd meg a Spam / Promóciók mappát is.
        </p>
        <button
          type="button"
          onClick={() => setAllapot("urlap")}
          className="mt-5 text-sm font-semibold text-royal hover:text-navy underline"
        >
          Másik e-mail-címet adok meg
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={kuldes}>
      <div>
        <label className="block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5">
          E-mail-cím
        </label>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="amelyre a számlákat kapod"
          className={inputCls}
        />
      </div>
      {/* Honeypot — emberi látogató nem látja, robot kitölti */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {hiba && <p className="text-sm text-vasasRed font-semibold">{hiba}</p>}
      <button
        type="submit"
        disabled={!enabled || allapot === "kuldes"}
        className="w-full bg-navy hover:bg-royal transition-colors text-white font-bold py-3 rounded-md text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {allapot === "kuldes" ? "Küldés…" : "Belépési link kérése"}
      </button>
      {!enabled && (
        <p className="text-center text-xs text-navy/45">A szülői fiók hamarosan indul.</p>
      )}
    </form>
  );
}
