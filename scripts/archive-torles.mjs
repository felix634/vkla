// A statikus hír-archívum ZÁRÓ lépése: a vágási dátum előtti cikkek és a
// CSAK általuk használt képek törlése a Sanity-ből (Free-csomag doksi-limit).
//   node scripts/archive-torles.mjs --cutoff 2025-01-01              (próba: csak számol)
//   node scripts/archive-torles.mjs --cutoff 2025-01-01 --vegrehajt  (tényleges törlés)
//
// Biztonsági ellenőrzések (bármelyik hibája esetén NEM töröl):
//   - az archívum (content/archiv) ugyanezzel a vágással készült, és minden
//     törlendő cikk JSON-ja + minden archivált képe megvan helyben;
//   - az archívum fájljai commitolva vannak (git), tehát az éles oldalra is kikerülnek;
//   - képet csak akkor töröl, ha azt semmilyen megmaradó dokumentum nem használja.
// Törlés előtt a törlendő dokumentumok teljes tartalma mentésbe kerül:
//   scraped/torles-mentes-<dátum>.ndjson

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import { createClient } from "@sanity/client";

const args = process.argv.slice(2);
const argVal = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const CUTOFF = argVal("--cutoff");
const VEGREHAJT = args.includes("--vegrehajt");
if (!/^\d{4}-\d{2}-\d{2}$/.test(CUTOFF ?? "")) {
  console.error("Használat: node scripts/archive-torles.mjs --cutoff ÉÉÉÉ-HH-NN [--vegrehajt]");
  process.exit(1);
}

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content", "archiv");
const KEP_DIR = path.join(ROOT, "public", "archiv", "kepek");

async function loadEnv() {
  const raw = await readFile(path.join(ROOT, ".env.local"), "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

// Minden "image-..." / "file-..." hivatkozás összegyűjtése egy dokumentumból.
function assetRefek(obj, out = new Set()) {
  if (Array.isArray(obj)) obj.forEach((x) => assetRefek(x, out));
  else if (obj && typeof obj === "object") {
    if (typeof obj._ref === "string" && /^(image|file)-/.test(obj._ref)) out.add(obj._ref);
    for (const v of Object.values(obj)) assetRefek(v, out);
  }
  return out;
}

function hiba(msg) {
  console.error(`\nLEÁLLÍTVA: ${msg}`);
  process.exit(1);
}

async function osszesDoksi(client, filter, params) {
  const ids = await client.fetch(`*[${filter}] | order(_id asc)._id`, params);
  const docs = [];
  for (let i = 0; i < ids.length; i += 200) {
    docs.push(...(await client.fetch(`*[_id in $ids]`, { ids: ids.slice(i, i + 200) })));
  }
  return docs;
}

async function main() {
  const env = await loadEnv();
  const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2026-08-01",
    token: env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
  });

  // 1. Archívum ellenőrzése
  const meta = JSON.parse(await readFile(path.join(CONTENT_DIR, "meta.json"), "utf8"));
  if (meta.cutoff !== CUTOFF) hiba(`az archívum vágása ${meta.cutoff}, nem ${CUTOFF} — előbb exportálj újra.`);
  const index = JSON.parse(await readFile(path.join(CONTENT_DIR, "index.json"), "utf8"));
  const archivSlugok = new Set(index.map((c) => c.slug));

  const cikkek = await osszesDoksi(client, `_type == "hir" && publishedAt < $cutoff`, { cutoff: CUTOFF });
  const hianyzo = cikkek.filter((c) => !archivSlugok.has(c.slug?.current) || !existsSync(path.join(CONTENT_DIR, "cikkek", `${c.slug?.current}.json`)));
  if (hianyzo.length) hiba(`${hianyzo.length} törlendő cikk hiányzik az archívumból (pl. ${hianyzo[0]._id}).`);

  let hianyzoKep = 0;
  for (const c of index) {
    const cikk = JSON.parse(await readFile(path.join(CONTENT_DIR, "cikkek", `${c.slug}.json`), "utf8"));
    const kepek = [cikk.imageUrl, ...(cikk.body ?? []).filter((b) => b._type === "image").map((b) => b.url)].filter(Boolean);
    for (const k of kepek) if (!existsSync(path.join(KEP_DIR, path.basename(k)))) hianyzoKep++;
  }
  if (hianyzoKep) hiba(`${hianyzoKep} archivált kép hiányzik a public/archiv/kepek mappából.`);

  // 2. Git: az archívumnak commitolva kell lennie
  const tracked = execSync("git ls-files content/archiv/index.json", { encoding: "utf8" }).trim();
  const piszkos = execSync("git status --porcelain -- content/archiv public/archiv", { encoding: "utf8" }).trim();
  if (!tracked || piszkos) {
    const uzenet = "az archívum nincs (teljesen) commitolva — előbb commit + push + élő ellenőrzés.";
    if (VEGREHAJT) hiba(uzenet);
    console.log(`FIGYELEM (próbafutás): ${uzenet}`);
  }

  // 3. Törlendő képek: a cikkek képei, amelyeket megmaradó dokumentum nem használ
  const torlendoIds = new Set(cikkek.map((c) => c._id));
  const jeloltek = new Set();
  for (const c of cikkek) assetRefek(c, jeloltek);

  const megmarado = await osszesDoksi(
    client,
    `!(_id in path("_.**")) && !(_type in ["sanity.imageAsset", "sanity.fileAsset"]) && !(_id in $torlendo)`,
    { torlendo: [...torlendoIds] }
  );
  const hasznalt = new Set();
  for (const d of megmarado) assetRefek(d, hasznalt);
  const torlendoKepek = [...jeloltek].filter((a) => !hasznalt.has(a));
  const megosztott = jeloltek.size - torlendoKepek.length;

  const osszes = await client.fetch(`count(*)`);
  const utana = osszes - cikkek.length - torlendoKepek.length;
  console.log(`Vágás: ${CUTOFF}`);
  console.log(`Törlendő cikk:            ${cikkek.length}`);
  console.log(`Törlendő kép:             ${torlendoKepek.length}  (további ${megosztott} képet megmaradó dokumentum is használ — marad)`);
  console.log(`Dokumentumok most:        ${osszes}`);
  console.log(`Dokumentumok utána (kb.): ${utana}  ${utana < 10000 ? "✓ Free-limit (10 000) alatt" : "✗ MÉG A LIMIT FELETT"}`);

  if (!VEGREHAJT) {
    console.log("\nPróbafutás volt — semmi nem törlődött. Tényleges törlés: --vegrehajt");
    return;
  }

  // 4. Mentés a törlés előtt
  const kepDoksik = [];
  for (let i = 0; i < torlendoKepek.length; i += 200) {
    kepDoksik.push(...(await client.fetch(`*[_id in $ids]`, { ids: torlendoKepek.slice(i, i + 200) })));
  }
  const mentes = path.join(ROOT, "scraped", `torles-mentes-${new Date().toISOString().slice(0, 10)}.ndjson`);
  await writeFile(mentes, [...cikkek, ...kepDoksik].map((d) => JSON.stringify(d)).join("\n") + "\n");
  console.log(`\nMentés: ${mentes} (${cikkek.length + kepDoksik.length} dokumentum)`);

  // 5. Törlés: előbb a cikkek (különben a képekre mutató hivatkozás blokkolná), aztán a képek
  const torol = async (ids, cimke) => {
    for (let i = 0; i < ids.length; i += 100) {
      const tx = client.transaction();
      ids.slice(i, i + 100).forEach((id) => tx.delete(id));
      await tx.commit({ visibility: "async" });
      console.log(`${cimke}: ${Math.min(i + 100, ids.length)}/${ids.length}`);
    }
  };
  await torol([...torlendoIds], "Cikkek törölve");
  await torol(torlendoKepek, "Képek törölve");

  console.log(`\nKÉSZ. Dokumentumok most: ${await client.fetch(`count(*)`)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
