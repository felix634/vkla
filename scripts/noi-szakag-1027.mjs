// Az U12 és U10 leány csapat a Női szakágba (a 2026/27-es szervezeti ábra Női
// szekciója szerint). Szekció nélkül a Csapatok oldal nem mutatta őket.
// Idempotens. Az eredeti állapotot előbb a git-ignorált scraped/ mappába menti.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createClient } from "@sanity/client";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);
const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2026-08-01",
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const CSAPATOK = ["korosztaly-u12-leany", "korosztaly-u10-leany"];

const mentes = new URL("../scraped/mentes-noi-szakag-1027.json", import.meta.url);
if (!existsSync(mentes)) {
  const docs = await client.fetch(`*[_id in $ids]`, { ids: CSAPATOK });
  writeFileSync(mentes, JSON.stringify(docs, null, 2));
  console.log(`Mentve: ${docs.length} dokumentum → scraped/mentes-noi-szakag-1027.json`);
}

const tx = client.transaction();
for (const id of CSAPATOK) tx.patch(id, (p) => p.set({ section: "Női szakág" }));
await tx.commit();

const ellenorzes = await client.fetch(`*[_id in $ids]{name, section}`, { ids: CSAPATOK });
console.log(ellenorzes);
