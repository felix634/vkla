"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TablazatHiba, datumNorm, idoszakNorm, mintaLetoltes, norm, oszlop, tablazatBeolvas } from "./tablazat";

// Pénzügyi feltöltő: a havi számlalista (Excel vagy CSV, a könyvelőprogram
// exportjából) + a számla-PDF-ek, vagy egyetlen számla kézzel. A számla a
// Szülői névjegyzék gyermekéhez párosul (vevőkód vagy név alapján), a levél
// a gyermekhez rendelt összes szülői címre megy. A feltöltés soronként,
// egymás után történik (így a nagy tételszám sem ütközik a kérésméret- és
// levélküldési korlátokba).

type Mezo = "szamlaszam" | "gyermek_nev" | "vevokod" | "idoszak" | "osszeg" | "kelt" | "hatarido" | "pdf";

const OSZLOPOK: Record<Mezo, string[]> = {
  szamlaszam: ["szamlaszam", "sorszam", "szamlasorszam", "bizszam", "bizonylatszam"],
  gyermek_nev: [
    "gyermeknev", "gyermekneve", "gyermek", "vevo", "vevonev", "vevoneve", "ugyfel", "ugyfelnev", "ugyfelneve",
    "nev", "jatekos", "jatekosneve", "sportolo", "sportoloneve",
  ],
  vevokod: ["vevokod", "ugyfelkod", "azonosito", "kod"],
  idoszak: ["idoszak", "honap", "targyhonap"],
  osszeg: ["osszeg", "brutto", "bruttoosszeg", "fizetendo", "tartozik"],
  kelt: ["kelt", "szamlakelte", "kiallitas", "kiallitasdatuma", "konyvel"],
  hatarido: ["hatarido", "fizetesihatarido", "esedekesseg", "esedekes"],
  pdf: ["pdf", "fajl", "fajlnev"],
};

const MINTA =
  "szamlaszam;gyermek_nev;vevokod;idoszak;osszeg;kelt;hatarido;pdf\r\n" +
  "20-26/01234;Minta Gyermek;;2026-10;15000;2026-10-15;2026-10-31;20-26_01234.pdf\r\n";

type Sor = {
  adat: Record<Exclude<Mezo, "pdf">, string>;
  pdf: File | null;
  hiba: string | null;
  allapot: "var" | "folyamatban" | "kesz" | "figyelem" | "hiba";
  uzenet?: string;
};

type Valasz = {
  ok: boolean;
  status: number;
  error?: string;
  ertesitesHiba?: string | null;
  cimzettek?: number;
};

const inputCls =
  "w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-navy placeholder:text-navy/35 focus:outline-none focus:border-royal focus:ring-2 focus:ring-royal/15 transition";
const labelCls = "block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1";

async function feltolt(adat: Sor["adat"], pdf: File, ertesites: boolean): Promise<Valasz> {
  const fd = new FormData();
  for (const [k, v] of Object.entries(adat)) fd.append(k, v);
  fd.append("pdf", pdf);
  fd.append("ertesites", ertesites ? "1" : "0");
  try {
    const res = await fetch("/api/admin/szamla", { method: "POST", body: fd });
    const valasz = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, ...valasz };
  } catch {
    return { ok: false, status: 0, error: "Hálózati hiba" };
  }
}

function eredmeny(v: Valasz, ertesites: boolean): Pick<Sor, "allapot" | "uzenet"> {
  if (!v.ok) return { allapot: "hiba", uzenet: v.error ?? `Hiba (${v.status})` };
  if (v.ertesitesHiba) return { allapot: "figyelem", uzenet: v.ertesitesHiba };
  return {
    allapot: "kesz",
    uzenet: ertesites ? `Feltöltve, levél ${v.cimzettek ?? 0} címre` : "Feltöltve",
  };
}

export default function SzamlaFeltolto({ levelEnabled }: { levelEnabled: boolean }) {
  const router = useRouter();
  const [mod, setMod] = useState<"tablazat" | "egyedi">("tablazat");
  const [ertesites, setErtesites] = useState(levelEnabled);
  const [tabla, setTabla] = useState<string[][] | null>(null);
  const [pdfek, setPdfek] = useState<File[]>([]);
  const [tablaHiba, setTablaHiba] = useState<string | null>(null);
  const [sorok, setSorok] = useState<Sor[] | null>(null);
  const [fut, setFut] = useState(false);

  // Táblázat + PDF-ek párosítása soronként.
  const elokeszitett = useMemo<Sor[] | null>(() => {
    if (!tabla || tabla.length < 2) return null;
    const index = {} as Record<Mezo, number>;
    for (const [mezo, nevek] of Object.entries(OSZLOPOK) as [Mezo, string[]][]) {
      index[mezo] = oszlop(tabla[0], nevek);
    }
    const pdfNorm = pdfek.map((f) => ({ f, n: norm(f.name.replace(/\.pdf$/i, "")) }));
    return tabla.slice(1).map((cellak) => {
      const ertek = (m: Mezo) => (index[m] >= 0 ? (cellak[index[m]] ?? "").trim() : "");
      const adat = {
        szamlaszam: ertek("szamlaszam").replace(/^!/, ""),
        gyermek_nev: ertek("gyermek_nev"),
        vevokod: ertek("vevokod"),
        idoszak: idoszakNorm(ertek("idoszak")),
        // "15.000,00 Ft" / "5.000,- Ft" / "15 000" -> "15000" (a fillér-tizedesek levágva)
        osszeg: ertek("osszeg").replace(/[,.]\d{2}\s*(Ft)?\s*$/i, "").replace(/[^\d]/g, ""),
        kelt: ertek("kelt") ? datumNorm(ertek("kelt")) : "",
        hatarido: ertek("hatarido") ? datumNorm(ertek("hatarido")) : "",
      };
      // A Machinátor listájában nincs „időszak” oszlop: ilyenkor a kelt hónapja.
      if (!adat.idoszak && /^\d{4}-\d{2}/.test(adat.kelt)) adat.idoszak = adat.kelt.slice(0, 7);
      const fajlnev = ertek("pdf");
      const pdf =
        (fajlnev && pdfNorm.find((p) => p.n === norm(fajlnev.replace(/\.pdf$/i, "")))?.f) ||
        (adat.szamlaszam && pdfNorm.find((p) => p.n.includes(norm(adat.szamlaszam)))?.f) ||
        null;
      const hianyzik = [
        !adat.szamlaszam && "számlaszám",
        !adat.gyermek_nev && !adat.vevokod && "gyermek",
        !adat.osszeg && "összeg",
        !pdf && "PDF",
      ].filter(Boolean);
      return {
        adat,
        pdf,
        hiba: hianyzik.length ? `Hiányzik: ${hianyzik.join(", ")}` : null,
        allapot: "var" as const,
      };
    });
  }, [tabla, pdfek]);

  const lista = sorok ?? elokeszitett;
  const joSorok = lista?.filter((s) => !s.hiba).length ?? 0;
  const kesz = lista?.filter((s) => s.allapot !== "var" && s.allapot !== "folyamatban" && !s.hiba).length ?? 0;

  async function tablaBetolt(fajl: File | undefined) {
    setTablaHiba(null);
    setSorok(null);
    if (!fajl) return setTabla(null);
    try {
      const t = await tablazatBeolvas(fajl);
      const hianyzo = [
        oszlop(t[0] ?? [], OSZLOPOK.szamlaszam) < 0 && "számlaszám",
        oszlop(t[0] ?? [], OSZLOPOK.gyermek_nev) < 0 && oszlop(t[0] ?? [], OSZLOPOK.vevokod) < 0 && "gyermek neve vagy vevőkód",
        oszlop(t[0] ?? [], OSZLOPOK.osszeg) < 0 && "összeg",
      ].filter(Boolean);
      if (hianyzo.length) {
        setTabla(null);
        return setTablaHiba(`A táblázat fejlécéből hiányzik: ${hianyzo.join(", ")}. Nézd meg a mintát.`);
      }
      setTabla(t);
    } catch (e) {
      setTabla(null);
      setTablaHiba(e instanceof TablazatHiba ? e.message : "A fájl nem olvasható.");
    }
  }

  async function inditas() {
    if (!elokeszitett) return;
    const munka: Sor[] = elokeszitett.map((s) => ({ ...s }));
    setSorok(munka);
    setFut(true);
    for (const s of munka) {
      if (s.hiba || !s.pdf) {
        s.allapot = "hiba";
        s.uzenet = s.hiba ?? "Hiányzik a PDF";
        setSorok([...munka]);
        continue;
      }
      s.allapot = "folyamatban";
      setSorok([...munka]);
      Object.assign(s, eredmeny(await feltolt(s.adat, s.pdf, ertesites), ertesites));
      setSorok([...munka]);
    }
    setFut(false);
    router.refresh();
  }

  async function egyedi(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const urlap = e.currentTarget;
    const fd = new FormData(urlap);
    const pdf = fd.get("pdf") as File | null;
    if (!pdf || !pdf.size) return;
    const adat = {
      szamlaszam: String(fd.get("szamlaszam") ?? ""),
      gyermek_nev: String(fd.get("gyermek_nev") ?? ""),
      vevokod: String(fd.get("vevokod") ?? ""),
      idoszak: String(fd.get("idoszak") ?? ""),
      osszeg: String(fd.get("osszeg") ?? ""),
      kelt: String(fd.get("kelt") ?? ""),
      hatarido: String(fd.get("hatarido") ?? ""),
    };
    const sor: Sor = { adat, pdf, hiba: null, allapot: "folyamatban" };
    setSorok([sor]);
    setFut(true);
    const v = await feltolt(adat, pdf, ertesites);
    setSorok([{ ...sor, ...eredmeny(v, ertesites) }]);
    setFut(false);
    if (v.ok) urlap.reset();
    router.refresh();
  }

  const allapotSzin: Record<Sor["allapot"], string> = {
    var: "text-navy/50",
    folyamatban: "text-royal",
    kesz: "text-green-700",
    figyelem: "text-gold-dark",
    hiba: "text-vasasRed",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-display font-bold text-xl text-navy">Számlák feltöltése</h2>
        <div className="flex rounded-md border border-gray-200 overflow-hidden text-sm font-semibold">
          {(["tablazat", "egyedi"] as const).map((m) => (
            <button
              key={m}
              type="button"
              disabled={fut}
              onClick={() => { setMod(m); setSorok(null); }}
              className={`px-4 py-2 ${mod === m ? "bg-navy text-white" : "text-navy/70 hover:bg-cream"}`}
            >
              {m === "tablazat" ? "Több számla (Excel / CSV)" : "Egy számla"}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-start gap-2.5 text-sm text-navy/70 mb-5 cursor-pointer">
        <input
          type="checkbox"
          checked={ertesites}
          disabled={!levelEnabled || fut}
          onChange={(e) => setErtesites(e.target.checked)}
          className="mt-0.5 accent-[#123274]"
        />
        <span>
          Értesítő e-mail a gyermekhez rendelt szülőknek, a számla PDF-jével csatolva
          {!levelEnabled && <span className="text-vasasRed"> (az e-mail-küldés nincs bekapcsolva)</span>}
        </span>
      </label>

      {mod === "tablazat" ? (
        <div className="space-y-4">
          <p className="text-sm text-navy/60">
            A táblázat soronként egy számla (a könyvelőprogram exportjából, Excel vagy CSV). Kötelező
            oszlopok: <strong>számlaszám, gyermek neve (vagy vevőkód), összeg</strong>. A számla a
            Szülői névjegyzék gyermekéhez párosul; a PDF-et a <em>pdf</em> oszlopban megadott fájlnév,
            vagy ennek hiányában a fájlnévben szereplő számlaszám alapján találjuk meg.{" "}
            <button type="button" onClick={() => mintaLetoltes("szamlak-minta.csv", MINTA)} className="font-semibold text-royal underline">
              Minta letöltése
            </button>
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>1. Számlalista (.xlsx vagy .csv)</label>
              <input type="file" accept=".xlsx,.csv,text/csv" disabled={fut} onChange={(e) => tablaBetolt(e.target.files?.[0])} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>2. Számla-PDF-ek (több is kijelölhető)</label>
              <input
                type="file"
                accept="application/pdf,.pdf"
                multiple
                disabled={fut}
                onChange={(e) => { setPdfek([...(e.target.files ?? [])]); setSorok(null); }}
                className={inputCls}
              />
            </div>
          </div>
          {tablaHiba && <p className="text-sm text-vasasRed font-semibold">{tablaHiba}</p>}
          {elokeszitett && !sorok && (
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={inditas}
                disabled={fut || joSorok === 0}
                className="bg-navy hover:bg-royal transition-colors text-white font-bold px-5 py-2.5 rounded-md text-sm disabled:opacity-60"
              >
                {joSorok} számla feltöltése
              </button>
              <span className="text-sm text-navy/55">
                {elokeszitett.length} sor · {pdfek.length} PDF · {elokeszitett.length - joSorok} hibás sor kimarad
              </span>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={egyedi} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><label className={labelCls}>Számlaszám *</label><input name="szamlaszam" required className={inputCls} /></div>
          <div><label className={labelCls}>Gyermek neve *</label><input name="gyermek_nev" required placeholder="ahogy a névjegyzékben szerepel" className={inputCls} /></div>
          <div><label className={labelCls}>Összeg (Ft) *</label><input name="osszeg" inputMode="numeric" required className={inputCls} /></div>
          <div><label className={labelCls}>Vevőkód</label><input name="vevokod" placeholder="ha van" className={inputCls} /></div>
          <div><label className={labelCls}>Időszak</label><input name="idoszak" type="month" className={inputCls} /></div>
          <div><label className={labelCls}>Kelt</label><input name="kelt" type="date" className={inputCls} /></div>
          <div><label className={labelCls}>Fizetési határidő</label><input name="hatarido" type="date" className={inputCls} /></div>
          <div className="sm:col-span-2 lg:col-span-1"><label className={labelCls}>Számla PDF *</label><input name="pdf" type="file" accept="application/pdf,.pdf" required className={inputCls} /></div>
          <div className="flex items-end">
            <button type="submit" disabled={fut} className="w-full bg-navy hover:bg-royal transition-colors text-white font-bold py-2.5 rounded-md text-sm disabled:opacity-60">
              {fut ? "Feltöltés…" : "Feltöltés"}
            </button>
          </div>
        </form>
      )}

      {lista && lista.length > 0 && (mod === "tablazat" || sorok) && (
        <div className="mt-6">
          {sorok && mod === "tablazat" && (
            <div className="mb-3">
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-royal transition-all" style={{ width: `${(kesz / Math.max(joSorok, 1)) * 100}%` }} />
              </div>
              <div className="text-xs text-navy/55 mt-1">{kesz} / {joSorok} feldolgozva{fut ? "…" : ""}</div>
            </div>
          )}
          <div className="overflow-x-auto border border-gray-100 rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wider text-navy/55">
                <tr>
                  <th className="px-3 py-2">Számlaszám</th>
                  <th className="px-3 py-2">Gyermek</th>
                  <th className="px-3 py-2">Időszak</th>
                  <th className="px-3 py-2 text-right">Összeg</th>
                  <th className="px-3 py-2">PDF</th>
                  <th className="px-3 py-2">Állapot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lista.map((s, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 whitespace-nowrap">{s.adat.szamlaszam || "—"}</td>
                    <td className="px-3 py-2">{s.adat.gyermek_nev || s.adat.vevokod || "—"}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{s.adat.idoszak || "—"}</td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">{s.adat.osszeg ? `${s.adat.osszeg.replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ft` : "—"}</td>
                    <td className="px-3 py-2 max-w-[160px] truncate">{s.pdf?.name ?? "—"}</td>
                    <td className={`px-3 py-2 font-semibold ${s.hiba ? "text-vasasRed" : allapotSzin[s.allapot]}`}>
                      {s.uzenet ?? s.hiba ?? (s.allapot === "var" ? "Kész a feltöltésre" : "…")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
