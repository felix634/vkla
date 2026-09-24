// A szülői fiók adatbázis-sémájának létrehozása / frissítése (Neon Postgres).
// Futtatás: node scripts/db-migrate.mjs   (a DATABASE_URL a .env.local-ból jön)
// Idempotens — többször is lefuttatható.

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    })
);

const url = env.DATABASE_URL ?? process.env.DATABASE_URL;
if (!url) {
  console.error("Hiányzik a DATABASE_URL a .env.local-ból.");
  process.exit(1);
}

const sql = neon(url);
const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8")
  .replace(/--.*$/gm, "")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const stmt of schema) {
  await sql.query(stmt);
  console.log("OK:", stmt.split("\n")[0]);
}

const [{ n }] = await sql.query("SELECT count(*)::int AS n FROM szamla");
console.log(`Kész. Számlák száma az adatbázisban: ${n}`);
