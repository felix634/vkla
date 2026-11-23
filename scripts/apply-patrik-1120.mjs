// Tóth Patrik 2026.11.20-i levele (a képeket ő töltötte fel a Drive-ra, „VKLA - weboldal”):
//   1. Akadémia – Bemutatkozás: új kép Nagy Miklósról (Bemutatkozás/bemutatkozás.JPG). A keret 4:3-as,
//      ezért 4:3-ra vágva megy fel, a jobb szélhez igazítva (ott ül Miklós); a bal oldali üres székek esnek ki.
//   2. Akadémia – Vezetőség: Miklós új portréja (Bemutatkozás/20220728_vasas_csapatfoto_stabkep_szmg-8291-c.png,
//      átlátszó hátterű kivágás, mint a stáb többi portréja).
//   3. Akadémia – Együttműködés a TF-fel: 2 fotó, az OSEI-s blokkhoz hasonlóan
//      (Együttműködés a Magyar Testnevelési és Sporttudományi Egyetemmel/…).
// A régi képek assetként a datasetben maradnak. Mentés: scraped/mentes-patrik-1120.json.
//
// Futtatás: node scripts/apply-patrik-1120.mjs <bemutatkozas_4x3.jpg> <portre.png> <tf1.jpg> <tf2.jpg>
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
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

const [bemutatkozasKep, portre, tf1, tf2] = process.argv.slice(2);
if (!tf2) throw new Error("Használat: node scripts/apply-patrik-1120.mjs <bemutatkozas_4x3.jpg> <portre.png> <tf1.jpg> <tf2.jpg>");

const IDK = ["szekcio-bemutatkozas", "edzo-nagy-miklos", "szekcio-egyuttmukodes-tf"];
const mentes = await client.fetch(`*[_id in $ids]`, { ids: IDK });
if (mentes.length !== IDK.length) throw new Error(`Hiányzó dokumentum: ${IDK.filter((id) => !mentes.some((d) => d._id === id))}`);
writeFileSync(new URL("../scraped/mentes-patrik-1120.json", import.meta.url), JSON.stringify(mentes, null, 1));

const feltolt = async (fajl, nev) => (await client.assets.upload("image", readFileSync(fajl), { filename: nev }))._id;
const kep = (key, ref) => ({ _key: key, _type: "image", asset: { _type: "reference", _ref: ref } });

const bem = await feltolt(bemutatkozasKep, "nagy-miklos-bemutatkozas.jpg");
const por = await feltolt(portre, "nagy-miklos-portre.png");
const t1 = await feltolt(tf1, path.basename(tf1));
const t2 = await feltolt(tf2, path.basename(tf2));

await client
  .transaction()
  .patch("szekcio-bemutatkozas", (p) => p.set({ images: [kep("k1120m", bem)] }))
  .patch("edzo-nagy-miklos", (p) => p.set({ photo: { _type: "image", asset: { _type: "reference", _ref: por } } }))
  .patch("szekcio-egyuttmukodes-tf", (p) => p.set({ images: [kep("k1120t1", t1), kep("k1120t2", t2)] }))
  .commit();

console.log("Kész: Bemutatkozás-kép, Nagy Miklós portré, 2 TF-fotó. Mentés: scraped/mentes-patrik-1120.json");
