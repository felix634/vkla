// Nagy Miklós (akadémia igazgató) vezetőségi portréja a Drive Bemutatkozás
// mappájából ("Nagy Miklós 1.jpg" — a Portrék/Edzők mappában nincs róla fotó,
// ezért a portré-import kihagyta). Idempotens: ha már van fotó, nem ír felül.

import { readFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

const FILE = path.resolve(
  process.cwd(), "..", "Drive-tartalom", "VKLA - weboldal", "Bemutatkozás", "Nagy Miklós 1.jpg"
);

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

  const doc = await client.fetch(
    `*[_type == "edzo" && name == "Nagy Miklós"][0]{_id, name, "hasPhoto": defined(photo)}`
  );
  if (!doc) throw new Error("Nincs 'Nagy Miklós' nevű edzo dokumentum!");
  if (doc.hasPhoto) {
    console.log(`kihagyva (már van fotó): ${doc.name} (${doc._id})`);
    return;
  }

  const asset = await client.assets.upload("image", createReadStream(FILE), {
    filename: "Nagy Miklós.jpg",
  });
  console.log(`asset feltöltve: ${asset._id} (${asset.metadata?.dimensions?.width}x${asset.metadata?.dimensions?.height})`);

  await client
    .patch(doc._id)
    .set({ photo: { _type: "image", asset: { _type: "reference", _ref: asset._id } } })
    .commit();
  console.log(`OK: ${doc.name} -> ${doc._id} fotó beállítva`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
