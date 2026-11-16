// Tóth Patrik 2. körös módosítási listájának (2026.11.16., „HONLAPFEJLESZTÉS – 2. KÖR”)
// tartalmi (Sanity) része. Idempotens: többször futtatva is ugyanazt az állapotot adja.
// Az érintett dokumentumok eredeti állapotát előbb a git-ignorált scraped/ mappába menti.
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

const EM = "—"; // — gondolatjel helyett
const EN = "–"; // – nagykötőjel kell (magyar tipográfia)

// Szponzorok weboldala: a régi vkla.hu logó-linkjei alapján; az LGR (Lounge Group)
// a régi oldalon nem szerepelt, a cég saját oldala a lounge.hu.
const SZPONZOR_URL = {
  "szponzor-allianz": "https://www.allianz.hu/",
  "szponzor-lgr": "https://lounge.hu/",
  "szponzor-mizse": "https://www.mizseviz.hu/",
  "szponzor-prima": "https://www.primaenergia.hu/",
  "szponzor-rc-cont": "https://realcont.hu/",
  "szponzor-smp-solutions": "https://smpsolutions.hu/",
};

const FIX_ID = [
  "beallitasok",
  "szekcio-bemutatkozas",
  "edzo-hegedus-patrik",
  "edzo-szakacs-kristof",
  "edzo-toth-csaba",
  "edzo-angyal-peter",
  "korosztaly-u9",
  "korosztaly-u10",
  "korosztaly-u11",
  "korosztaly-vasas-fc-ii",
  "allas-sportmasszor",
  ...Object.keys(SZPONZOR_URL),
];

// Minden közzétett dokumentum, amelyben gondolatjel van (a hírekkel együtt).
const gondolatjeles = await client.fetch(
  `*[!(_id in path("drafts.**")) && !(_type match "sanity.*") && !(_type match "system.*")]`
).then((docs) => docs.filter((d) => JSON.stringify(d).includes(EM)));
const hetirendFcII = await client.fetch(`*[_type == "hetirend" && korosztaly == "Vasas FC II"]{ _id }`);
const piszkozatok = await client.fetch(`*[_id in path("drafts.**")]{ _id }`);
if (piszkozatok.length) console.log(`Figyelem: ${piszkozatok.length} piszkozat van a Studióban:`, piszkozatok.map((d) => d._id).join(", "));

// 0. Mentés (csak az első futáskor).
const mentes = new URL("../scraped/mentes-patrik-1116.json", import.meta.url);
if (!existsSync(mentes)) {
  const ids = [...new Set([...FIX_ID, ...gondolatjeles.map((d) => d._id), ...hetirendFcII.map((d) => d._id)])];
  const docs = await client.fetch(`*[_id in $ids]`, { ids });
  writeFileSync(mentes, JSON.stringify(docs, null, 2));
  console.log(`Mentés: ${docs.length} dokumentum → scraped/mentes-patrik-1116.json`);
}

const tx = client.transaction();

// 1. Hírek korosztály-szűrője: U13L és U11L csapat nincs.
tx.patch("beallitasok", (p) => p.unset(['hirKorosztalyok[_key=="u13l"]', 'hirKorosztalyok[_key=="u11l"]']));

// 2. Bemutatkozás: a versenyeztetési lista alatti két kép lekerül (az első, a szöveg melletti kép marad).
tx.patch("szekcio-bemutatkozas", (p) => p.unset(['images[_key=="k3e"]', 'images[_key=="k3g"]']));

// 3. Gondolatjel (—) → nagykötőjel (–) minden szövegben. Csak a megváltozott felső szintű mezők íródnak.
const csere = (v, kulcs) => {
  if (typeof v === "string") return kulcs?.startsWith("_") ? v : v.split(EM).join(EN);
  if (Array.isArray(v)) return v.map((x) => csere(x));
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, csere(x, k)]));
  return v;
};
for (const d of gondolatjeles) {
  const set = {};
  for (const [k, v] of Object.entries(d)) {
    if (k.startsWith("_")) continue;
    const uj = csere(v, k);
    if (JSON.stringify(uj) !== JSON.stringify(v)) set[k] = uj;
  }
  if (Object.keys(set).length) {
    // A Bemutatkozás képei a 2. lépésben törlődnek – azt a mezőt itt nem írjuk vissza.
    if (d._id === "szekcio-bemutatkozas") delete set.images;
    tx.patch(d._id, (p) => p.set(set));
    console.log(`  – gondolatjel: ${d._type} ${d._id} (${Object.keys(set).join(", ")})`);
  }
}

// 4. Hegedüs Patrik neve rövid ü-vel (edző és az U10 asszisztensei között).
tx.patch("edzo-hegedus-patrik", (p) => p.set({ name: "Hegedüs Patrik" }));
const u10 = await client.getDocument("korosztaly-u10");
if (u10?.assistants?.some((a) => a.includes("Hegedűs")))
  tx.patch("korosztaly-u10", (p) => p.set({ assistants: u10.assistants.map((a) => a.replace("Hegedűs", "Hegedüs")) }));

// 5. Szakács Kristóf vissza az edzői stábba (kapusedző).
tx.patch("edzo-szakacs-kristof", (p) => p.set({ featured: true }));

// 6. Szekcióvezetők: Tóth Csaba (akadémiai) elöl, mellette Angyal Péter (pre-akadémiai).
tx.patch("edzo-toth-csaba", (p) => p.set({ order: 1 }));
tx.patch("edzo-angyal-peter", (p) => p.set({ order: 2 }));

// 7. „Vasas FC II.” – római szám után pont. A szekció belső értéke („Vasas FC II”)
// marad, mert az a kódban kulcs; a Studio a pontos címet mutatja hozzá.
tx.patch("korosztaly-vasas-fc-ii", (p) => p.set({ name: "Vasas FC II." }));
for (const h of hetirendFcII) tx.patch(h._id, (p) => p.set({ korosztaly: "Vasas FC II." }));
const allas = await client.getDocument("allas-sportmasszor");
if (allas?.title?.includes("Vasas FC II)"))
  tx.patch("allas-sportmasszor", (p) => p.set({ title: allas.title.replace("Vasas FC II)", "Vasas FC II.)") }));

// 8. U11, U10, U9: csak csapatkép, egyéni portrék nélkül.
for (const id of ["korosztaly-u11", "korosztaly-u10", "korosztaly-u9"]) tx.patch(id, (p) => p.set({ csakCsapatkep: true }));

// 9. Szponzorlogók kattinthatók: weboldal-cím.
for (const [id, url] of Object.entries(SZPONZOR_URL)) tx.patch(id, (p) => p.set({ url }));

const res = await tx.commit({ visibility: "async" });
console.log(`Kész: ${res.results.length} módosítás.`);
