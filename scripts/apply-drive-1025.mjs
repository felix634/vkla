// A Drive 2026.10.22-i feltöltéseinek átvezetése (Lenkó Patrick): új bemutatkozó
// szöveg, 2026/27-es szervezeti ábra, javított OSEI-szöveg — és a stáb az ábra szerint.
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

const BEM = "szekcio-bemutatkozas";
const OSEI = "szekcio-egyuttmukodes-osei";
const ABRA = "szekcio-szervezeti-abra";
const EDZOK = ["edzo-angyal-peter", "edzo-toth-csaba", "edzo-ludman-andor", "edzo-zadori-eniko", "edzo-kallay-tamas"];
const PRE_AKADEMIA = ["korosztaly-u11", "korosztaly-u10", "korosztaly-u9", "korosztaly-u8-a", "korosztaly-u8-b", "korosztaly-u5-7"];
const ASSZISZTENSEK = {
  "korosztaly-u19": ["Lengyel Patrik"],
  "korosztaly-u17": ["Pfister Erik", "Máj Zoltán"],
  "korosztaly-u16": ["Belvon Attila"],
  "korosztaly-u15": ["Horváth Gábor", "Máj Zoltán"],
};
const CSAPATOK = [...PRE_AKADEMIA, ...Object.keys(ASSZISZTENSEK), "korosztaly-u12-leany"];

// 0. Mentés az érintett dokumentumokról (csak az első futáskor).
const mentes = new URL("../scraped/mentes-drive-1025.json", import.meta.url);
if (!existsSync(mentes)) {
  const docs = await client.fetch(`*[_id in $ids]`, { ids: [BEM, OSEI, ABRA, ...EDZOK, ...CSAPATOK] });
  writeFileSync(mentes, JSON.stringify(docs, null, 2));
  console.log(`Mentve: ${docs.length} dokumentum → scraped/mentes-drive-1025.json`);
}

const szoveg = (b) => (b.children ?? []).map((c) => c.text).join("");
const tx = client.transaction();

// 1. Bemutatkozás: az új szöveg (ÚJ Bemutatkozás/VKLA bemutatkozás.pdf) a régi
//    bevezető, „Államilag elismert” és „Tulajdonosi háttér” rész helyére; a
//    2026/27-es versenyeztetési lista alatta marad (erre a klubtól választ kérünk).
const BEMUTATKOZAS = [
  "A 2007-ben alapított Vasas Kubala Akadémia a Vasas Futball Club labdarúgó-utánpótlásának központja, a Vasas FC hivatalos és kizárólagos utánpótlás-nevelője. Szakmai munkánk alapja az egységes „Kubala-stílus”, amelynek középpontjában a tehetségek felismerése, képzése és folyamatos fejlesztése áll. Az akadémiai rendszer elsősorban az élsportra és az elitképzésre fókuszál, ugyanakkor fontos célunk, hogy a gyermekeket az élethosszig tartó sportolás szeretetére és az egészséges életmódra is neveljük.",
  "Célunk, hogy aktív szerepet vállaljunk a magyar labdarúgás utánpótlás-nevelésében, és magas színvonalú szakmai, infrastrukturális és képzési feltételeket biztosítsunk a fiatalok számára. A képzés 5 éves kortól 19 éves korig zajlik, jelenleg 14 fiú- és 6 leány/női korosztályos csapat részvételével, közel ötven magasan képzett szakember közreműködésével.",
  "2018-tól új fejlődési szakasz kezdődött a Vasas labdarúgásának egységes szakmai rendszerében, amelynek részeként az akadémia hosszú távú együttműködésben biztosítja a Vasas FC utánpótlását.",
  "A sportakadémiákról szóló 303/2019. (XII. 12.) Korm. rendelet 9. § (6) bekezdése szerint a sportpolitikáért felelős miniszter az általa vezetett minisztérium honlapján közzétette a hatályos sportakadémiai keret-megállapodással rendelkező sportszervezetek listáját. Az Emberi Erőforrások Minisztériuma labdarúgásban 10 klubbal kötött megállapodást, köztük a Vasas Kubala Akadémiával.",
  "A Vasas Kubala Akadémia 2019-ben „Államilag elismert sportakadémia” minősítést kapott, amely fontos szakmai elismerése az akadémián folyó munkának. A minősítés egységes szakmai és működési feltételekhez kötött, célja a magas színvonalú tehetséggondozás, utánpótlás-nevelés, felkészítés és versenyeztetés biztosítása.",
  "A Vasas Kubala Akadémia küldetése, hogy a Vasas szellemiségét képviselve olyan fiatal labdarúgókat neveljen, akik szakmailag, fizikailag és emberileg is készen állnak a következő szintre – és közülük minél többen eljuthassanak a Vasas FC felnőttcsapatáig.",
];
const bem = await client.fetch(`*[_id == $id][0]{ body }`, { id: BEM });
if (szoveg(bem.body[0]) !== BEMUTATKOZAS[0]) {
  const verseny = bem.body.findIndex(
    (b) => b._type === "block" && b.style?.startsWith("h") && /Versenyeztetés/.test(szoveg(b))
  );
  if (verseny < 0) throw new Error("Nem találom a versenyeztetési listát a Bemutatkozásban.");
  const uj = BEMUTATKOZAS.map((text, i) => ({
    _type: "block",
    _key: `uj${i}`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `uj${i}s`, text, marks: [] }],
  }));
  tx.patch(BEM, (p) => p.set({ body: [...uj, ...bem.body.slice(verseny)] }));
  console.log(`Bemutatkozás: ${verseny} régi blokk helyett ${uj.length} új bekezdés, a versenyeztetési lista marad.`);
}

// 2. OSEI: az új docx csak igeidőt javított (jövő → jelen) és a szezon írásmódját.
const OSEI_CSERE = [
  ["2022-23-as", "2022/23-as"],
  ["kiterjednek majd,", "kiterjednek,"],
  ["vizsgálni fogják", "vizsgálják"],
  ["főszerepet kap majd", "főszerepet kap"],
  ["fogja majd össze", "fogja össze"],
];
const osei = await client.fetch(`*[_id == $id][0]{ body }`, { id: OSEI });
let oseiValtozott = false;
const oseiBody = osei.body.map((b) => {
  if (b._type !== "block" || b.children?.length !== 1) return b;
  let t = b.children[0].text;
  for (const [regi, uj] of OSEI_CSERE) t = t.split(regi).join(uj);
  if (t === b.children[0].text) return b;
  oseiValtozott = true;
  return { ...b, children: [{ ...b.children[0], text: t }] };
});
if (oseiValtozott) {
  tx.patch(OSEI, (p) => p.set({ body: oseiBody }));
  console.log("OSEI: igeidő-javítások átvezetve.");
}

// 3. Szervezeti ábra (Szervezeti ábra/VKLA Szervezeti felépítés 2026-27 Nevekkel.png)
//    a széles fejléc-kép helyére — az Akadémia oldal ettől jeleníti meg a szekciót.
const abra = await client.fetch(`*[_id == $id][0]{ "kep": headerImage.asset._ref }`, { id: ABRA });
if (!abra?.kep) {
  const png = readFileSync(
    new URL("../../Website - drive contents/10.22/Szervezeti ábra/VKLA Szervezeti felépítés 2026-27 Nevekkel.png", import.meta.url)
  );
  const asset = await client.assets.upload("image", png, { filename: "vkla-szervezeti-felepites-2026-27.png" });
  tx.createIfNotExists({ _id: ABRA, _type: "oldalszekcio", key: "szervezeti-abra", title: "Szervezeti ábra" });
  tx.patch(ABRA, (p) =>
    p.set({ headerImage: { _type: "image", asset: { _type: "reference", _ref: asset._id } } })
  );
  console.log(`Szervezeti ábra feltöltve: ${asset._id}`);
}

// 4. Stáb az ábra szerint: Akadémiai szekció U19–U14 (Tóth Csaba), Pre-akadémiai
//    szekció U13–U5-7 (Angyal Péter). Angyal Péter csak a vezetőségből került ki.
tx.patch("edzo-angyal-peter", (p) => p.set({ featured: true, role: "Pre-akadémiai szekció vezetője" }));
tx.patch("edzo-toth-csaba", (p) => p.set({ role: "Szakmai vezető, akadémiai szekció vezetője" }));
tx.patch("edzo-ludman-andor", (p) => p.set({ role: "U14 és U12 leány vezetőedző" }));
tx.patch("edzo-zadori-eniko", (p) => p.set({ role: "U10 leány vezetőedző" }));
tx.createIfNotExists({
  _id: "edzo-kallay-tamas",
  _type: "edzo",
  name: "Dr. Kállay Tamás",
  role: "Egészségügy és rehabilitáció vezetője",
  order: 79,
  featured: true,
});
tx.patch("korosztaly-u12-leany", (p) => p.set({ coach: { _type: "reference", _ref: "edzo-ludman-andor" } }));
for (const [id, nevek] of Object.entries(ASSZISZTENSEK)) tx.patch(id, (p) => p.set({ assistants: nevek }));
// Az U11–U5-7 csapatok eddig szekció nélkül, rejtve voltak (09.08 óta nyitott kérdés).
for (const id of PRE_AKADEMIA) tx.patch(id, (p) => p.set({ section: "Pre-akadémia" }));

await tx.commit();

const piszkozatok = await client.fetch(`*[_id in $ids]._id`, {
  ids: [BEM, OSEI, ABRA, ...EDZOK, ...CSAPATOK].map((id) => `drafts.${id}`),
});
if (piszkozatok.length) console.log("FIGYELEM, nyitott piszkozat van ezeken:", piszkozatok);

console.log(
  JSON.stringify(
    await client.fetch(
      `{
      "bemutatkozas": *[_id == $bem][0]{ "blokk": count(body), "eleje": pt::text(body[0]) },
      "osei": pt::text(*[_id == $osei][0].body[1]),
      "abra": *[_id == $abra][0]{ key, title, "kep": headerImage.asset->{ url, "meret": metadata.dimensions } },
      "edzok": *[_id in $edzok]{ name, role, featured, order },
      "csapatok": *[_id in $csapatok] | order(order asc){ name, section, "coach": coach->name, assistants }
    }`,
      { bem: BEM, osei: OSEI, abra: ABRA, edzok: EDZOK, csapatok: CSAPATOK }
    ),
    null,
    1
  )
);
