import "server-only";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { sql } from "./db";

// Szülői fiók: e-mail + jelszó. A jelszót a szülő mindig az e-mailben kapott,
// egyszer használatos linken állítja be (regisztrációkor és elfelejtett
// jelszónál is) — így csak a postafiók tulajdonosa hozhat létre fiókot az adott
// címmel, és idegen nem „foglalhatja le” más címét. A link GET-re csak egy
// űrlapot mutat, a token a jelszó beküldésekor használódik el, így a levelezők
// link-ellenőrzői (pl. Outlook Safe Links) nem teszik tönkre.

const COOKIE = "vkla_fiok";
const MUNKAMENET_NAP = 90;
const MAX_LINK_15_PERC = 3;
const MAX_HIBAS = 5;
const ZAROLAS_PERC = 15;
export const JELSZO_MIN = 8;

const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const scryptAsync = promisify(scrypt) as (
  jelszo: string,
  so: Buffer,
  hossz: number,
  opciok: { N: number; r: number; p: number; maxmem: number }
) => Promise<Buffer>;
const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function ervenyesEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && email.length <= 200;
}

// A levelekben küldött linkek alap-címe. Élesben a konfigurált domain (nem a
// kérés Host fejléce — így hamisított fejléccel sem lehet idegen címre linket küldetni).
export function siteUrl(req: Request): string {
  if (process.env.NODE_ENV === "development") return new URL(req.url).origin;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://vkla.vercel.app";
}

// ——— Jelszó ———

export async function jelszoHash(jelszo: string): Promise<string> {
  const so = randomBytes(16);
  const kulcs = await scryptAsync(jelszo, so, 64, SCRYPT);
  return `scrypt$${so.toString("base64")}$${kulcs.toString("base64")}`;
}

async function jelszoEgyezik(jelszo: string, tarolt: string | null): Promise<boolean> {
  // Nem létező fióknál is lefut egy scrypt, hogy a válaszidő ne árulja el, van-e fiók.
  const [, soB64, kulcsB64] = (tarolt ?? "scrypt$AAAAAAAAAAAAAAAAAAAAAA==$").split("$");
  const vart = Buffer.from(kulcsB64 ?? "", "base64");
  const kapott = await scryptAsync(jelszo, Buffer.from(soB64 ?? "", "base64"), 64, SCRYPT);
  return !!tarolt && vart.length === kapott.length && timingSafeEqual(vart, kapott);
}

// ——— Jelszó-beállító linkek ———

export class TulSokKeres extends Error {}

export async function jelszoLink(email: string, alap: string, ervenyesPerc: number): Promise<string> {
  const db = sql();
  const [{ n }] = (await db.query(
    `SELECT count(*)::int AS n FROM fiok_token
     WHERE email = $1 AND created_at > now() - interval '15 minutes'`,
    [email]
  )) as { n: number }[];
  if (n >= MAX_LINK_15_PERC) throw new TulSokKeres();

  const token = randomBytes(32).toString("base64url");
  await db.query(
    `INSERT INTO fiok_token (token_hash, email, lejar)
     VALUES ($1, $2, now() + make_interval(mins => $3))`,
    [hash(token), email, ervenyesPerc]
  );
  await db.query(`DELETE FROM fiok_token WHERE lejar < now() - interval '1 day'`);
  return `${alap}/jelszo-beallitas?t=${encodeURIComponent(token)}`;
}

// Új jelszó beállítása a linkkel: a fiók ezzel megerősítetté válik, a korábbi
// munkamenetek megszűnnek, és a szülő be is lép.
export async function jelszoBeallitas(token: string, jelszo: string): Promise<string | null> {
  const db = sql();
  const rows = (await db.query(
    `UPDATE fiok_token SET felhasznalva = now()
     WHERE token_hash = $1 AND felhasznalva IS NULL AND lejar > now()
     RETURNING email`,
    [hash(token)]
  )) as { email: string }[];
  const email = rows[0]?.email;
  if (!email) return null;

  await db.query(
    `INSERT INTO szulo (email, jelszo_hash, megerositve_at) VALUES ($1, $2, now())
     ON CONFLICT (email) DO UPDATE SET jelszo_hash = EXCLUDED.jelszo_hash,
       megerositve_at = COALESCE(szulo.megerositve_at, now()),
       hibas_probalkozas = 0, zarolva_eddig = NULL`,
    [email, await jelszoHash(jelszo)]
  );
  await db.query(`DELETE FROM munkamenet WHERE email = $1`, [email]);
  await munkamenetInditas(email);
  return email;
}

// ——— Belépés ———

export type BelepesEredmeny = "ok" | "hibas" | "zarolva";

export async function belepes(email: string, jelszo: string): Promise<BelepesEredmeny> {
  const db = sql();
  const rows = (await db.query(
    `SELECT jelszo_hash, megerositve_at, zarolva_eddig > now() AS zarolva FROM szulo WHERE email = $1`,
    [email]
  )) as { jelszo_hash: string | null; megerositve_at: string | null; zarolva: boolean | null }[];
  const fiok = rows[0];
  if (fiok?.zarolva) return "zarolva";

  const jo = await jelszoEgyezik(jelszo, fiok?.megerositve_at ? fiok.jelszo_hash : null);
  if (!jo) {
    if (fiok) {
      await db.query(
        `UPDATE szulo SET hibas_probalkozas = hibas_probalkozas + 1,
           zarolva_eddig = CASE WHEN hibas_probalkozas + 1 >= $2
             THEN now() + make_interval(mins => $3) ELSE zarolva_eddig END
         WHERE email = $1`,
        [email, MAX_HIBAS, ZAROLAS_PERC]
      );
    }
    return "hibas";
  }
  await db.query(
    `UPDATE szulo SET hibas_probalkozas = 0, zarolva_eddig = NULL, utolso_belepes = now() WHERE email = $1`,
    [email]
  );
  await munkamenetInditas(email);
  return "ok";
}

// ——— Munkamenet ———

async function munkamenetInditas(email: string): Promise<void> {
  const db = sql();
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
