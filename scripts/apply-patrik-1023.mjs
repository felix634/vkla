// Tóth Patrik 2026.10.23-i módosítási listájának tartalmi (Sanity) része.
// Idempotens: többször futtatva is ugyanazt az állapotot adja. Az érintett
// dokumentumok eredeti állapotát előbb a git-ignorált scraped/ mappába menti.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
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

const letesitmenyek = await client.fetch(`*[_type == "letesitmeny"]{ _id, name }`);
const id = (minta) => letesitmenyek.find((l) => minta.test(l.name))?._id;
const fay = id(/Fáy/);
const fcsm = id(/FCSM/);
const illovszky = id(/Illovszky/);
if (!fay || !fcsm || !illovszky) throw new Error("Nem találom mindhárom létesítményt: " + JSON.stringify(letesitmenyek));

// 0. Mentés az érintett dokumentumokról (csak az első futáskor).
const mentes = new URL("../scraped/mentes-patrik-1023.json", import.meta.url);
if (!existsSync(mentes)) {
  const docs = await client.fetch(
    `*[_id in $ids || _type == "oldalszekcio"]`,
    { ids: ["beallitasok", fay, fcsm, illovszky, "edzo-angyal-peter"] }
  );
  writeFileSync(mentes, JSON.stringify(docs, null, 2));
  console.log(`Mentve: ${docs.length} dokumentum → scraped/mentes-patrik-1023.json`);
}

const tx = client.transaction();

// 1. Oldal beállítások: iroda emelete, hírlista 2026.01.01-től, hír-korosztályok sorrendje.
const KOROSZTALYOK = [
  ...["U19", "U17", "U16", "U15", "U14", "U13", "U12", "U11", "U10", "U9", "U8", "U7", "U6"].map((kod) => ({ kod })),
  { kod: "NBII", nev: "Női NB II" },
  ...["U19L", "U16L", "U14L", "U13L", "U12L", "U11L", "U10L"].map((kod) => ({ kod })),
].map((k) => ({ _type: "hirKorosztaly", _key: k.kod.toLowerCase(), ...k }));
tx.patch("beallitasok", (p) =>
  p
    .set({ irodaCim: "1139 Budapest, Hajdú utca 42., 3. emelet", hirekKezdete: "2026-01-01" })
    .setIfMissing({ hirKorosztalyok: KOROSZTALYOK })
);

// 2. Létesítmények sorrendje: Fáy utcai Sportcentrum, Vasas-FCSM Sporttelep, Illovszky
//    Rudolf Stadion; az FCSM-képre is „Bérelhető” címke.
tx.patch(fay, (p) => p.set({ order: 1 }));
tx.patch(fcsm, (p) => p.set({ order: 2, berelheto: true }));
tx.patch(illovszky, (p) => p.set({ order: 3 }));

// 3. Oldal-szekciók: minden kép kétszer szerepelt (importhiba) — egy-egy példány marad.
const szekciok = await client.fetch(`*[_type == "oldalszekcio"]{ _id, key, images, body }`);
for (const sz of szekciok) {
  if (!sz.images?.length) continue;
  const latott = new Set();
  const egyedi = sz.images.filter((k) => {
    const ref = k.asset?._ref;
    if (!ref || latott.has(ref)) return false;
    latott.add(ref);
    return true;
  });
  if (egyedi.length !== sz.images.length) tx.patch(sz._id, (p) => p.set({ images: egyedi }));
}

// 4. Bemutatkozás: az interjú és a kollégium része lekerül (a szöveg vége).
const bem = szekciok.find((s) => s.key === "bemutatkozas");
const cimIdx = (minta) =>
  (bem?.body ?? []).findIndex(
    (b) => b._type === "block" && b.style?.startsWith("h") && minta.test((b.children ?? []).map((c) => c.text).join(""))
  );
const interju = cimIdx(/interjú Nagy Miklóssal/);
if (interju > 0) {
  tx.patch(bem._id, (p) => p.set({ body: bem.body.slice(0, interju) }));
  console.log(`Bemutatkozás: ${bem.body.length - interju} blokk le (interjú + kollégium).`);
}

// 5. Angyal Péter kikerül a vezetőségből — az edzői stáb rácsába se kerüljön át.
tx.patch("edzo-angyal-peter", (p) => p.set({ featured: false }));

// 6. Vasas FC II saját csapatként, legfelül (a keretet a klub tölti fel).
tx.createIfNotExists({
  _id: "korosztaly-vasas-fc-ii",
  _type: "korosztaly",
  name: "Vasas FC II",
  section: "Vasas FC II",
  order: 5,
});

await tx.commit();

const piszkozatok = await client.fetch(`*[_id in path("drafts.**") && _id in $ids]._id`, {
  ids: ["drafts.beallitasok", `drafts.${fay}`, `drafts.${fcsm}`, `drafts.${illovszky}`, "drafts.edzo-angyal-peter", ...szekciok.map((s) => `drafts.${s._id}`)],
});
if (piszkozatok.length) console.log("FIGYELEM, nyitott piszkozat van ezeken:", piszkozatok);

console.log(
  JSON.stringify(
    await client.fetch(`{
      "beallitasok": *[_id == "beallitasok"][0]{ irodaCim, hirekKezdete, "hirKorosztalyok": count(hirKorosztalyok) },
      "letesitmenyek": *[_type == "letesitmeny"] | order(order asc){ name, order, berelheto },
      "szekcioKepek": *[_type == "oldalszekcio" && defined(images)]{ key, "kepek": count(images) },
      "bemutatkozasBlokk": count(*[_id == "szekcio-bemutatkozas"][0].body),
      "angyal": *[_id == "edzo-angyal-peter"][0].featured,
      "vfc2": *[_id == "korosztaly-vasas-fc-ii"][0]{ name, section, order }
    }`),
    null,
    1
  )
);
