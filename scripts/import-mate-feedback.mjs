// Berkes Máté 2026.09.08-i feedbackjének adat-oldali átvezetése:
// - Bemutatkozás: a Drive-on ma frissített szöveg (versenyeztetési táblával)
// - Stáb: csoportosított szerepkörök + megjelenési sorrend (order mező)
// - Kiss András törlése (már nem stábtag); Kunzmann Egon = Teljesítménymenedzser
// - U10/U12 leány levétele a csapatok oldalról (section: null)
// - Szekciók törlése: képzési modell, Vasas-együttműködés, karitatív, előadások
//   (tartalmuk a Drive-tartalom mappában és a git-történetben megvan)

import { readFile } from "node:fs/promises";
import { createClient } from "@sanity/client";
import path from "node:path";

async function loadEnv() {
  const raw = await readFile(path.resolve(process.cwd(), ".env.local"), "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

let kc = 0;
const k = () => `m${(kc++).toString(36)}`;
const block = (text, style = "normal", listItem) => ({
  _type: "block",
  _key: k(),
  style,
  ...(listItem ? { listItem, level: 1 } : {}),
  markDefs: [],
  children: [{ _type: "span", _key: k(), text, marks: [] }],
});

// ---------------------------------------------------------------- Bemutatkozás

const BEMUTATKOZAS = [
  block("A 2007 óta működő Vasas Kubala Akadémia a nemrég 110 éves jubileumát ünneplő, budapesti Vasas Sport Club labdarúgó-utánpótlás nevelésével foglalkozik, és 2011. december 9-én vette fel Kubala László nevét. Az akadémiai rendszer elsősorban az élsportra fókuszál, elitképzést valósít meg, de a gyerekek élethosszig tartó sportolására való nevelését is nagyon fontos feladatnak tekinti."),
  block("A Vasas Kubala Akadémia célja, hogy részt vállaljon a magyar labdarúgás utánpótlás-nevelésében, és magas színvonalon biztosítsa az ehhez szükséges feltételrendszert. Akadémiánk indulása óta sikeresen működik, fejlődése töretlen ívű, s a jövőre nézve folyamatosan láthatóak a siker újabb és újabb momentumai."),
  block("A labdarúgók képzése 6 éves kortól 19 éves korig zajlik. Az Akadémia képzési rendszerében jelenleg 14 korosztályos fiúcsapat, illetve 6 leány/női korosztályos csapat vesz részt, közel ötven magasan képzett szakember felügyeletével. A szakmai stáb minden tagja a szükséges licenctanfolyamok és szakmai képesítések birtokában dolgozik."),
  block("Államilag elismert sportakadémia", "h3"),
  block("A sportakadémiákról szóló 303/2019. (XII. 12.) Korm. rendelet 9. § (6) bekezdése szerint a sportpolitikáért felelős miniszter az általa vezetett minisztérium honlapján közzétette a hatályos sportakadémiai keret-megállapodással rendelkező sportszervezetek listáját. Az Emberi Erőforrások Minisztériuma labdarúgásban 10 klubbal kötött megállapodást, köztük a Vasas Kubala Akadémiával."),
  block("A Vasas Kubala Akadémia „Államilag elismert sportakadémia” minősítést kapott — a közzétett eredmények alapján a Vasas család tagjai közül labdarúgásban a Vasas Kubala Akadémia révén szerzett a Vasas kiemelt, államilag elismert akadémiai minősítést."),
  block("Az „Államilag elismert akadémiák” egységes feltételrendszer alapján kerültek minősítésre, garantálva ezzel a magas színvonalú képzést és szakmai munkát. A program célja a tehetséggondozással megalapozott minőségi, élvonalbeli utánpótlás-nevelés, felkészítés és versenyeztetés elősegítése."),
  block("Az államilag elismert sportakadémiák listáján labdarúgás sportágban szerepel többek között a Diósgyőr FC, a DLA, az ETO, a Felcsúti Utánpótlás Neveléséért Alapítvány, az FTC, a Honvéd FC, az Illés Sport Alapítvány, az MTK Budapest, a VÁRDA SE Kisvárda — és a Vasas Akadémia Kft."),
  block("Tulajdonosi háttér", "h3"),
  block("Nagy Miklós 2018. június 15-én megvásárolta a Vasas Akadémia Kft. 89%-os üzletrészét György Tamástól, ezzel többségi tulajdont szerezve a Vasas Kubala Akadémiában. Markovits László, a Vasas Sport Club elnöke és Nagy Miklós ugyanezen a napon kétoldalú, 5+5, azaz 10 éves bérleti szerződést kötött a Fáy utcai Sportcentrum használatáról, amelyet a Vasas SC éves közgyűlése megszavazott."),
  block("A Vasas Futball Club Kft., a Vasas Sport Club és a Vasas Akadémia Kft. háromoldalú együttműködési megállapodást kötött 10 éves időtartamra. A felek rögzítették, hogy a Vasas felnőtt csapatának utánpótlását ezen időszak alatt kizárólag a Vasas Kubala Akadémia biztosítja, illetve a Vasas FC az élvonalbeli licenckövetelményeket a Vasas Kubala Akadémiával teljesíti — biztosítva ezzel az utánpótlás-korosztályú játékosok felnőtt csapatba áramoltatását."),
  block("2019. december 20-án Jámbor János értékesítette többségi tulajdonrészét, így Nagy György, Vasas-kötődésű nagyvállalkozó és Nagy Miklós, a Vasas Kubala Akadémia többségi tulajdonosa közösen működteti tovább a Vasas felnőtt labdarúgását. A tulajdonosváltással egy időben a Vasas Futball Kft. taggyűlése Nagy Miklóst választotta meg a Vasas FC ügyvezető igazgatójának — hosszú távon így válhat egységessé a Vasas felnőtt és utánpótlás-labdarúgása."),
  block("Versenyeztetés a 2026/27-es bajnoki évadban", "h3"),
  block("U19 — MLSZ I. osztály, Kiemelt csoport + MLSZ Országos Kupa", "normal", "bullet"),
  block("U17 — MLSZ I. osztály, Kiemelt csoport + MLSZ Országos Kupa", "normal", "bullet"),
  block("U16 — MLSZ I. osztály, Kiemelt csoport + MLSZ Országos Kupa", "normal", "bullet"),
  block("U15 — MLSZ I. osztály, Kiemelt", "normal", "bullet"),
  block("U14 — MLSZ I. osztály, Kiemelt", "normal", "bullet"),
  block("U13 — MLSZ Országos, Dél-Kelet", "normal", "bullet"),
  block("U12 — MLSZ Országos, Dél-Kelet", "normal", "bullet"),
  block("U11 — MLSZ Országos", "normal", "bullet"),
  block("U10 — MLSZ Országos", "normal", "bullet"),
  block("U9 — MLSZ Országos", "normal", "bullet"),
  block("U8 — Grassroots tornák", "normal", "bullet"),
  block("U6–7 — Grassroots tornák", "normal", "bullet"),
  block("Felnőtt női — Női NB II., Keleti csoport", "normal", "bullet"),
  block("U19 leány — MLSZ Regionális, Keleti csoport", "normal", "bullet"),
  block("U16 leány — MLSZ Regionális, Közép csoport", "normal", "bullet"),
  block("U14 leány — MLSZ Regionális HNP, Dél-keleti csoport", "normal", "bullet"),
  block("U12 leány — Grassroots tornák", "normal", "bullet"),
  block("U10 leány — Grassroots tornák", "normal", "bullet"),
  block("„Úrrá lettek a káoszon” — interjú Nagy Miklóssal", "h3"),
  block("„A saját pénzét költi, a saját elképzelései mentén” címmel készített interjút 2019 nyarán Nagy Miklóssal, a Vasas Kubala Akadémia tulajdonosával Pór Károly, a Nemzeti Sport újságírója. Az elmúlt egy évben több fronton is sikereket ért el az Akadémia: az U17-es csapat feljutott az élvonalba, a nyáron korosztályos válogatottakat szerződtettek, miközben több játékos is felkerült az első csapathoz."),
  block("– Hogyan értékeli a Vasas Kubala Akadémiánál eltöltött egy évét? – Abban a helyzetben, amikor átvettem az Akadémia működtetését, a rövid távú cél nem lehetett más, mint a stabil alapok lerakása. Belépésem előtt két héttel közleményben tájékoztatták a közvéleményt a Siófokra költözésről, ami gyakorlatilag a megszűnést jelentette volna. Teljes volt a káosz és a bizonytalanság a játékosok, a szülők és a stábtagok körében egyaránt."),
  block("– Van-e, amiben túlteljesítették az eredeti célokat? – Első lépésként stabilizáltuk a működést: a jogi, üzleti alapokat a magyar futballban példátlanul hosszú távra, tíz évre letettük. Ez kizárólagosságot biztosít a Vasason belül a Kubala Akadémiának a licencjogok és az infrastruktúra használata terén. Az idény közepén átestünk az átfogó akadémiai auditon, megőrizve az akadémiai minősítést. Felső szekciónk két legidősebb korosztálya, az U19 és az U17 egyaránt bajnoki címet ünnepelhetett, így a következő idényben mindegyik csapatunk a kiemelt első osztályban szerepelhet."),
  block("– Ön nemcsak tulajdonosa, hanem sportigazgatója is az Akadémiának. Miért? – Szeretném bebizonyítani, hogy azok a módszerek, az a profi mentalitás, amelyek az üzleti életben sikerre vezetnek, működőképesek a sport területén is. A saját pénzemet költöm, nem másét. Hosszú távra tervezhetek, egy személyben döntök, amit ígérek, azt rajtam lehet számon kérni. Úgy vezetem a klubot, hogy akkor is megállja a helyét, ha az állam esetleg egyszer nem vállal ekkora szerepet a sport támogatásában — ezt a nemzetközi Double Pass audit jelentése külön kiemelte."),
  block("– Több korosztályos válogatottal erősítettek a nyáron. Mit vár ettől? – Saját, korszerű scout-adatbázist hoztunk létre, amelyben naprakészen követjük a legtehetségesebb játékosok fejlődését országszerte. Ebben az átigazolási szezonban több mint negyven játékost igazoltunk, köztük hét korosztályos válogatottat — többek között Farkas Botond (MTK), Horváth Kornél (MTK), Vancsa Zalán (MTK), Fiáth Bence (MOL Fehérvár FC), Földi Dominik (FTC), Bebők Milán (MTK) és Boros Zsombor (UTE) is minket választott."),
  block("– Kulcskérdés lehet, hogyan tudnak együttműködni a Vasas FC-vel? – Az egész üzleti modell akkor logikus és „kerek”, ha a felnőtt csapat és az utánpótlás teljes összhangban, összehangolt üzleti terv szerint dolgozik. Napi szintű és ideális a kapcsolatom a felnőtt csapat szakmai vezetésével: az elmúlt egy évben négy akadémistánk kapott szerződést a felnőtt keretnél, és az új idényben már újabb nyolc akadémista mutatkozhatott be a felnőtt csapatnál. (nemzetisport.hu)"),
  block("Óriási kollégiumi beruházás — szállodai szintű elhelyezés", "h3"),
  block("2019 nyarán elkészült és átadásra került a Vasas Kubala Akadémiához tartozó Pannónia Középiskolás Kollégium felújított akadémiai szárnya. A nagyszabású beruházásnak köszönhetően a blokk az Akadémia vidéki játékosainak biztosít modern, európai színvonalú, szállodai szintű szálláshelyet."),
  block("A kollégium Budapest szívében, a 13. kerületben helyezkedik el: a tömegközlekedés teljes spektruma néhány percre érhető el, és az Akadémia bázisa — az Illovszky Rudolf Stadion és a Fáy utcai Sportcentrum — is kényelmes sétával megközelíthető. Pár perces közelségben található a Hajós Alfréd Nemzeti Sportuszoda, a Palatinus strand, a Margitsziget futópályája és a Szent István park is."),
  block("A kollégium nyolcezer kötetes könyvtára, modern számítógépterme, tanulószobája és tornaterme biztosítja a tanulás és a szabadidő hasznos eltöltésének lehetőségeit; az intézmény szakemberei korrepetálással és az érettségire vagy szakvizsgára való felkészítéssel segítik a kollégium lakóit."),
  block("Az akadémiai szárny az épület második emeletén 18 játékosnak biztosít szobákat, saját folyosóval, fürdőszobával és konyhával. A 200 négyzetméteres területen teljes korszerűsítés történt: új burkolatok, nyílászárók, korszerű elektromos hálózat és világítás. A berendezésnél a környezetbarát, egészséges életmódot szolgáló megoldások domináltak, a szobákba hűtőszekrény, LCD televízió és PlayStation konzol is került, a színvilágban pedig — tisztelegve a hagyományok előtt — a piros-kék színek dominálnak."),
];

// ------------------------------------------------- Stáb: szerepkörök + sorrend

const ROLE_ORDER = [
  // Vezetőedzők — U19-től lefelé, majd női ág
  ["edzo-belvon-attila", "U19 vezetőedző", 10],
  ["edzo-horvath-gabor", "U17 vezetőedző", 11],
  ["edzo-lengyel-patrik", "U16 vezetőedző", 12],
  ["edzo-pfister-erik", "U15 vezetőedző", 13],
  ["edzo-balazs-peter", "U14 vezetőedző", 14],
  ["edzo-olah-daniel", "U13 vezetőedző", 15],
  ["edzo-blaumann-janos", "U12 vezetőedző", 16],
  ["edzo-hegedus-patrik", "U11 vezetőedző", 17],
  ["edzo-ferencz-akos", "U10 vezetőedző", 18],
  ["edzo-kormos-marcell", "U9 vezetőedző", 19],
  ["edzo-nemeth-gergely", "U8-A vezetőedző", 20],
  ["edzo-orosz-david", "U8-B és U5-7 vezetőedző", 21],
  ["edzo-hamori-ferenc", "Felnőtt női csapat vezetőedzője", 22],
  ["edzo-pinter-robert", "U19 és U16 leány vezetőedző", 23],
  ["edzo-ludman-andor", "U14 leány vezetőedző", 24],
  ["edzo-zadori-eniko", "U12 és U10 leány vezetőedző", 25],
  // Asszisztensedzők — Máj, Jekler, Csoszor
  ["edzo-maj-zoltan", "Asszisztensedző", 40],
  ["edzo-jekler-tas", "Asszisztensedző", 41],
  ["edzo-csoszor-gergely", "Asszisztensedző", 42],
  // Erőnléti edzők — Kunzmann (Teljesítménymenedzser), Répási, Kiss Attila, Nagy Barnabás
  ["edzo-kunzmannegon", "Teljesítménymenedzser", 50],
  ["edzo-repasi-laszlo", "Erőnléti edző", 51],
  ["edzo-kiss-attila", "Erőnléti edző", 52],
  ["edzo-nagy-barnabas", "Erőnléti edző", 53],
  // Kapusedzők — Gömöri, Bollók, Szakács, Tulipán (korosztály nélkül)
  ["edzo-gomori-otto", "Kapusedző", 60],
  ["edzo-bollok-gabor", "Kapusedző", 61],
  ["edzo-szakacs-kristof", "Kapusedző", 62],
  ["edzo-tulipan-akos", "Kapusedző", 63],
  // Videóelemzők — Cserpák, Gál, Vadicska
  ["edzo-cserpak-daniel", "Videóelemző", 70],
  ["edzo-gal-matyas", "Videóelemző", 71],
  ["edzo-vadicska-oliver", "Videóelemző", 72],
  // Rehabilitáció — Sárközi, Nagy Lívia (+ Nemes Kristóf, státusza kérdés alatt)
  ["edzo-sarkozi-tamas", "Fizioterapeuta", 80],
  ["edzo-nagy-livia", "Fizioterapeuta", 81],
  ["edzo-nemes-kristof", "Fizioterapeuta", 82],
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

  await client.patch("szekcio-bemutatkozas").set({ body: BEMUTATKOZAS }).commit();
  console.log("OK: Bemutatkozás szövege frissítve (versenyeztetési táblával)");

  for (const [id, role, order] of ROLE_ORDER) {
    await client.patch(id).set({ role, order, featured: true }).commit();
  }
  console.log(`OK: ${ROLE_ORDER.length} stábtag szerepkör + sorrend`);

  await client.delete("edzo-kiss-andras");
  console.log("OK: Kiss András törölve (már nem stábtag)");

  await client.patch("korosztaly-u10-leany").set({ section: null }).commit();
  await client.patch("korosztaly-u12-leany").set({ section: null }).commit();
  console.log("OK: U10 leány + U12 leány levéve a csapatok oldalról");

  for (const id of ["szekcio-kepzesi-modell", "szekcio-egyuttmukodes-vasas", "szekcio-karitativ", "szekcio-eloadasok"]) {
    try {
      await client.delete(id);
      console.log(`OK: ${id} törölve`);
    } catch (e) {
      console.log(`kihagyva: ${id} — ${e.message}`);
    }
  }
  console.log("KÉSZ.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
