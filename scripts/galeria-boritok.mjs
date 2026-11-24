// A Galéria nyitóoldalának két borítóképe (Studio: „Galéria borítóképek”, 2026.11.24.).
// A klub a Studióban is beállíthatja; ez a szkript arra van, amikor mi tesszük fel a
// Tóth Patrik által kiválasztott képeket.
//
// Futtatás:
//   node scripts/galeria-boritok.mjs merkozesek=<képfájl | image-…-asset-id>[@x,y] esemenyek=<…>[@x,y]
//   node scripts/galeria-boritok.mjs merkozesek=- esemenyek=-     (törlés: a legfrissebb album borítója látszik)
// Egyszerre egy mező is megadható. @x,y = fókuszpont 0 és 1 között (pl. @0.5,0.3);
// elhagyva a kép közepe. Előtte mentés: scraped/mentes-galeria-boritok-<időbélyeg>.json.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
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

const ID = "galeriaBoritok";
const MEZOK = ["merkozesek", "esemenyek"];
const HASZNALAT =
  "Használat: node scripts/galeria-boritok.mjs merkozesek=<fájl|image-…>[@x,y] esemenyek=<fájl|image-…>[@x,y]  (törlés: =-)";

const keres = Object.fromEntries(
  process.argv.slice(2).map((a) => [a.slice(0, a.indexOf("=")), a.slice(a.indexOf("=") + 1)])
);
if (!Object.keys(keres).length || Object.keys(keres).some((k) => !MEZOK.includes(k))) throw new Error(HASZNALAT);

const meglevo = await client.fetch(`*[_id in [$id, "drafts." + $id]]`, { id: ID });
writeFileSync(
  new URL(`../scraped/mentes-galeria-boritok-${Date.now()}.json`, import.meta.url),
  JSON.stringify(meglevo, null, 1)
);
if (meglevo.some((d) => d._id.startsWith("drafts."))) {
  console.warn("Figyelem: a Studióban van mentetlen piszkozat; ha valaki közzéteszi, felülírja ezt a beállítást.");
}

const set = {};
const unset = [];
for (const [mezo, ertek] of Object.entries(keres)) {
  if (ertek === "-") {
    unset.push(mezo);
    continue;
  }
  const m = ertek.match(/^(.*)@([\d.]+),([\d.]+)$/);
  const forras = m ? m[1] : ertek;
  let ref;
  if (/^image-[0-9a-f]+-\d+x\d+-[a-z]+$/.test(forras)) {
    if (!(await client.fetch(`count(*[_id == $id])`, { id: forras }))) throw new Error(`Nincs ilyen kép: ${forras}`);
    ref = forras;
  } else {
    if (!existsSync(forras)) throw new Error(`Nincs ilyen fájl: ${forras}`);
    ref = (await client.assets.upload("image", readFileSync(forras), { filename: path.basename(forras) }))._id;
  }
  const kep = { _type: "image", asset: { _type: "reference", _ref: ref } };
  if (m) {
    const [x, y] = [Number(m[2]), Number(m[3])];
    if (!(x >= 0 && x <= 1 && y >= 0 && y <= 1)) throw new Error(`Hibás fókuszpont: ${m[2]},${m[3]}`);
    kep.hotspot = { _type: "sanity.imageHotspot", x, y, width: 0.5, height: 0.5 };
    kep.crop = { _type: "sanity.imageCrop", top: 0, bottom: 0, left: 0, right: 0 };
  }
  set[mezo] = kep;
}

await client
  .transaction()
  .createIfNotExists({ _id: ID, _type: "galeriaBoritok" })
  .patch(ID, (p) => {
    let q = p;
    if (Object.keys(set).length) q = q.set(set);
    if (unset.length) q = q.unset(unset);
    return q;
  })
  .commit();

const most = await client.fetch(`*[_id == $id][0]{ "merkozesek": merkozesek.asset._ref, "esemenyek": esemenyek.asset._ref }`, {
  id: ID,
});
console.log("Kész. Galéria borítóképek most:", most);
