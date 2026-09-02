// Minta galéria-album a Drive "Akadémiai előadások" fotóiból, hogy a
// galéria CMS-ága élesben is látható legyen. Idempotens (createOrReplace,
// az asset-feltöltés content-hash alapján deduplikál).

import { readFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

const DRIVE = path.resolve(process.cwd(), "..", "Drive-tartalom", "VKLA - weboldal");
const FOLDER = path.join(DRIVE, "Akadémiai előadások");

const PHOTOS = [
  "16174645_1316724378388324_5280977148047155747_n.jpg",
  "16832245_1350819938312101_3461722756766882708_n.jpg",
  "30688678_1766167783443979_2954235705502882096_n.jpg",
  "30728328_1669998629751731_8056967882581475328_n másolata(1).jpg",
  "IMG_3267 (2)(1).jpg",
  "IMG_5198(1).jpg",
  "IMG_5441 másolata(1).jpg",
  "IMG_9533(1).jpg",
];

async function loadEnv() {
  const raw = await readFile(path.resolve(process.cwd(), ".env.local"), "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
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

  const refs = [];
  for (const name of PHOTOS) {
    try {
      const asset = await client.assets.upload("image", createReadStream(path.join(FOLDER, name)), {
        filename: name,
      });
      refs.push(asset._id);
      console.log(`kép OK: ${name}`);
    } catch (e) {
      console.error(`kép HIBA: ${name} — ${e.message}`);
    }
  }

  let k = 0;
  await client.createOrReplace({
    _id: "galeria-akademiai-eloadasok",
    _type: "galeria",
    title: "Akadémiai előadások",
    category: "Esemény",
    images: refs.map((r) => ({
      _type: "image",
      _key: `k${k++}`,
      asset: { _type: "reference", _ref: r },
    })),
  });
  console.log(`KÉSZ: galeria-akademiai-eloadasok (${refs.length} kép)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
