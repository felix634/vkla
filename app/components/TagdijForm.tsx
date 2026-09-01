"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { KOROSZTALYOK } from "@/sanity/constants";

const inputCls =
  "w-full rounded-md border border-gray-200 px-3.5 py-2.5 text-sm text-navy placeholder:text-navy/35 focus:outline-none focus:border-royal focus:ring-2 focus:ring-royal/15 transition";
const labelCls = "block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1.5";

// Havi tagdíj-befizetés indító űrlap. Kulcsok nélkül bemutató módban fut,
// Stripe teszt-kulccsal valódi (teszt-)fizetési oldalra visz.
export default function TagdijForm({
  monthlyHuf,
  mode,
}: {
  monthlyHuf: number;
  mode: "demo" | "test" | "live";
}) {
  const params = useSearchParams();
  const fizetes = params.get("fizetes");

  const [form, setForm] = useState({ szulo: "", email: "", gyermek: "", korosztaly: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/tagdij/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Hiba történt. Próbáld újra.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Hálózati hiba. Próbáld újra.");
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-xl shadow-navy/5 p-7">
      {fizetes === "siker" && (
        <div className="mb-5 rounded-md bg-royal/10 border border-royal/30 px-4 py-3 text-sm text-royal font-semibold">
          Köszönjük! A befizetés folyamata sikeresen lezárult.
          {params.get("mod") === "demo" && " (Bemutató mód — tényleges terhelés nem történt.)"}
        </div>
      )}
      {fizetes === "megszakitva" && (
        <div className="mb-5 rounded-md bg-vasasRed/10 border border-vasasRed/30 px-4 py-3 text-sm text-vasasRed font-semibold">
          A fizetés megszakadt — nem történt terhelés. Bármikor újrapróbálhatod.
        </div>
      )}

      <div className="flex items-center justify-between gap-3 mb-1">
        <h2 className="font-display font-bold text-2xl text-navy">Havi tagdíj befizetése</h2>
        {mode !== "live" && (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-gold/15 text-gold-dark px-2 py-1 rounded-sm flex-shrink-0">
            {mode === "demo" ? "Bemutató" : "Teszt mód"}
          </span>
        )}
      </div>
      <p className="text-sm text-navy/55 mb-6">
        Havi ismétlődő bankkártyás fizetés — a megadott kártyát minden hónapban
        automatikusan terheljük, bármikor lemondható.
      </p>

      <form className="space-y-4" onSubmit={submit}>
        <div>
          <label className={labelCls}>Szülő neve</label>
          <input type="text" required value={form.szulo} onChange={set("szulo")} placeholder="Teljes név" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>E-mail</label>
          <input type="email" required value={form.email} onChange={set("email")} placeholder="szulo@email.hu" className={inputCls} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Gyermek neve</label>
            <input type="text" required value={form.gyermek} onChange={set("gyermek")} placeholder="Gyermek teljes neve" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Korosztály</label>
            <select required value={form.korosztaly} onChange={set("korosztaly")} className={inputCls}>
              <option value="">Válassz…</option>
              {KOROSZTALYOK.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-md bg-cream border border-gray-100 px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-navy/70">Havi tagdíj (minta-összeg)</span>
          <span className="font-display font-black text-xl text-navy">
            {monthlyHuf.toLocaleString("hu-HU")} Ft / hó
          </span>
        </div>

        {error && <div className="text-sm text-vasasRed font-semibold">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-vasasRed hover:bg-vasasRedDark disabled:opacity-60 transition-colors text-white font-bold py-3.5 rounded-md text-sm"
        >
          {loading ? "Átirányítás a fizetéshez…" : "Tovább a fizetéshez"}
        </button>
        <p className="text-center text-xs text-navy/45">
          {mode === "demo"
            ? "Bemutató mód: a folyamat végigjárható, tényleges fizetés nem történik."
            : mode === "test"
              ? "Teszt mód: a fizetési oldal teszt-kártyát fogad (pl. 4242 4242 4242 4242)."
              : "A fizetés biztonságos, titkosított kapcsolaton történik."}
        </p>
      </form>
    </div>
  );
}
