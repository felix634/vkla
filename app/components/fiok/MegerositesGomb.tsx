"use client";

import { useState } from "react";
import Link from "next/link";

// A levélben kapott link beváltása egy gombnyomással (a levelezők
// link-ellenőrzői így nem „használják el” a linket).
export default function MegerositesGomb({ token }: { token: string }) {
  const [kuldes, setKuldes] = useState(false);
  const [hiba, setHiba] = useState<string | null>(null);

  async function belepes() {
    setKuldes(true);
    setHiba(null);
    try {
      const res = await fetch("/api/fiok/megerosites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ t: token }),
      });
      const adat = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(adat.error ?? "A belépés nem sikerült.");
      window.location.href = "/fiok";
    } catch (err) {
      setKuldes(false);
      setHiba(err instanceof Error ? err.message : "A belépés nem sikerült.");
    }
  }

  return (
    <div className="text-center">
      <button
        type="button"
        onClick={belepes}
        disabled={kuldes}
        className="w-full bg-navy hover:bg-royal transition-colors text-white font-bold py-3 rounded-md text-sm disabled:opacity-60"
      >
        {kuldes ? "Belépés…" : "Belépés a fiókba"}
      </button>
      {hiba && (
        <div className="mt-4">
          <p className="text-sm text-vasasRed font-semibold mb-2">{hiba}</p>
          <Link href="/belepes" className="text-sm font-semibold text-royal hover:text-navy underline">
            Új belépési link kérése
          </Link>
        </div>
      )}
    </div>
  );
}
