// Edzőportrék importja a Drive "Portrék/Edzők" mappából: a fájlnév (Név.png)
// alapján ékezet-független egyezéssel párosítjuk az edzo dokumentumokhoz,
// és beállítjuk a photo mezőt. Ismeretlen név esetén új, rejtett (featured
// nélküli) edzo doksit hozunk létre, hogy a fotó ne vesszen el. Idempotens.

import { readFile, readdir } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

const FOLDER = path.resolve(process.cwd(), "..", "Drive-tartalom", "VKLA - weboldal", "Portrék", "Edzők");

async function loadEnv() {
  const raw = await readFile(path.resolve(process.cwd(), ".env.local"), "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const norm = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

async function main() {
  const env = await loadEnv();
  const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2026-08-01",
    token: env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
  });

  const edzok = await client.fetch(`*[_type == "edzo"]{_id, name, "hasPhoto": defined(photo)}`);
  const byNorm = new Map(edzok.map((e) => [norm(e.name), e]));

  const files = (await readdir(FOLDER)).filter((f) => f.toLowerCase().endsWith(".png"));
  console.log(`${files.length} portré a mappában, ${edzok.length} edző a CMS-ben`);

  for (const file of files) {
    const name = file.replace(/\.png$/i, "");
    const match = byNorm.get(norm(name));
    if (match?.hasPhoto) {
      console.log(`kihagyva (már van fotó): ${name}`);
      continue;
    }
    const asset = await client.assets.upload("image", createReadStream(path.join(FOLDER, file)), {
      filename: file,
    });
    const photo = { _type: "image", asset: { _type: "reference", _ref: asset._id } };
    if (match) {
      await client.patch(match._id).set({ photo }).commit();
      console.log(`OK: ${name} -> ${match._id}`);
    } else {
      const id = "edzo-" + norm(name).replace(/([a-z0-9])/g, "$1").slice(0, 60);
      await client.createIfNotExists({ _id: id, _type: "edzo", name, photo });
      await client.patch(id).set({ photo }).commit();
      console.log(`ÚJ (rejtett, szerep nélkül): ${name} -> ${id}`);
    }
  }
  console.log("KÉSZ.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
