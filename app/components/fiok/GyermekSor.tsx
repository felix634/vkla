"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// A Szülői névjegyzék egy sora: a gyermek szülői e-mail-címei (hozzáadás,
// eltávolítás), és a gyermek törlése (csak ha még nincs számlája).
export default function GyermekSor({
  id,
  nev,
  emailek,
}: {
  id: string;
  nev: string;
  emailek: { email: string; regisztralt: boolean }[];
}) {
  const router = useRouter();
  const [uj, setUj] = useState("");
  const [fut, setFut] = useState(false);

  async function hivas(method: "PATCH" | "DELETE", body?: object) {
    setFut(true);
    const res = await fetch(`/api/admin/nevjegyzek/${id}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    }).catch(() => null);
    setFut(false);
    if (!res?.ok) {
      const adat = await res?.json().catch(() => ({}));
      alert(adat?.error ?? "A művelet nem sikerült.");
      return false;
    }
    router.refresh();
    return true;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {emailek.map((e) => (
        <span
          key={e.email}
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${
            e.regisztralt ? "border-green-200 bg-green-50 text-green-800" : "border-gray-200 bg-cream text-navy/70"
          }`}
          title={e.regisztralt ? "Van szülői fiókja" : "Még nem regisztrált"}
        >
          {e.regisztralt && "✓ "}
          {e.email}
          <button
            type="button"
            disabled={fut}
            onClick={() => confirm(`Eltávolítod a(z) ${e.email} címet ${nev} mellől? Ez a szülő ezután nem látja a gyermek számláit.`) && hivas("PATCH", { muvelet: "email_torol", email: e.email })}
            className="ml-0.5 text-navy/40 hover:text-vasasRed"
            aria-label={`${e.email} eltávolítása`}
          >
            ×
          </button>
        </span>
      ))}
      <form
        onSubmit={async (ev) => {
          ev.preventDefault();
          if (uj.trim() && (await hivas("PATCH", { muvelet: "email_hozzaad", email: uj }))) setUj("");
        }}
        className="inline-flex"
      >
        <input
          type="email"
          value={uj}
          onChange={(ev) => setUj(ev.target.value)}
          placeholder="+ e-mail-cím"
          disabled={fut}
          className="w-44 rounded-full border border-dashed border-gray-300 px-2.5 py-1 text-xs text-navy focus:outline-none focus:border-royal"
        />
      </form>
      <button
        type="button"
        disabled={fut}
        onClick={() => confirm(`Törlöd ${nev} gyermeket a névjegyzékből?`) && hivas("DELETE")}
        className="ml-auto text-xs font-semibold text-vasasRed/70 hover:text-vasasRed"
      >
        Törlés
      </button>
    </div>
  );
}
