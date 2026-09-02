// A beallitasok dokumentum hibás kódolású mezőinek javítása
// (a 09.01-i import U+FFFD karaktereket tárolt el) + a fogadóóra napja
// a Drive-forrás szerint Csütörtök, nem Kedd.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@sanity/client";

async function loadEnv() {
  const raw = await readFile(path.resolve(process.cwd(), ".env.local"), "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const env = await loadEnv();
const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2026-08-01",
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

await client
  .patch("beallitasok")
  .set({
    address: "1139 Budapest, Fáy utca 58.",
    officeHours: "Hétfő: 13:00–17:30, Csütörtök: 09:00–13:00 (szervezési ügyintézés)",
  })
  .commit();

const doc = await client.getDocument("beallitasok");
const bad = JSON.stringify(doc).includes("�");
console.log(bad ? "MÉG MINDIG HIBÁS" : "OK, nincs több hibás karakter");
