import "server-only";
import { nevKulcs, sql, type Gyermek } from "./db";
import { ervenyesEmail, normalizeEmail } from "./auth";

// Családi névjegyzék: gyermek ↔ szülői e-mail-címek. A pénzügy tölti fel (a
// meglévő Excelből) és tartja karban; a számlák a gyermekhez párosulnak.

const NEV_SQL = `lower(regexp_replace(trim(nev), '\\s+', ' ', 'g'))`;

export type Kereses = { gyermek: Gyermek } | { hiba: "nincs" | "tobb" };

// Gyermek keresése vevőkód (ha van), különben név alapján.
export async function gyermekKeres(nev: string | null, vevokod: string | null): Promise<Kereses> {
  const db = sql();
  if (vevokod) {
    const rows = (await db.query(`SELECT id, nev, korosztaly, vevokod FROM gyermek WHERE vevokod = $1`, [
      vevokod,
    ])) as Gyermek[];
    if (rows[0]) return { gyermek: rows[0] };
  }
  if (!nev) return { hiba: "nincs" };
  const rows = (await db.query(
    `SELECT id, nev, korosztaly, vevokod FROM gyermek WHERE ${NEV_SQL} = $1`,
    [nevKulcs(nev)]
  )) as Gyermek[];
  if (rows.length === 1) return { gyermek: rows[0] };
  return { hiba: rows.length > 1 ? "tobb" : "nincs" };
}

export type ImportSor = {
  nev: string;
  korosztaly?: string | null;
  vevokod?: string | null;
  emailek: string[];
};

export type ImportEredmeny = { allapot: "uj" | "frissitve" | "hiba"; uzenet: string };

// Egy névjegyzék-sor mentése: meglévő gyermeknél frissít és hozzáadja az új
// címeket (a meglévőket nem törli), újnál létrehozza.
export async function gyermekMentes(sor: ImportSor): Promise<ImportEredmeny> {
  const db = sql();
  const nev = sor.nev.trim().replace(/\s+/g, " ");
  const vevokod = sor.vevokod?.trim() || null;
  const korosztaly = sor.korosztaly?.trim() || null;
  if (!nev) return { allapot: "hiba", uzenet: "Hiányzik a gyermek neve" };
  const emailek = [...new Set(sor.emailek.map(normalizeEmail))].filter(Boolean);
  const rossz = emailek.filter((e) => !ervenyesEmail(e));
  if (rossz.length) return { allapot: "hiba", uzenet: `Hibás e-mail-cím: ${rossz.join(", ")}` };

  const talalat = await gyermekKeres(nev, vevokod);
  if ("hiba" in talalat && talalat.hiba === "tobb") {
    return { allapot: "hiba", uzenet: "Több azonos nevű gyermek van — adj meg vevőkódot" };
  }

  let id: string;
  let allapot: ImportEredmeny["allapot"];
  if ("gyermek" in talalat) {
    id = talalat.gyermek.id;
    allapot = "frissitve";
    await db.query(
      `UPDATE gyermek SET korosztaly = COALESCE($2, korosztaly), vevokod = COALESCE(vevokod, $3) WHERE id = $1`,
      [id, korosztaly, vevokod]
    );
  } else {
    const rows = (await db.query(
      `INSERT INTO gyermek (nev, korosztaly, vevokod) VALUES ($1, $2, $3) RETURNING id`,
      [nev, korosztaly, vevokod]
    )) as { id: string }[];
    id = rows[0].id;
    allapot = "uj";
  }

  let uj = 0;
  for (const email of emailek) {
    const r = (await db.query(
      `INSERT INTO gyermek_email (gyermek_id, email) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING email`,
      [id, email]
    )) as unknown[];
    uj += r.length;
  }
  const cimek = emailek.length ? ` · ${uj} új e-mail-cím` : " · nincs e-mail-cím";
  return { allapot, uzenet: (allapot === "uj" ? "Felvéve" : "Frissítve") + cimek };
}
