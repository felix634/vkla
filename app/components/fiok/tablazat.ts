// Táblázat-beolvasás a pénzügyi felülethez: .xlsx (Excel) és .csv. Minden
// cella szövegként jön vissza; a dátumcellák ÉÉÉÉ-HH-NN formában.

// Fejléc-összevetéshez: ékezet, kis-/nagybetű, szóköz és írásjel nem számít.
export const norm = (s: string) =>
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
  return sorok;
}

function cellaSzoveg(v: unknown): string {
  if (v == null) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).trim();
}

export class TablazatHiba extends Error {}

export async function tablazatBeolvas(fajl: File): Promise<string[][]> {
  const nev = fajl.name.toLowerCase();
  let sorok: string[][];
  if (nev.endsWith(".xlsx")) {
    const { readSheet } = await import("read-excel-file/universal");
    const adat = (await readSheet(fajl)) as unknown[][];
    sorok = adat.map((sor) => sor.map(cellaSzoveg));
  } else if (nev.endsWith(".xls")) {
    throw new TablazatHiba("A régi .xls formátum nem olvasható — mentsd el .xlsx-ként vagy CSV-ként.");
  } else {
    sorok = csvParse(dekodol(await fajl.arrayBuffer())).map((sor) => sor.map((c) => c.trim()));
  }
  return sorok.filter((s) => s.some((c) => c));
}

// Oszlop keresése a fejlécben a lehetséges (normalizált) nevek alapján.
export function oszlop(fejlec: string[], nevek: string[]): number {
  const n = fejlec.map(norm);
  return n.findIndex((f) => nevek.includes(f));
}

// "2026.10.15." / "2026. 10. 15" / "2026-10-15" / "2026/10/15" -> "2026-10-15"
export function datumNorm(s: string): string {
  const m = /^(\d{4})[.\-/]\s*(\d{1,2})[.\-/]\s*(\d{1,2})\.?$/.exec(s.trim());
  return m ? `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` : s.trim();
}

const HONAPOK = ["januar", "februar", "marcius", "aprilis", "majus", "junius", "julius", "augusztus", "szeptember", "oktober", "november", "december"];

// "2026.10" / "2026. október" / "2026-10" -> "2026-10"; más szöveg változatlan.
export function idoszakNorm(s: string): string {
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

export function mintaLetoltes(fajlnev: string, tartalom: string) {
  const url = URL.createObjectURL(new Blob(["﻿" + tartalom], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = fajlnev;
  a.click();
  URL.revokeObjectURL(url);
}
