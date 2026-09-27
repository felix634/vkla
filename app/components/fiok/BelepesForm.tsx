"use client";

import { useState } from "react";
import Link from "next/link";
import { gombCls, inputCls, kuld, labelCls } from "./urlap";

// Belépés a szülői fiókba e-mail-címmel és jelszóval.
export default function BelepesForm({ enabled }: { enabled: boolean }) {
  const [fut, setFut] = useState(false);
  const [hiba, setHiba] = useState<string | null>(null);

  async function belepes(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHiba(null);
    setFut(true);
    const fd = new FormData(e.currentTarget);
    const v = await kuld("/api/fiok/belepes", { email: fd.get("email"), jelszo: fd.get("jelszo") });
    if (v.ok) {
      window.location.href = "/fiok";
      return;
    }
    setFut(false);
    setHiba(v.error ?? "A belépés nem sikerült.");
  }

  return (
    <form className="space-y-4" onSubmit={belepes}>
      <div>
        <label className={labelCls}>E-mail-cím</label>
        <input type="email" name="email" required autoComplete="email" className={inputCls} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelCls.replace(" mb-1.5", "")}>Jelszó</label>
          <Link href="/elfelejtett-jelszo" className="text-xs font-semibold text-royal hover:text-navy">
            Elfelejtett jelszó?
          </Link>
        </div>
        <input type="password" name="jelszo" required autoComplete="current-password" className={inputCls} />
      </div>
      {hiba && <p className="text-sm text-vasasRed font-semibold">{hiba}</p>}
      <button type="submit" disabled={!enabled || fut} className={gombCls}>
        {fut ? "Belépés…" : "Belépés"}
      </button>
      {!enabled ? (
        <p className="text-center text-xs text-navy/45">A szülői fiók hamarosan indul.</p>
      ) : (
        <p className="text-center text-sm text-navy/60">
          Még nincs fiókod?{" "}
          <Link href="/regisztracio" className="font-semibold text-royal hover:text-navy underline">
            Regisztrálj
          </Link>
        </p>
      )}
    </form>
  );
}
