// TAO-dokumentumok évszáma (Felix, 2026.11.24.: „a 2026-os dokumentumok alatt 2024-esek
// vannak, kimaradt a 2025-ös”). A „2025_26” / „2022_23” alakú (aláhúzásos) fájlneveknél
// az import nem ismerte fel az évet, ezért ezek az „Általános dokumentumok” közé kerültek.
// Az év a szezon első éve, mint a többi dokumentumnál („2024-25” → 2024).
// Csak az év nélküli TAO-dokumentumokat érinti. Mentés: scraped/mentes-tao-evek-1124-<időbélyeg>.json.
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

const docs = await client.fetch(`*[_type == "dokumentum" && category == "TAO" && !defined(year)]{ _id, title, year }`);
const javitando = docs
  .map((d) => ({ ...d, uj: d.title.match(/\b(20\d\d)_\d\d(?!\d)/)?.[1] }))
  .filter((d) => d.uj);
if (!javitando.length) {
  console.log("Nincs javítandó dokumentum.");
  process.exit(0);
}
writeFileSync(new URL(`../scraped/mentes-tao-evek-1124-${Date.now()}.json`, import.meta.url), JSON.stringify(javitando, null, 1));
const tx = client.transaction();
for (const d of javitando) tx.patch(d._id, (p) => p.set({ year: d.uj }));
await tx.commit();
for (const d of javitando) console.log(`${d.uj}  ${d.title}`);
