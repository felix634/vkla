import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { sql } from "./db";

// Jelszó nélküli belépés: a szülő megadja az e-mail-címét, kap egy egyszer
// használatos, 30 percig érvényes linket. A link egy megerősítő oldalra visz,
// ahol egy gombnyomással lép be — így a levelezők link-ellenőrzői (pl. Outlook
// Safe Links) nem „használják el” a linket a szülő elől.

const COOKIE = "vkla_fiok";
const TOKEN_ERVENYES_PERC = 30;
const MUNKAMENET_NAP = 30;
const MAX_LINK_15_PERC = 3;

const hash = (s: string) => createHash("sha256").update(s).digest("hex");

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function ervenyesEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && email.length <= 200;
}

// A belépési link alap-címe. Élesben a konfigurált domain (nem a kérés
// Host fejléce — így hamisított fejléccel sem lehet idegen címre linket küldetni).
export function siteUrl(req: Request): string {
  if (process.env.NODE_ENV === "development") return new URL(req.url).origin;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://vkla.vercel.app";
}

export class TulSokKeres extends Error {}

export async function ujBelepoLink(email: string, alap: string): Promise<string> {
  const db = sql();
  const [{ n }] = (await db.query(
    `SELECT count(*)::int AS n FROM belepo_token
     WHERE email = $1 AND created_at > now() - interval '15 minutes'`,
    [email]
  )) as { n: number }[];
  if (n >= MAX_LINK_15_PERC) throw new TulSokKeres();

  const token = randomBytes(32).toString("base64url");
  await db.query(
    `INSERT INTO belepo_token (token_hash, email, lejar)
     VALUES ($1, $2, now() + make_interval(mins => $3))`,
    [hash(token), email, TOKEN_ERVENYES_PERC]
  );
  // Régi, lejárt tokenek takarítása (olcsó, indexelt).
  await db.query(`DELETE FROM belepo_token WHERE lejar < now() - interval '1 day'`);
  return `${alap}/belepes/megerosites?t=${encodeURIComponent(token)}`;
}

// A token beváltása: sikeres esetben új munkamenet + süti.
export async function tokenBevaltas(token: string): Promise<string | null> {
  const db = sql();
  const rows = (await db.query(
    `UPDATE belepo_token SET felhasznalva = now()
     WHERE token_hash = $1 AND felhasznalva IS NULL AND lejar > now()
     RETURNING email`,
    [hash(token)]
  )) as { email: string }[];
  const email = rows[0]?.email;
  if (!email) return null;

  const id = randomBytes(32).toString("base64url");
  await db.query(
    `INSERT INTO munkamenet (id_hash, email, lejar)
     VALUES ($1, $2, now() + make_interval(days => $3))`,
    [hash(id), email, MUNKAMENET_NAP]
  );
  await db.query(`DELETE FROM munkamenet WHERE lejar < now()`);
  cookies().set(COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MUNKAMENET_NAP * 24 * 60 * 60,
  });
  return email;
}

// A bejelentkezett szülő e-mail-címe, vagy null.
export async function aktualisEmail(): Promise<string | null> {
  const id = cookies().get(COOKIE)?.value;
  if (!id) return null;
  const rows = (await sql().query(
    `SELECT email FROM munkamenet WHERE id_hash = $1 AND lejar > now()`,
    [hash(id)]
  )) as { email: string }[];
  return rows[0]?.email ?? null;
}

export async function kilepes(): Promise<void> {
  const id = cookies().get(COOKIE)?.value;
  if (id) await sql().query(`DELETE FROM munkamenet WHERE id_hash = $1`, [hash(id)]);
  cookies().delete(COOKIE);
}

// A pénzügy (számlafeltöltő) e-mail-címei: ADMIN_EMAILS=a@vkla.hu,b@vkla.hu
export function isAdmin(email: string | null): boolean {
  if (!email) return false;
  const lista = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => normalizeEmail(e))
    .filter(Boolean);
  return lista.includes(email);
}
