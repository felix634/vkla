"use client";

import Link from "next/link";

// A szülői fiók űrlapjainak közös elemei.

export const inputCls =
  "w-full rounded-md border border-gray-200 px-3.5 py-2.5 text-sm text-navy placeholder:text-navy/35 focus:outline-none focus:border-royal focus:ring-2 focus:ring-royal/15 transition";
export const labelCls = "block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5";
export const gombCls =
  "w-full bg-navy hover:bg-royal transition-colors text-white font-bold py-3 rounded-md text-sm disabled:opacity-60 disabled:cursor-not-allowed";

export async function kuld(url: string, body: object): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const adat = await res.json().catch(() => ({}));
    return res.ok ? { ok: true } : { ok: false, error: adat.error ?? "A művelet nem sikerült." };
  } catch {
    return { ok: false, error: "Hálózati hiba — próbáld újra." };
  }
}

export function Honeypot() {
  return <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />;
}

export function LevelElkuldve({ email, szoveg }: { email: string; szoveg: string }) {
  return (
    <div className="text-center py-4">
      <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-4">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      </div>
      <div className="font-display font-bold text-xl text-navy mb-2">Nézd meg a postafiókod!</div>
      <p className="text-sm text-navy/65 leading-relaxed">
        {szoveg} <strong className="text-navy">{email}</strong>. Ha nem találod, nézd meg a
        Spam / Promóciók mappát is.
      </p>
      <Link href="/belepes" className="inline-block mt-5 text-sm font-semibold text-royal hover:text-navy underline">
        Vissza a belépéshez
      </Link>
    </div>
  );
}
