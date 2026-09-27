"use client";

import { useState } from "react";
import Link from "next/link";
import { gombCls, inputCls, kuld, labelCls } from "./urlap";

// Jelszó beállítása a levélben kapott linkkel (regisztráció és elfelejtett
// jelszó). Siker esetén a szülő be is lép.
export default function JelszoForm({ token, min }: { token: string; min: number }) {
  const [fut, setFut] = useState(false);
  const [hiba, setHiba] = useState<string | null>(null);

  async function mentes(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHiba(null);
    const fd = new FormData(e.currentTarget);
    const jelszo = String(fd.get("jelszo") ?? "");
    if (jelszo !== String(fd.get("jelszo2") ?? "")) return setHiba("A két jelszó nem egyezik.");
    setFut(true);
    const v = await kuld("/api/fiok/jelszo", { t: token, jelszo });
    if (v.ok) {
      window.location.href = "/fiok";
      return;
    }
    setFut(false);
    setHiba(v.error ?? "A jelszó mentése nem sikerült.");
  }

  return (
    <form className="space-y-4" onSubmit={mentes}>
      <div>
        <label className={labelCls}>Új jelszó</label>
        <input type="password" name="jelszo" required minLength={min} autoComplete="new-password" className={inputCls} />
        <p className="text-xs text-navy/45 mt-1">Legalább {min} karakter.</p>
      </div>
      <div>
        <label className={labelCls}>Új jelszó még egyszer</label>
        <input type="password" name="jelszo2" required minLength={min} autoComplete="new-password" className={inputCls} />
      </div>
      {hiba && (
        <p className="text-sm text-vasasRed font-semibold">
          {hiba}{" "}
          {hiba.includes("lejárt") && (
            <Link href="/elfelejtett-jelszo" className="underline">
              Új link kérése
            </Link>
          )}
        </p>
      )}
      <button type="submit" disabled={fut} className={gombCls}>
        {fut ? "Mentés…" : "Jelszó mentése és belépés"}
      </button>
    </form>
  );
}
