"use client";

import { useState } from "react";
import { Honeypot, LevelElkuldve, gombCls, inputCls, kuld, labelCls } from "./urlap";

// Elfelejtett jelszó: link az új jelszó beállításához.
export default function ElfelejtettForm({ enabled }: { enabled: boolean }) {
  const [fut, setFut] = useState(false);
  const [hiba, setHiba] = useState<string | null>(null);
  const [kesz, setKesz] = useState<string | null>(null);

  async function kuldes(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHiba(null);
    setFut(true);
    const fd = new FormData(e.currentTarget);
    const v = await kuld("/api/fiok/elfelejtett", Object.fromEntries(fd.entries()));
    setFut(false);
    if (v.ok) setKesz(String(fd.get("email")));
    else setHiba(v.error ?? "A kérés nem sikerült.");
  }

  if (kesz) {
    return (
      <LevelElkuldve
        email={kesz}
        szoveg="Ha ezzel a címmel van szülői fiók, elküldtük az új jelszó beállításához szükséges linket ide:"
      />
    );
  }

  return (
    <form className="space-y-4" onSubmit={kuldes}>
      <div>
        <label className={labelCls}>E-mail-cím</label>
        <input type="email" name="email" required autoComplete="email" className={inputCls} />
      </div>
      <Honeypot />
      {hiba && <p className="text-sm text-vasasRed font-semibold">{hiba}</p>}
      <button type="submit" disabled={!enabled || fut} className={gombCls}>
        {fut ? "Küldés…" : "Link küldése"}
      </button>
    </form>
  );
}
