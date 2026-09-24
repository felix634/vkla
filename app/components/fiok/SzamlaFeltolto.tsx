"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// Pénzügyi feltöltő: egy CSV (a könyvelőprogram exportjából) + a számla-PDF-ek,
// vagy egyetlen számla kézzel. A feltöltés soronként, egymás után történik
// (így a nagy tételszám sem ütközik a kérésméret- és levélküldési korlátokba).

type Mezo =
  | "szamlaszam" | "email" | "vevo_nev" | "gyermek_nev" | "korosztaly"
  | "idoszak" | "osszeg" | "kelt" | "hatarido" | "pdf";

const OSZLOPOK: Record<Mezo, string[]> = {
  szamlaszam: ["szamlaszam", "sorszam", "szamlasorszam"],
  email: ["email", "emailcim"],
  vevo_nev: ["vevonev", "vevoneve", "vevo", "szulonev", "szuloneve", "szulo", "nev"],
  gyermek_nev: ["gyermeknev", "gyermekneve", "gyermek", "jatekos", "jatekosneve", "sportolo", "sportoloneve"],
  korosztaly: ["korosztaly"],
  idoszak: ["idoszak", "honap", "targyhonap"],
  osszeg: ["osszeg", "brutto", "bruttoosszeg", "fizetendo"],
  kelt: ["kelt", "szamlakelte", "kiallitas", "kiallitasdatuma"],
  hatarido: ["hatarido", "fizetesihatarido", "esedekesseg"],
  pdf: ["pdf", "fajl", "fajlnev"],
};

const MINTA =
  "szamlaszam;email;vevo_nev;gyermek_nev;korosztaly;idoszak;osszeg;kelt;hatarido;pdf\r\n" +
  "VKLA-2026-0001;szulo@pelda.hu;Minta Szülő;Minta Gyermek;U12;2026-10;15000;2026-10-15;2026-10-31;VKLA-2026-0001.pdf\r\n";

const HONAPOK = ["januar", "februar", "marcius", "aprilis", "majus", "junius", "julius", "augusztus", "szeptember", "oktober", "november", "december"];

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

function dekodol(buf: ArrayBuffer): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buf).replace(/^﻿/, "");
  } catch {
    // A magyar Excel CSV-exportja jellemzően Windows-1250 kódolású.
    return new TextDecoder("windows-1250").decode(buf);
  }
}

function csvParse(text: string): string[][] {
  const elso = text.split(/\r?\n/, 1)[0] ?? "";
  const sep = (elso.match(/;/g)?.length ?? 0) >= (elso.match(/,/g)?.length ?? 0) ? ";" : ",";
  const sorok: string[][] = [];
  let sor: string[] = [];
  let cella = "";
  let idezet = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (idezet) {
      if (c === '"') {
        if (text[i + 1] === '"') { cella += '"'; i++; } else idezet = false;
      } else cella += c;
    } else if (c === '"') idezet = true;
    else if (c === sep) { sor.push(cella); cella = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      sor.push(cella); sorok.push(sor); sor = []; cella = "";
    } else cella += c;
  }
  if (cella || sor.length) { sor.push(cella); sorok.push(sor); }
  return sorok.filter((s) => s.some((c) => c.trim()));
}

// "2026.10.15." / "2026. 10. 15" / "2026-10-15" / "2026/10/15" -> "2026-10-15"
function datumNorm(s: string): string {
  const m = /^(\d{4})[.\-/]\s*(\d{1,2})[.\-/]\s*(\d{1,2})\.?$/.exec(s.trim());
  return m ? `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` : s.trim();
}

// "2026.10" / "2026. október" / "2026-10" -> "2026-10"; más szöveg változatlan.
function idoszakNorm(s: string): string {
  const t = s.trim();
  const szam = /^(\d{4})[.\-/]\s*(\d{1,2})\.?$/.exec(t);
  if (szam) return `${szam[1]}-${szam[2].padStart(2, "0")}`;
  const nev = /^(\d{4})\.?\s*(\p{L}+)/u.exec(t);
  if (nev) {
    const h = HONAPOK.indexOf(norm(nev[2]));
    if (h >= 0) return `${nev[1]}-${String(h + 1).padStart(2, "0")}`;
  }
  return t;
}

type Sor = {
  adat: Record<Exclude<Mezo, "pdf">, string>;
  pdf: File | null;
  hiba: string | null;
  allapot: "var" | "folyamatban" | "kesz" | "figyelem" | "hiba";
  uzenet?: string;
};

const inputCls =
  "w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-navy placeholder:text-navy/35 focus:outline-none focus:border-royal focus:ring-2 focus:ring-royal/15 transition";
const labelCls = "block text-xs font-semibold text-navy/60 uppercase tracking-wider mb-1";

async function feltolt(adat: Sor["adat"], pdf: File, ertesites: boolean) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(adat)) fd.append(k, v);
  fd.append("pdf", pdf);
  fd.append("ertesites", ertesites ? "1" : "0");
  const res = await fetch("/api/admin/szamla", { method: "POST", body: fd });
  const valasz = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, ...valasz } as {
    ok: boolean; status: number; error?: string; ertesitesHiba?: string | null;
  };
}

export default function SzamlaFeltolto({ levelEnabled }: { levelEnabled: boolean }) {
  const router = useRouter();
  const [mod, setMod] = useState<"csv" | "egyedi">("csv");
  const [ertesites, setErtesites] = useState(levelEnabled);
  const [csvSorok, setCsvSorok] = useState<string[][] | null>(null);
  const [pdfek, setPdfek] = useState<File[]>([]);
  const [csvHiba, setCsvHiba] = useState<string | null>(null);
  const [sorok, setSorok] = useState<Sor[] | null>(null);
  const [fut, setFut] = useState(false);

  // CSV + PDF-ek párosítása soronként.
  const elokeszitett = useMemo<Sor[] | null>(() => {
    if (!csvSorok || csvSorok.length < 2) return null;
    const fejlec = csvSorok[0].map(norm);
    const index = {} as Record<Mezo, number>;
    for (const [mezo, nevek] of Object.entries(OSZLOPOK) as [Mezo, string[]][]) {
      index[mezo] = fejlec.findIndex((f) => nevek.includes(f));
    }
    const pdfNorm = pdfek.map((f) => ({ f, n: norm(f.name.replace(/\.pdf$/i, "")) }));
    return csvSorok.slice(1).map((cellak) => {
      const ertek = (m: Mezo) => (index[m] >= 0 ? (cellak[index[m]] ?? "").trim() : "");
      const adat = {
        szamlaszam: ertek("szamlaszam"),
        email: ertek("email"),
        vevo_nev: ertek("vevo_nev"),
        gyermek_nev: ertek("gyermek_nev"),
        korosztaly: ertek("korosztaly"),
        idoszak: idoszakNorm(ertek("idoszak")),
        osszeg: ertek("osszeg").replace(/[^\d]/g, ""),
        kelt: ertek("kelt") ? datumNorm(ertek("kelt")) : "",
        hatarido: ertek("hatarido") ? datumNorm(ertek("hatarido")) : "",
      };
      const fajlnev = ertek("pdf");
      const pdf =
        (fajlnev && pdfNorm.find((p) => p.n === norm(fajlnev.replace(/\.pdf$/i, "")))?.f) ||
        (adat.szamlaszam && pdfNorm.find((p) => p.n.includes(norm(adat.szamlaszam)))?.f) ||
        null;
      const hianyzik = [
        !adat.szamlaszam && "számlaszám",
        !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adat.email) && "e-mail",
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
  }, [csvSorok, pdfek]);

  const lista = sorok ?? elokeszitett;
  const joSorok = lista?.filter((s) => !s.hiba).length ?? 0;
  const kesz = lista?.filter((s) => s.allapot === "kesz" || s.allapot === "figyelem").length ?? 0;

  async function csvBetolt(fajl: File | undefined) {
    setCsvHiba(null);
    setSorok(null);
    if (!fajl) return setCsvSorok(null);
    const sorokCsv = csvParse(dekodol(await fajl.arrayBuffer()));
    const fejlec = (sorokCsv[0] ?? []).map(norm);
    const kotelezo: Mezo[] = ["szamlaszam", "email", "osszeg"];
    const hianyzo = kotelezo.filter((m) => !fejlec.some((f) => OSZLOPOK[m].includes(f)));
    if (hianyzo.length) {
      setCsvSorok(null);
      return setCsvHiba(`A CSV fejlécéből hiányzik: ${hianyzo.join(", ")}. Nézd meg a mintát.`);
    }
    setCsvSorok(sorokCsv);
  }

  async function inditas() {
    if (!elokeszitett) return;
    const munka: Sor[] = elokeszitett.map((s) => ({ ...s }));
    setSorok(munka);
    setFut(true);
    for (let i = 0; i < munka.length; i++) {
      const s = munka[i];
      if (s.hiba || !s.pdf) {
        s.allapot = "hiba";
        s.uzenet = s.hiba ?? "Hiányzik a PDF";
        setSorok([...munka]);
        continue;
      }
      s.allapot = "folyamatban";
      setSorok([...munka]);
      try {
        const v = await feltolt(s.adat, s.pdf, ertesites);
        if (!v.ok) {
          s.allapot = "hiba";
          s.uzenet = v.error ?? `Hiba (${v.status})`;
        } else if (v.ertesitesHiba) {
          s.allapot = "figyelem";
          s.uzenet = v.ertesitesHiba;
        } else {
          s.allapot = "kesz";
          s.uzenet = ertesites ? "Feltöltve, levél elküldve" : "Feltöltve";
        }
      } catch {
        s.allapot = "hiba";
        s.uzenet = "Hálózati hiba";
      }
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
      email: String(fd.get("email") ?? ""),
      vevo_nev: String(fd.get("vevo_nev") ?? ""),
      gyermek_nev: String(fd.get("gyermek_nev") ?? ""),
      korosztaly: String(fd.get("korosztaly") ?? ""),
      idoszak: String(fd.get("idoszak") ?? ""),
      osszeg: String(fd.get("osszeg") ?? ""),
      kelt: String(fd.get("kelt") ?? ""),
      hatarido: String(fd.get("hatarido") ?? ""),
    };
    const sor: Sor = { adat, pdf, hiba: null, allapot: "folyamatban" };
    setSorok([sor]);
    setFut(true);
    let v: Awaited<ReturnType<typeof feltolt>>;
    try {
      v = await feltolt(adat, pdf, ertesites);
    } catch {
      v = { ok: false, status: 0, error: "Hálózati hiba" };
    }
    sor.allapot = !v.ok ? "hiba" : v.ertesitesHiba ? "figyelem" : "kesz";
    sor.uzenet = !v.ok
      ? v.error ?? "Hiba"
      : v.ertesitesHiba ?? (ertesites ? "Feltöltve, levél elküldve" : "Feltöltve");
    setSorok([{ ...sor }]);
    setFut(false);
    if (v.ok) urlap.reset();
    router.refresh();
  }

  function mintaLetoltes() {
    const url = URL.createObjectURL(new Blob(["﻿" + MINTA], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "szamlak-minta.csv";
    a.click();
    URL.revokeObjectURL(url);
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
          {(["csv", "egyedi"] as const).map((m) => (
            <button
              key={m}
              type="button"
              disabled={fut}
              onClick={() => { setMod(m); setSorok(null); }}
              className={`px-4 py-2 ${mod === m ? "bg-navy text-white" : "text-navy/70 hover:bg-cream"}`}
            >
              {m === "csv" ? "Több számla (CSV)" : "Egy számla"}
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
          Értesítő e-mail a szülőknek, a számla PDF-jével csatolva
          {!levelEnabled && <span className="text-vasasRed"> (az e-mail-küldés nincs bekapcsolva)</span>}
        </span>
      </label>

      {mod === "csv" ? (
        <div className="space-y-4">
          <p className="text-sm text-navy/60">
            A CSV soronként egy számla (a könyvelőprogram exportjából, pontosvesszővel vagy
            vesszővel tagolva). Kötelező oszlopok: <strong>szamlaszam, email, osszeg</strong>; a
            PDF-et a <em>pdf</em> oszlopban megadott fájlnév, vagy ennek hiányában a fájlnévben
            szereplő számlaszám alapján párosítjuk.{" "}
            <button type="button" onClick={mintaLetoltes} className="font-semibold text-royal underline">
              Minta CSV letöltése
            </button>
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>1. CSV-fájl</label>
              <input type="file" accept=".csv,text/csv" disabled={fut} onChange={(e) => csvBetolt(e.target.files?.[0])} className={inputCls} />
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
          {csvHiba && <p className="text-sm text-vasasRed font-semibold">{csvHiba}</p>}
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
          <div><label className={labelCls}>Szülő e-mail-címe *</label><input name="email" type="email" required className={inputCls} /></div>
          <div><label className={labelCls}>Összeg (Ft) *</label><input name="osszeg" inputMode="numeric" required className={inputCls} /></div>
          <div><label className={labelCls}>Vevő (szülő) neve</label><input name="vevo_nev" className={inputCls} /></div>
          <div><label className={labelCls}>Gyermek neve</label><input name="gyermek_nev" className={inputCls} /></div>
          <div><label className={labelCls}>Korosztály</label><input name="korosztaly" placeholder="pl. U12" className={inputCls} /></div>
          <div><label className={labelCls}>Időszak</label><input name="idoszak" type="month" className={inputCls} /></div>
          <div><label className={labelCls}>Kelt</label><input name="kelt" type="date" className={inputCls} /></div>
          <div><label className={labelCls}>Fizetési határidő</label><input name="hatarido" type="date" className={inputCls} /></div>
          <div className="sm:col-span-2"><label className={labelCls}>Számla PDF *</label><input name="pdf" type="file" accept="application/pdf,.pdf" required className={inputCls} /></div>
          <div className="flex items-end">
            <button type="submit" disabled={fut} className="w-full bg-navy hover:bg-royal transition-colors text-white font-bold py-2.5 rounded-md text-sm disabled:opacity-60">
              {fut ? "Feltöltés…" : "Feltöltés"}
            </button>
          </div>
        </form>
      )}

      {lista && lista.length > 0 && (mod === "csv" || sorok) && (
        <div className="mt-6">
          {sorok && mod === "csv" && (
            <div className="mb-3">
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-royal transition-all" style={{ width: `${(kesz / Math.max(joSorok, 1)) * 100}%` }} />
              </div>
              <div className="text-xs text-navy/55 mt-1">{kesz} / {joSorok} feltöltve{fut ? "…" : ""}</div>
            </div>
          )}
          <div className="overflow-x-auto border border-gray-100 rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wider text-navy/55">
                <tr>
                  <th className="px-3 py-2">Számlaszám</th>
                  <th className="px-3 py-2">E-mail</th>
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
                    <td className="px-3 py-2">{s.adat.email || "—"}</td>
                    <td className="px-3 py-2">{[s.adat.gyermek_nev, s.adat.korosztaly].filter(Boolean).join(" · ") || "—"}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{s.adat.idoszak || "—"}</td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">{s.adat.osszeg ? `${Number(s.adat.osszeg).toLocaleString("hu-HU")} Ft` : "—"}</td>
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
