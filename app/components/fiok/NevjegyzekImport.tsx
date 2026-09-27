"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TablazatHiba, mintaLetoltes, oszlop, tablazatBeolvas } from "./tablazat";

// Szülői névjegyzék feltöltése a pénzügy meglévő Excel-táblázatából: soronként
// egy gyermek és a szülők e-mail-címei. A címeket a sor bármelyik cellájából
// összegyűjtjük (egy cellában több cím is lehet), így az oszlopok elnevezése
// kötetlen. Meglévő gyermeknél csak hozzáad, semmit nem töröl.

const NEV = [
  "gyermeknev", "gyermekneve", "gyermek", "nev", "tanulo", "tanulonev", "tanuloneve", "jatekos", "jatekosneve",
  "sportolo", "sportoloneve", "vevo", "vevonev", "vevoneve", "ugyfel", "ugyfelnev", "ugyfelneve",
];
const KOROSZTALY = ["korosztaly", "csapat"];
const VEVOKOD = ["vevokod", "ugyfelkod", "azonosito"];
const EMAIL_MINTA = /[^\s@;,<>()"']+@[^\s@;,<>()"']+\.[a-z]{2,}/gi;
const KOTEG = 25;

const MINTA =
  "gyermek_neve;korosztaly;vevokod;szulo1_email;szulo2_email\r\n" +
  "Minta Bence;U12;;anya@pelda.hu;apa@pelda.hu\r\n";

type Sor = { nev: string; korosztaly: string; vevokod: string; emailek: string[] };
type Eredmeny = { allapot: "uj" | "frissitve" | "hiba"; uzenet: string };

const inputCls =
  "w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-navy placeholder:text-navy/35 focus:outline-none focus:border-royal focus:ring-2 focus:ring-royal/15 transition";
const labelCls = "block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1";

async function ment(sorok: Sor[]): Promise<Eredmeny[]> {
  try {
    const res = await fetch("/api/admin/nevjegyzek", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sorok }),
    });
    const adat = await res.json().catch(() => ({}));
    if (!res.ok) return sorok.map(() => ({ allapot: "hiba" as const, uzenet: adat.error ?? `Hiba (${res.status})` }));
    return adat.eredmenyek;
  } catch {
    return sorok.map(() => ({ allapot: "hiba" as const, uzenet: "Hálózati hiba" }));
  }
}

export default function NevjegyzekImport() {
  const router = useRouter();
  const [tabla, setTabla] = useState<string[][] | null>(null);
  const [hiba, setHiba] = useState<string | null>(null);
  const [eredmenyek, setEredmenyek] = useState<(Eredmeny | null)[] | null>(null);
  const [fut, setFut] = useState(false);
  const [egyediUzenet, setEgyediUzenet] = useState<string | null>(null);

  const sorok = useMemo<Sor[] | null>(() => {
    if (!tabla || tabla.length < 2) return null;
    const iNev = oszlop(tabla[0], NEV);
    const iKor = oszlop(tabla[0], KOROSZTALY);
    const iKod = oszlop(tabla[0], VEVOKOD);
    return tabla.slice(1).map((c) => ({
      nev: (c[iNev] ?? "").trim(),
      korosztaly: iKor >= 0 ? (c[iKor] ?? "").trim() : "",
      vevokod: iKod >= 0 ? (c[iKod] ?? "").trim() : "",
      emailek: [...new Set(c.join(" ").match(EMAIL_MINTA)?.map((e) => e.toLowerCase()) ?? [])],
    }));
  }, [tabla]);

  async function betolt(fajl: File | undefined) {
    setHiba(null);
    setEredmenyek(null);
    if (!fajl) return setTabla(null);
    try {
      const t = await tablazatBeolvas(fajl);
      if (oszlop(t[0] ?? [], NEV) < 0) {
        setTabla(null);
        return setHiba("A táblázat fejlécében nem találom a gyermek nevét tartalmazó oszlopot (pl. „Gyermek neve”). Nézd meg a mintát.");
      }
      setTabla(t);
    } catch (e) {
      setTabla(null);
      setHiba(e instanceof TablazatHiba ? e.message : "A fájl nem olvasható.");
    }
  }

  async function importal() {
    if (!sorok) return;
    setFut(true);
    const eredm: (Eredmeny | null)[] = sorok.map(() => null);
    setEredmenyek([...eredm]);
    for (let i = 0; i < sorok.length; i += KOTEG) {
      const valasz = await ment(sorok.slice(i, i + KOTEG));
      valasz.forEach((v, j) => (eredm[i + j] = v));
      setEredmenyek([...eredm]);
    }
    setFut(false);
    router.refresh();
  }

  async function egyedi(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const urlap = e.currentTarget;
    const fd = new FormData(urlap);
    const sor: Sor = {
      nev: String(fd.get("nev") ?? ""),
      korosztaly: String(fd.get("korosztaly") ?? ""),
      vevokod: String(fd.get("vevokod") ?? ""),
      emailek: [String(fd.get("email1") ?? ""), String(fd.get("email2") ?? "")].map((x) => x.trim()).filter(Boolean),
    };
    setFut(true);
    const [v] = await ment([sor]);
    setFut(false);
    setEgyediUzenet(v.uzenet);
    if (v.allapot !== "hiba") {
      urlap.reset();
      router.refresh();
    }
  }

  const osszesites = eredmenyek?.every(Boolean)
    ? {
        uj: eredmenyek.filter((e) => e?.allapot === "uj").length,
        frissitve: eredmenyek.filter((e) => e?.allapot === "frissitve").length,
        hiba: eredmenyek.filter((e) => e?.allapot === "hiba").length,
      }
    : null;
  const cimNelkul = sorok?.filter((s) => s.nev && s.emailek.length === 0).length ?? 0;

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-6 space-y-6">
      <div>
        <h2 className="font-display font-bold text-xl text-navy mb-2">Névjegyzék feltöltése</h2>
        <p className="text-sm text-navy/60">
          Soronként egy gyermek: a neve (ahogy a számlákon vevőként szerepel), és a szülők e-mail-címei
          — akárhány oszlopban, egy cellában akár több cím is lehet. Korosztály és vevőkód opcionális.
          Meglévő gyermeknél a feltöltés csak hozzáad, semmit nem töröl.{" "}
          <button type="button" onClick={() => mintaLetoltes("nevjegyzek-minta.csv", MINTA)} className="font-semibold text-royal underline">
            Minta letöltése
          </button>
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 items-end">
        <div>
          <label className={labelCls}>Táblázat (.xlsx vagy .csv)</label>
          <input type="file" accept=".xlsx,.csv,text/csv" disabled={fut} onChange={(e) => betolt(e.target.files?.[0])} className={inputCls} />
        </div>
        {sorok && !eredmenyek && (
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={importal}
              disabled={fut}
              className="bg-navy hover:bg-royal transition-colors text-white font-bold px-5 py-2.5 rounded-md text-sm disabled:opacity-60"
            >
              {sorok.length} gyermek feltöltése
            </button>
            {cimNelkul > 0 && <span className="text-sm text-gold-dark">{cimNelkul} sorban nincs e-mail-cím</span>}
          </div>
        )}
        {osszesites && (
          <div className="text-sm text-navy/70">
            <strong>Kész:</strong> {osszesites.uj} új, {osszesites.frissitve} frissítve
            {osszesites.hiba > 0 && <span className="text-vasasRed">, {osszesites.hiba} hibás sor</span>}
          </div>
        )}
      </div>
      {hiba && <p className="text-sm text-vasasRed font-semibold">{hiba}</p>}

      {sorok && (
        <div className="overflow-x-auto border border-gray-100 rounded-md max-h-96">
          <table className="w-full text-sm">
            <thead className="bg-cream text-left text-xs uppercase tracking-wider text-navy/55 sticky top-0">
              <tr>
                <th className="px-3 py-2">Gyermek</th>
                <th className="px-3 py-2">Korosztály</th>
                <th className="px-3 py-2">Vevőkód</th>
                <th className="px-3 py-2">Szülői e-mail-címek</th>
                <th className="px-3 py-2">Állapot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorok.map((s, i) => {
                const e = eredmenyek?.[i];
                return (
                  <tr key={i}>
                    <td className="px-3 py-2">{s.nev || <span className="text-vasasRed">hiányzik</span>}</td>
                    <td className="px-3 py-2">{s.korosztaly || "—"}</td>
                    <td className="px-3 py-2">{s.vevokod || "—"}</td>
                    <td className="px-3 py-2">{s.emailek.join(", ") || <span className="text-gold-dark">nincs</span>}</td>
                    <td className={`px-3 py-2 font-semibold ${!e ? "text-navy/40" : e.allapot === "hiba" ? "text-vasasRed" : "text-green-700"}`}>
                      {e ? e.uzenet : eredmenyek ? "…" : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="border-t border-gray-100 pt-6">
        <h3 className="font-display font-bold text-lg text-navy mb-3">Gyermek felvétele kézzel</h3>
        <form onSubmit={egyedi} className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
          <div className="lg:col-span-2"><label className={labelCls}>Gyermek neve *</label><input name="nev" required className={inputCls} /></div>
          <div><label className={labelCls}>Korosztály</label><input name="korosztaly" placeholder="pl. U12" className={inputCls} /></div>
          <div><label className={labelCls}>Vevőkód</label><input name="vevokod" className={inputCls} /></div>
          <div><label className={labelCls}>Szülő e-mail 1</label><input name="email1" type="email" className={inputCls} /></div>
          <div><label className={labelCls}>Szülő e-mail 2</label><input name="email2" type="email" className={inputCls} /></div>
          <div className="lg:col-span-6 flex items-center gap-4">
            <button type="submit" disabled={fut} className="bg-navy hover:bg-royal transition-colors text-white font-bold px-5 py-2.5 rounded-md text-sm disabled:opacity-60">
              Mentés
            </button>
            {egyediUzenet && <span className="text-sm text-navy/70">{egyediUzenet}</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
