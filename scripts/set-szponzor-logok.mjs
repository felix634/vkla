// Az Allianz és LGR szponzorlogó pótlása a Drive Szponzorok mappájából
// (a 09.01-i importnál ez a két logó kimaradt). Idempotens: meglévő logót
// nem ír felül.

import { readFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

const FOLDER = path.resolve(process.cwd(), "..", "Drive-tartalom", "VKLA - weboldal", "Szponzorok");

const LOGOK = [
  { nev: "Allianz", fajl: "AZ_Logo_positive_RGB.png" },
  { nev: "LGR", fajl: "lgr.png" },
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

  for (const { nev, fajl } of LOGOK) {
    const doc = await client.fetch(
      `*[_type == "szponzor" && name == $nev][0]{_id, name, "vanLogo": defined(logo)}`,
      { nev }
    );
    if (!doc) {
      console.log(`HIBA: nincs "${nev}" nevű szponzor dokumentum`);
      continue;
    }
    if (doc.vanLogo) {
      console.log(`kihagyva (már van logó): ${nev} (${doc._id})`);
      continue;
    }
    const asset = await client.assets.upload("image", createReadStream(path.join(FOLDER, fajl)), {
      filename: fajl,
    });
    await client
      .patch(doc._id)
      .set({ logo: { _type: "image", asset: { _type: "reference", _ref: asset._id } } })
      .commit();
    console.log(`OK: ${nev} -> ${doc._id} logó beállítva (${asset._id})`);
  }
  console.log("KÉSZ.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
