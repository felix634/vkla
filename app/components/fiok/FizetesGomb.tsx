"use client";

import { useState } from "react";

// „Fizetés kártyával” egy konkrét számlára (csak ha a kártyás fizetés be van kapcsolva).
export default function FizetesGomb({ id }: { id: string }) {
  const [fut, setFut] = useState(false);

  async function fizetes() {
    setFut(true);
    const res = await fetch("/api/fiok/fizetes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => null);
    const adat = await res?.json().catch(() => ({}));
    if (res?.ok && adat?.url) {
      window.location.href = adat.url;
      return;
    }
    setFut(false);
    alert(adat?.error ?? "A fizetés indítása nem sikerült.");
  }

  return (
    <button
      type="button"
      onClick={fizetes}
      disabled={fut}
      className="bg-vasasRed hover:bg-vasasRedDark transition-colors text-white font-semibold px-4 py-2 rounded-md text-sm whitespace-nowrap disabled:opacity-60"
    >
      {fut ? "Átirányítás…" : "Fizetés kártyával"}
    </button>
  );
}
