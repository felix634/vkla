"use client";

import { useState } from "react";

// Kattintásra töltődő Google-térkép (mint a YouTubeEmbed): amíg a látogató nem
// kéri, a Google-tól semmi nem töltődik be (nincs külső süti, gyors az oldal).
// Mellette mindig ott az útvonaltervezés linkje.
export default function TerkepBetolto({ nev, cim, minH = "min-h-[340px]" }: { nev: string; cim: string; minH?: string }) {
  const [betoltve, setBetoltve] = useState(false);
  // A név is a keresésbe kerül: a Fáy utcai stadion és sportcentrum címe azonos.
  const q = encodeURIComponent(`${nev}, ${cim}`);

  if (betoltve) {
    return (
      <div className={`rounded-lg overflow-hidden border border-gray-100 relative ${minH}`}>
        <iframe
          src={`https://www.google.com/maps?q=${q}&hl=hu&output=embed`}
          title={`${nev} — térkép`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden border border-gray-100 bg-navy relative ${minH} flex items-center justify-center`}>
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-br from-navy-dark/60 to-royal/30" />
      <div className="relative text-center text-white/80 px-6 py-8">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="mx-auto mb-3 text-gold">
          <path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10z" />
          <circle cx="12" cy="11" r="2" />
        </svg>
        <div className="font-display font-bold text-lg text-white">{nev}</div>
        <div className="text-sm text-white/60 mt-1">{cim}</div>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setBetoltve(true)}
            className="bg-gold hover:bg-gold-dark transition-colors text-navy font-bold px-4 py-2 rounded-md text-sm"
          >
            Térkép megjelenítése
          </button>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${q}`}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white/25 hover:bg-white/10 transition-colors text-white font-semibold px-4 py-2 rounded-md text-sm"
          >
            Útvonaltervezés ↗
          </a>
        </div>
        <div className="text-[11px] text-white/40 mt-3">A térkép a Google Térképről töltődik be.</div>
      </div>
    </div>
  );
}
