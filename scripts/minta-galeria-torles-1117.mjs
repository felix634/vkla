// A 2026.09.02-i minta-album („Akadémiai előadások”, seed-galeria.mjs) törlése a galériából.
// Azért készült, hogy a galéria élesben se legyen üres; 2026.11.16-án a klub feltöltötte a saját
// 38 albumát, a dátum nélküli minta pedig az Események tetejére került és a kategória borítóját
// adta (Felix, 2026.11.17.). Előtte mentés: scraped/mentes-minta-galeria-1117.json.
// A képek (assetek) a datasetben maradnak; visszaállítás: a mentett dokumentum createOrReplace-szel.
import { readFileSync, writeFileSync } from "node:fs";
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

const ID = "galeria-akademiai-eloadasok";
const docs = await client.fetch(`*[_id in [$id, "drafts." + $id]]`, { id: ID });
if (docs.length === 0) {
  console.log("Nincs ilyen dokumentum, nincs teendő.");
  process.exit(0);
}
writeFileSync(new URL("../scraped/mentes-minta-galeria-1117.json", import.meta.url), JSON.stringify(docs, null, 1));
const tx = client.transaction();
for (const d of docs) tx.delete(d._id);
await tx.commit();
console.log(`Törölve (mentés után): ${docs.map((d) => `${d._id} – ${d.title} (${d.images?.length ?? 0} kép)`).join(", ")}`);
