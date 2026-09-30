import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Szülői fiók adatbázis (Neon Postgres a Vercel Storage-ból). DATABASE_URL
// nélkül a fiók-funkciók kikapcsolt állapotban vannak (a belépés oldal
// „hamarosan” állapotot mutat) — a weboldal többi része ettől független.

const url = process.env.DATABASE_URL;

export const fiokEnabled = !!url;

let kliens: NeonQueryFunction<false, false> | null = null;

export function sql(): NeonQueryFunction<false, false> {
  if (!url) throw new Error("DATABASE_URL nincs beállítva");
  kliens ??= neon(url);
  return kliens;
}

export type Szamla = {
  id: string;
  szamlaszam: string;
  gyermek_id: string;
  gyermek_nev: string | null;
  korosztaly: string | null;
  idoszak: string | null;
  osszeg: number;
  kelt: string | null; // YYYY-MM-DD
  hatarido: string | null; // YYYY-MM-DD
  pdf_pathname: string;
  fizetve_at: string | null;
  ertesitve_at: string | null;
  ertesites_hiba_at: string | null;
  created_at: string;
};

export type Gyermek = {
  id: string;
  nev: string;
  korosztaly: string | null;
  vevokod: string | null;
};

// A dátumokat szövegként kérjük le, hogy ne csússzanak el időzóna miatt.
export const SZAMLA_MEZOK = `s.id, s.szamlaszam, s.gyermek_id, s.gyermek_nev, s.korosztaly, s.idoszak, s.osszeg,
  to_char(s.kelt, 'YYYY-MM-DD') AS kelt, to_char(s.hatarido, 'YYYY-MM-DD') AS hatarido,
  s.pdf_pathname, s.fizetve_at, s.ertesitve_at, s.ertesites_hiba_at, s.created_at`;

// A szülő gyermekei: akikhez a névjegyzékben az ő e-mail-címe tartozik.
export async function szuloGyermekei(email: string): Promise<Gyermek[]> {
  return (await sql().query(
    `SELECT g.id, g.nev, g.korosztaly, g.vevokod FROM gyermek g
     JOIN gyermek_email ge ON ge.gyermek_id = g.id
     WHERE ge.email = $1 ORDER BY g.nev`,
    [email]
  )) as Gyermek[];
}

export async function szuloSzamlai(email: string): Promise<Szamla[]> {
  return (await sql().query(
    `SELECT ${SZAMLA_MEZOK} FROM szamla s
     WHERE s.gyermek_id IN (SELECT gyermek_id FROM gyermek_email WHERE email = $1)
     ORDER BY s.kelt DESC NULLS LAST, s.created_at DESC`,
    [email]
  )) as Szamla[];
}

export async function szamlaById(id: string): Promise<Szamla | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const rows = (await sql().query(`SELECT ${SZAMLA_MEZOK} FROM szamla s WHERE s.id = $1`, [
    id,
  ])) as Szamla[];
  return rows[0] ?? null;
}

// Láthatja-e a szülő a számlát (a számla gyermekéhez tartozik-e az e-mail-címe)?
export async function szamlaLathato(email: string, sz: Szamla): Promise<boolean> {
  const rows = (await sql().query(
    `SELECT 1 FROM gyermek_email WHERE gyermek_id = $1 AND email = $2`,
    [sz.gyermek_id, email]
  )) as unknown[];
  return rows.length > 0;
}

export async function gyermekEmailjei(gyermekId: string): Promise<string[]> {
  const rows = (await sql().query(
    `SELECT email FROM gyermek_email WHERE gyermek_id = $1 ORDER BY email`,
    [gyermekId]
  )) as { email: string }[];
  return rows.map((r) => r.email);
}

// Névegyezés: kis-/nagybetű és többszörös szóköz nem számít.
export function nevKulcs(nev: string): string {
  return nev.trim().replace(/\s+/g, " ").toLowerCase();
}
