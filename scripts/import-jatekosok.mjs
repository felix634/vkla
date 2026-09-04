// Játékos-névsorok építése a Drive "Portrék/Játékosok" mappából:
// mappánként (korosztály) a fájlnevekből játekos-bejegyzések készülnek
// névvel + fotóval a korosztaly dokumentumok players tömbjébe.
// - VAS_* (név nélküli) fájlok kimaradnak, a végén listázva.
// - Duplikátumok ("(1)", " másolata") név alapján kiszűrve.
// - Asset-feltöltés cache-elve (jatekos-asset-map.json) — megszakítás után
//   újrafuttatható, a kész képeket nem tölti fel újra.

import { readFile, readdir, writeFile } from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

const BASE = path.resolve(process.cwd(), "..", "Drive-tartalom", "VKLA - weboldal", "Portrék", "Játékosok", "Játékosok");
const CACHE_FILE = path.resolve(process.cwd(), "scraped", "jatekos-asset-map.json");

const FOLDER_TO_DOC = {
  "U9": "korosztaly-u9",
  "U10": "korosztaly-u10",
  "U11": "korosztaly-u11",
  "U12": "korosztaly-u12",
  "U13": "korosztaly-u13",
  "U14": "korosztaly-u14",
  "U15": "korosztaly-u15",
  "U16": "korosztaly-u16",
  "U17": "korosztaly-u17",
  "U19": "korosztaly-u19",
  "U10L": "korosztaly-u10-leany",
  "U12L": "korosztaly-u12-leany",
  "U14L": "korosztaly-u14-leany",
  "U16L": "korosztaly-u16-leany",
  "U19L": "korosztaly-u19-leany",
  "U5-7": "korosztaly-u5-7",
  "U8-A": "korosztaly-u8-a",
  "U8-B": "korosztaly-u8-b",
  "Felnőtt női": "korosztaly-felnott-noi",
};

async function loadEnv() {
  const raw = await readFile(path.resolve(process.cwd(), ".env.local"), "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

// "Kovács Lujza-Photoroom (1).png" -> "Kovács Lujza"
function cleanName(file) {
  return file
    .replace(/\.png$/i, "")
    .replace(/-Photoroom/gi, "")
    .replace(/\s*\(\d+\)\s*$/, "")
    .replace(/\s+másolata\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

let keyCounter = 0;
const k = () => `j${(keyCounter++).toString(36)}${Date.now().toString(36).slice(-3)}`;

async function main() {
  const env = await loadEnv();
  const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2026-08-01",
    token: env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
  });

  const cache = existsSync(CACHE_FILE) ? JSON.parse(await readFile(CACHE_FILE, "utf8")) : {};
  const saveCache = () => writeFile(CACHE_FILE, JSON.stringify(cache, null, 1));

  const skippedUnnamed = [];
  const folders = (await readdir(BASE, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  let totalPlayers = 0;
  for (const folder of folders) {
    const docId = FOLDER_TO_DOC[folder];
    if (!docId) {
      console.log(`ISMERETLEN MAPPA (kimarad): ${folder}`);
      continue;
    }
    const files = (await readdir(path.join(BASE, folder))).filter((f) => f.toLowerCase().endsWith(".png"));
    const byName = new Map();
    for (const file of files) {
      if (/^VAS_/i.test(file)) {
        skippedUnnamed.push(`${folder}/${file}`);
        continue;
      }
      const name = cleanName(file);
      if (!byName.has(name)) byName.set(name, file);
    }

    const players = [];
    for (const [name, file] of [...byName.entries()].sort((a, b) => a[0].localeCompare(b[0], "hu"))) {
      const cacheKey = `${folder}/${file}`;
      if (!cache[cacheKey]) {
        const asset = await client.assets.upload("image", createReadStream(path.join(BASE, folder, file)), {
          filename: file,
        });
        cache[cacheKey] = asset._id;
        await saveCache();
      }
      players.push({
        _type: "jatekos",
        _key: k(),
        name,
        photo: { _type: "image", asset: { _type: "reference", _ref: cache[cacheKey] } },
      });
    }

    await client.patch(docId).set({ players }).commit();
    totalPlayers += players.length;
    console.log(`OK: ${folder} -> ${docId} (${players.length} játékos)`);
  }

  console.log(`\nKÉSZ: ${totalPlayers} játékos összesen.`);
  if (skippedUnnamed.length) {
    console.log(`NÉV NÉLKÜL KIMARADT (${skippedUnnamed.length}):`);
    for (const s of skippedUnnamed) console.log(`  - ${s}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
