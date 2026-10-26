// MLSZ adatbank — a Mérkőzések oldal adatforrása. Az MLSZ Sportszervezeti API
// csak a vkla-mlsz szerver (85.9.201.114) IP-címéről szolgál ki, ezért a szerver
// óránként lekéri a VKLA mérkőzéseit és tabelláit (mlsz-szerver/mlsz-sync.py),
// az oldal pedig az így előállt nyilvános JSON-t olvassa.

export const MLSZ_ADAT_URL = "https://85-9-201-114.sslip.io/vkla.json";
export const MLSZ_ADATBANK_URL = "https://adatbank.mlsz.hu";

export type MlszMerkozes = {
  kod: number;
  verseny: number;
  ido: string; // budapesti helyi idő, zóna nélkül: 2026-10-25T12:00:00
  helyszin: string;
  hazai: string;
  vendeg: string;
  vklaHazai: boolean;
  hazaiGol: number | null;
  vendegGol: number | null;
  statusz: number; // 1 kiírt, 2 lejátszott
  fordulo: number | null;
};

export type MlszTabellaSor = {
  hely: number;
  csapat: string;
  vkla: boolean;
  m: number;
  gy: number;
  d: number;
  v: number;
  lg: number;
  kg: number;
  gk: number;
  p: number;
};

export type MlszVerseny = {
  id: number;
  nev: string;
  eredmenyes: boolean; // U11 alatt és egyes leány-versenyekben nincs eredményközlés
  tabella: { fordulo: string | null; sorok: MlszTabellaSor[] } | null;
};

export type MlszAdat = {
  frissitve: string;
  evad: { id: number; nev: string };
  versenyek: MlszVerseny[];
  merkozesek: MlszMerkozes[];
};

export async function getMlszAdat(): Promise<MlszAdat | null> {
  try {
    const r = await fetch(MLSZ_ADAT_URL, { next: { revalidate: 600 } });
    if (!r.ok) return null;
    const adat = (await r.json()) as MlszAdat;
    return Array.isArray(adat?.merkozesek) && Array.isArray(adat?.versenyek) ? adat : null;
  } catch {
    return null;
  }
}

// Verseny → a Hírek korosztály-kódja (Oldal beállítások): U19 … U6, NBII, U19L … U10L.
export function korosztalyKod(versenyNev: string): string | null {
  if (/Női\s+(NB|Kupa)/i.test(versenyNev)) return "NBII";
  const m = versenyNev.match(/U-?\s?(\d{1,2})\b/i);
  if (!m) return null;
  return /Leány/i.test(versenyNev) ? `U${m[1]}L` : `U${m[1]}`;
}

// „MLSZ Országos U19 Kiemelt” → „U19 Kiemelt”
export function versenyRovidNev(nev: string): string {
  return nev.replace(/^MLSZ\s+/, "").replace(/^Országos\s+/, "").replace(/\s+/g, " ").trim();
}

// A Mérkőzések oldal nézet-modellje (szerveren áll elő, a kliens csak szűr).
export type MerkozesSor = {
  kod: number;
  korosztaly: string;
  verseny: string;
  ido: string;
  helyszin: string;
  hazai: string;
  vendeg: string;
  vklaHazai: boolean;
  allapot: "kovetkezo" | "eredmeny" | "lejatszva" | "nincs";
  eredmeny: string | null;
  kimenet: "gy" | "d" | "v" | null; // a VKLA szemszögéből
};

export type KorosztalyTabella = {
  korosztaly: string;
  verseny: string;
  fordulo: string | null;
  sorok: MlszTabellaSor[];
};

export type MerkozesNezet = {
  korosztalyok: string[]; // a klub sorrendjében (Oldal beállítások → Hírek korosztályai)
  sorok: MerkozesSor[];
  tabellak: KorosztalyTabella[];
};

/**
 * @param sorrend a Hírek korosztály-listája (kód + megjelenített név), ez adja a szűrő sorrendjét
 * @param most budapesti helyi idő ugyanabban a formában, mint az `ido` (2026-10-26T17:40:00)
 */
export function merkozesNezet(
  adat: MlszAdat,
  sorrend: { kod: string; nev?: string | null }[],
  most: string
): MerkozesNezet {
  const nevek = new Map(sorrend.map((k) => [k.kod, k.nev || k.kod]));
  const versenyek = new Map(adat.versenyek.map((v) => [v.id, v]));
  const kodja = (v: MlszVerseny) => korosztalyKod(v.nev) ?? versenyRovidNev(v.nev);
  const nevOf = (kod: string) => nevek.get(kod) ?? kod;
  const ma = most.slice(0, 10);

  const sorok: MerkozesSor[] = [];
  for (const m of adat.merkozesek) {
    const v = versenyek.get(m.verseny);
    if (!v) continue;
    let allapot: MerkozesSor["allapot"] = "nincs";
    let eredmeny: string | null = null;
    let kimenet: MerkozesSor["kimenet"] = null;
    if (m.statusz === 2) {
      if (v.eredmenyes && m.hazaiGol != null && m.vendegGol != null) {
        allapot = "eredmeny";
        eredmeny = `${m.hazaiGol}–${m.vendegGol}`;
        const [sajat, ellen] = m.vklaHazai ? [m.hazaiGol, m.vendegGol] : [m.vendegGol, m.hazaiGol];
        kimenet = sajat > ellen ? "gy" : sajat < ellen ? "v" : "d";
      } else {
        allapot = "lejatszva";
      }
    } else if (m.statusz === 1) {
      // Időpont nélküli (00:00) meccs a nap végéig „következő”.
      const jovo = m.ido.endsWith("T00:00:00") ? m.ido.slice(0, 10) >= ma : m.ido >= most;
      allapot = jovo ? "kovetkezo" : "nincs";
    }
    sorok.push({
      kod: m.kod,
      korosztaly: nevOf(kodja(v)),
      verseny: versenyRovidNev(v.nev),
      ido: m.ido,
      helyszin: m.helyszin,
      hazai: m.hazai,
      vendeg: m.vendeg,
      vklaHazai: m.vklaHazai,
      allapot,
      eredmeny,
      kimenet,
    });
  }

  const helye = (nev: string) => {
    const i = sorrend.findIndex((k) => (k.nev || k.kod) === nev);
    return i < 0 ? sorrend.length : i;
  };
  const rendez = (a: string, b: string) => helye(a) - helye(b) || a.localeCompare(b, "hu");

  const tabellak: KorosztalyTabella[] = adat.versenyek
    .filter((v) => v.tabella && v.tabella.sorok.length > 0)
    .map((v) => ({
      korosztaly: nevOf(kodja(v)),
      verseny: versenyRovidNev(v.nev),
      fordulo: v.tabella!.fordulo,
      sorok: v.tabella!.sorok,
    }))
    .sort((a, b) => rendez(a.korosztaly, b.korosztaly));

  return {
    korosztalyok: Array.from(new Set(sorok.map((s) => s.korosztaly))).sort(rendez),
    sorok,
    tabellak,
  };
}
