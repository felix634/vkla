// Heti edzésrend feltöltése a klub 2026.09.16-án küldött heti munkarendi
// beosztásából (2026_09 beosztás és menetrend_10 hét.pdf, 09.14–20-i hét).
// Csak az idősávos EDZÉSEK kerülnek be (mérkőzés/torna/pihenő nem, stábnevek
// nélkül); az egybefüggő szakaszok (pl. erőnlét + TE-TA ugyanott) összevonva.
// A klub a Studio "Heti edzésrend" listájában frissíti, ha változik.
// Forrás: scripts/hetirend-0916.json. Idempotens (createOrReplace).

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

const slug = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function main() {
  const env = await loadEnv();
  const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2026-08-01",
    token: env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
  });

  const rend = JSON.parse(
    await readFile(path.resolve(process.cwd(), "scripts", "hetirend-0916.json"), "utf8")
  );

  let ossz = 0;
  for (const [korosztaly, entries] of Object.entries(rend)) {
    const id = `hetirend-${slug(korosztaly)}`;
    await client.createOrReplace({
      _id: id,
      _type: "hetirend",
      korosztaly,
      entries: entries.map((e, i) => ({
        _type: "alkalom",
        _key: `a-${slug(korosztaly)}-${i}`,
        day: e.day,
        from: e.from,
        to: e.to,
        location: e.location,
      })),
    });
    console.log(`OK: ${id} (${entries.length} alkalom)`);
    ossz += entries.length;
  }
  console.log(`KÉSZ: ${Object.keys(rend).length} korosztály, ${ossz} alkalom.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
