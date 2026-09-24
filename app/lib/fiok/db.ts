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
  email: string;
  vevo_nev: string | null;
  gyermek_nev: string | null;
  korosztaly: string | null;
  idoszak: string | null;
  osszeg: number;
  kelt: string | null; // YYYY-MM-DD
  hatarido: string | null; // YYYY-MM-DD
  pdf_pathname: string;
  fizetve_at: string | null;
  ertesitve_at: string | null;
  created_at: string;
};

// A dátumokat szövegként kérjük le, hogy ne csússzanak el időzóna miatt.
export const SZAMLA_MEZOK = `id, szamlaszam, email, vevo_nev, gyermek_nev, korosztaly, idoszak, osszeg,
  to_char(kelt, 'YYYY-MM-DD') AS kelt, to_char(hatarido, 'YYYY-MM-DD') AS hatarido,
  pdf_pathname, fizetve_at, ertesitve_at, created_at`;

export async function szuloSzamlai(email: string): Promise<Szamla[]> {
  return (await sql().query(
    `SELECT ${SZAMLA_MEZOK} FROM szamla WHERE email = $1
     ORDER BY kelt DESC NULLS LAST, created_at DESC`,
    [email]
  )) as Szamla[];
}

export async function szamlaById(id: string): Promise<Szamla | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const rows = (await sql().query(`SELECT ${SZAMLA_MEZOK} FROM szamla WHERE id = $1`, [
    id,
  ])) as Szamla[];
  return rows[0] ?? null;
}
