// Drive 4. kör (2026.09.03 esti mappák): adatvédelmi PDF-ek, fapótlási
// TAO-felhívás, Házirend-PDF csere, "Támogassa Ön is" szöveg a TAO-oldalra.
// Idempotens (createOrReplace / set).

import { readFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

const DRIVE = path.resolve(process.cwd(), "..", "Drive-tartalom", "VKLA - weboldal");

async function loadEnv() {
  const raw = await readFile(path.resolve(process.cwd(), ".env.local"), "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

let keyCounter = 0;
const k = () => `t${(keyCounter++).toString(36)}`;

const block = (text, opts = {}) => ({
  _type: "block",
  _key: k(),
  style: opts.style ?? "normal",
  ...(opts.listItem ? { listItem: opts.listItem, level: 1 } : {}),
  markDefs: opts.markDefs ?? [],
  children: opts.children ?? [{ _type: "span", _key: k(), text, marks: [] }],
});

const DOKUMENTUMOK = [
  { id: "dok-adatkezelesi-tajekoztato", title: "Adatkezelési Tájékoztató", category: "Adatvédelem", file: "Adatvédelem/Adatkezelési Tájékoztató.pdf" },
  { id: "dok-adatkezelesi-tajekoztato-papir", title: "Adatkezelési Tájékoztató — papír alapú formátum", category: "Adatvédelem", file: "Adatvédelem/Adatkezelési Tájékoztató - papír alapú formátum.pdf" },
  { id: "dok-adatvedelmi-szemelyes", title: "Adatvédelmi tájékoztató személyes adatok kezeléséről", category: "Adatvédelem", file: "Adatvédelem/Adatvédelmi tájékoztató személyes adatok kezeléséről.pdf" },
  { id: "dok-adatvedelmi-allashirdetes", title: "Adatvédelmi tájékoztató álláshirdetésre jelentkezők részére", category: "Adatvédelem", file: "Adatvédelem/Adatvédelmi tájékoztató álláshirdetésre jelentkezők részére.pdf" },
  { id: "dok-felhivas-fapotlas-2026", title: "Nyílt pályázati felhívás fapótlási projektre - 2026.09.03", category: "TAO", year: "2026", file: "TAO-program/Nyílt pályázati felhívás fapótlási projektre - 2026.09.03.pdf" },
];

async function main() {
  const env = await loadEnv();
  const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2026-08-01",
    token: env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
  });

  // 1) új dokumentumok
  for (const d of DOKUMENTUMOK) {
    const asset = await client.assets.upload("file", createReadStream(path.join(DRIVE, d.file)), {
      filename: path.basename(d.file),
    });
    await client.createOrReplace({
      _id: d.id,
      _type: "dokumentum",
      title: d.title,
      category: d.category,
      ...(d.year ? { year: d.year } : {}),
      file: { _type: "file", asset: { _type: "reference", _ref: asset._id } },
    });
    console.log(`OK: ${d.title}`);
  }

  // 2) Házirend: a régi 2018-as docx helyett az aktuális szövegből készült PDF
  const pdf = await client.assets.upload("file", createReadStream(path.join(DRIVE, "Házirend", "Házirend.pdf")), {
    filename: "Házirend.pdf",
  });
  await client
    .patch("dok-hazirend")
    .set({ file: { _type: "file", asset: { _type: "reference", _ref: pdf._id } } })
    .commit();
  console.log("OK: Házirend dokumentum -> PDF (aktuális szöveg)");

  // 3) "Támogassa Ön is a Vasas Kubala Akadémiát!" — szöveges szekció a TAO-oldalra
  const emailKey = k();
  const body = [
    block(
      "Az elmúlt években akadémiánk jelentős fejlesztéseken esett át, melyekre nagyon büszkék vagyunk, s hisszük, hogy a beruházások már rövid távon is az akadémiánkon nevelkedő sportolók fejlődését szolgálják. A Vasas Akadémia Kft. közel 400 sportolónak nyújt sportolási és versenyzési lehetőséget. A napi működésen kívül a hazai bajnokságokban, kupákban, színvonalas hazai és nemzetközi tornákon való részvételhez, a létesítmény fejlesztéséhez, a szakmai munka tökéletesítéséhez nyújt segítséget az eddig és a jövőben kapott támogatás."
    ),
    block(
      "2011. július 1. óta hatályban van a látvány-csapatsportok támogatásának rendszere. Ennek lényege, hogy a Magyarországon társasági adót fizető vállalkozások a társasági adó fizetési kötelezettségüket látvány-csapatsport szervezetek támogatásával is teljesíthetik. Ennek kétféle módja van:"
    ),
    block(
      "Közvetlen támogatás esetén maga a támogatás csökkenti a társaság adóalapját, azaz a támogatással a vállalkozás tényleges adómegtakarítást érhet el — az adóelőny a támogatás 2,25%-a.",
      { listItem: "bullet" }
    ),
    block(
      "Az adóhatóságnál történő rendelkezés alapján társasági adóelőlegből vagy adófeltöltésből — vagyis még az adóévben — nyújtott támogatás esetén a tényleges adómegtakarítás maximális mértéke a felajánlott adó 7,5%-a, míg a társasági adóbevallásból — már az adóévet követő évben — történő rendelkezés esetén a megtakarítás a felajánlás átutalt összegének 2,5%-a, amelyet adójóváírás formájában kap meg a támogató.",
      { listItem: "bullet" }
    ),
    block(
      "A támogatáshoz annyit kell tenni, hogy az adott vállalkozás támogatási szerződést köt a Vasas Akadémia Kft.-vel. Ezt követően a jóváhagyásra jogosult szervezet kiállítja az adókedvezmény igénybevételéhez szükséges igazolást. A támogató a fizetendő társasági adójának terhére átutalja a kedvezményezett sportszervezet részére a támogatás összegét (közvetlen támogatás), vagy a társasági adófizetési kötelezettségét a hagyományos módon teljesíti a NAV felé, és egyúttal rendelkező nyilatkozatot ad az adóhatóság részére, amelyet már az adóhatóság továbbít a támogatott sportszervezet felé."
    ),
    block(
      "Törvény biztosítja, hogy a támogatás felhasználásával kapcsolatban a támogatót semmiféle felelősség vagy ellenőrzési kötelezettség nem terheli."
    ),
    block(
      "A TAO-támogatáson túlmenően akadémiánk egyéb, szponzorációs jellegű támogatásokat is hálásan fogad. Ezen támogatások esetében a Vasas Akadémia Kft. ellenszolgáltatásként széles eléréssel rendelkező reklámfelületeket biztosít támogató partnerei számára — többek között online közösségimédia-felületeinken, valamint rendezvényeinken és létesítményeinkben."
    ),
    block(null, {
      markDefs: [{ _type: "link", _key: emailKey, href: "mailto:k.kovacs@vkla.hu" }],
      children: [
        { _type: "span", _key: k(), text: "Amennyiben a sporttámogatással vagy annak akadémiánkon alkalmazható lehetőségeivel kapcsolatban kérdése, észrevétele, támogatási szándéka van, kérjük, a ", marks: [] },
        { _type: "span", _key: k(), text: "k.kovacs@vkla.hu", marks: [emailKey] },
        { _type: "span", _key: k(), text: " e-mail címen vagy a +36 20 852 7950 telefonszámon lépjen kapcsolatba Kovács Krisztina TAO-munkatárssal.", marks: [] },
      ],
    }),
  ];

  await client.createOrReplace({
    _id: "szekcio-tao-tamogatas",
    _type: "oldalszekcio",
    key: "tao-tamogatas",
    title: "Támogassa Ön is a Vasas Kubala Akadémiát!",
    body,
  });
  console.log("OK: szekcio-tao-tamogatas");
  console.log("KÉSZ.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
