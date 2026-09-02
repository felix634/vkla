// Drive 3. kör (2026.09.02): létesítmény-leírások, házirend, előadás-leírás.
// Forrás: "Létesítmény leírás_Weboldal.docx", "Házirend_VKLA_Weboldal.docx",
// "Akadémia előadás leírás_Weboldal.docx". Idempotens (createOrReplace / patch).

import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@sanity/client";

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
const k = () => `k${(keyCounter++).toString(36)}`;

const block = (text, style = "normal") => ({
  _type: "block",
  _key: k(),
  style,
  markDefs: [],
  children: [{ _type: "span", _key: k(), text, marks: [] }],
});

// ---------------------------------------------------------------- Létesítmények

const LETESITMENYEK = [
  {
    id: "letesitmeny-fcsm-sporttelep",
    name: "Vasas-FCSM Sporttelep",
    address: "Budapest XIII., Népfürdő utca 49.",
    order: 1,
    body: [
      "A Vasas-FCSM Sporttelep a 13. kerületben, a Duna Aréna szomszédságában, a Népfürdő utca 49. szám alatt található. Egy teljeskörű felújítás után 2026-ban nyitotta meg a kapukat akadémiánk csapatai és bérlőink előtt. A felújítás során a korábbi pályák helyén egy vadonatúj, a legmodernebb technológiával készült 80x48-as műfüves, illetve egy 109x68-as élőfüves pálya épült. A telepen található öltözőépület is teljes felújításon esett át. Itt négy öltöző 3 zuhanyzóval áll a csapatok rendelkezésére. Az edzők számára külön öltöző is került kialakításra, ahol interneteléréssel rendelkező asztali számítógépet tudnak igénybe venni. Itt nyomtatási lehetőség is biztosított. Minden helyiség padlófűtéssel, valamint hűtő-fűtő légkondicionálóval rendelkezik.",
      "A sporttelepen az öltözők zárhatók, az őrzés-védésről 12 órás portaszolgálat gondoskodik (8:00–20:00).",
    ],
    amenities: [
      "80×48 m műfüves pálya",
      "109×68 m élőfüves pálya",
      "4 öltöző, 3 zuhanyzóval",
      "Külön edzői öltöző",
      "Padlófűtés, klíma minden helyiségben",
      "Portaszolgálat 8:00–20:00",
    ],
    rentInfo: null,
  },
  {
    id: "letesitmeny-illovszky-stadion",
    name: "Illovszky Rudolf Stadion",
    address: "1139 Budapest, Fáy utca 58.",
    order: 2,
    body: [
      "A stadionban 9 darab (8 hazai és 1 vendég) büfé található 32 kiszolgálóhellyel. 2 db digitális eredményjelző tábla (30 m² + 42 m²) segíti a lelátón elhelyezkedő szurkolók tájékozódását a mérkőzés pillanatnyi állásáról. 12 db (9 hazai + 3 vendég) pénztár teszi lehetővé a folyamatos és várakozás nélküli jegyvásárlást, hazai oldalon 5 dupla beléptetőkapu, illetve a vendégeknél 1 dupla beléptetőkapu gondoskodik a lelátókra való zavartalan bejutásról. A hazai szurkolók számára 6 férfi, 5 női, 1 akadálymentes (összesen több mint 130 WC-fülke), a vendégdrukkereknek pedig 2 férfi, 2 női, 1 akadálymentes illemhely és mosdó áll rendelkezésre.",
      "A stadionon belül találhatók skyboxok, valamint a Baróti teremre elkeresztelt VIP terem. A VIP vendégek számára fenntartott teremből gyönyörű kilátás nyílik a center füves pályára, amely otthont ad a magyar labdarúgó-bajnokság első osztályában futballozó Vasas FC csapatának. A Vasas Kubala Akadémia, a Vasas FC és a Vasas SC is gyakran rendezi itt évzáró bankettjeit. A helyiségben igény esetén lehetőség van projektoros kivetítésre. A terem hűtő-fűtő rendszerrel van ellátva. Partnerünk igény szerint biztosít kontinentális reggelit, valamint svédasztalos ebédet és vacsorát. A helyiség kiválóan alkalmas bankettek, csapatépítők, évzárók rendezésére.",
    ],
    amenities: [
      "9 büfé, 32 kiszolgálóhely",
      "2 digitális eredményjelző tábla",
      "12 pénztár, dupla beléptetőkapuk",
      "Több mint 130 WC-fülke",
      "Skyboxok",
      "Baróti VIP terem projektorral",
    ],
    rentInfo:
      "A VIP terem és a skyboxok bérelhetők — bankettek, csapatépítők, évzárók helyszínéül is. Árajánlat: info@vkla.hu",
  },
  {
    id: "letesitmeny-fay-sportcentrum",
    name: "Vasas Fáy utcai Sportcentrum",
    address: "1139 Budapest, Fáy utca 58.",
    order: 3,
    body: [
      "A sporttelep a 1139 Budapest, Fáy utca 58. szám alatt található. A sporttelepet a Fáy utca, Béke utca felől gyalog lehet megközelíteni, míg a Hajdú utca felől van lehetőség autós behajtásra. A létesítmény területén található egy-egy nagyméretű füves és műfüves pálya, egy csökkentett méretű műfüves pálya, valamint 4 db 20×40 méteres műfüves pálya. A sportpályákhoz kapcsolódik az öltözőépület, melyben négy vendégöltöző várja a sportolókat. U14–U19-es korosztályaink számára külön elkerített, állandó öltöző áll rendelkezésre. A sporttelep hátsó területén található a konditerem, valamint a rehabilitációs és videóelemző helyiség is.",
    ],
    amenities: [
      "Nagyméretű füves pálya",
      "Nagyméretű műfüves pálya",
      "Csökkentett méretű műfüves pálya",
      "4 db 20×40 m műfüves pálya",
      "4 vendégöltöző + állandó öltözők",
      "Konditerem, rehabilitációs és videóelemző helyiség",
    ],
    rentInfo:
      "A sporttelep pályái bérelhetők, csakúgy, mint a VIP terem és a skyboxok. A bérléssel kapcsolatban árajánlatot, valamint további információkat az info@vkla.hu e-mail címen tudnak az érdeklődők igényelni.",
  },
];

// ------------------------------------------------------------------- Házirend

const HAZIREND = [
  { h: true, t: "Általános kötelmények" },
  { t: "A Vasas Akadémia Korlátolt Felelősségű Társaság (továbbiakban, mint Klub) házirendje, mely vonatkozik minden igazolt labdarúgóra, korosztálytól függetlenül." },
  { t: "A labdarúgó kötelessége, hogy becsülje és tisztelje játékostársait, úgy a pályán, mint a pályán kívül, és köteles a fair play szabályai megtartásával sportolói tevékenységét és sportkapacitását kizárólag a Klub céljainak megfelelően felhasználni, mindent megtenni annak érdekében, hogy szakmai színvonalát megtartsa, fejlessze és köteles tartóztatni magát mindattól, ami a sportolói tevékenységére nézve hátrányos, azzal összeegyeztethetetlen, vagy ellentétben áll." },
  { t: "A labdarúgó köteles a tulajdonosokkal, szponzorokkal, az igazgatókkal, a klub dolgozóival, a csapat edzőivel, valamint a szurkolókkal tisztességtudóan viselkedni!" },
  { t: "Az igazolt labdarúgók a nyilvánosság előtt, közszereplés esetén, amennyiben sportruházatot viselnek, úgy kizárólag az edző által előírt felszerelésben jelenhetnek meg. Ennek betartása kötelező, hazai és idegenbeli mérkőzéseken is, illetve edzőmérkőzéseken!" },
  { t: "A Klub minden sportolásra használt helyiségében (öltözők, edzőtermek, labdarúgópályák, „kispad”) a dohányzás, kábítószer, kábító hatású egyéb anyag, illetve alkohol fogyasztása TILOS!" },
  { t: "A Klub arra meghatalmazott vezetői és alkalmazottai az MLSZ-szel megkötött szerződések értelmében nyilatkozatadási kötelezettséggel bírnak, így az alábbiakat köteles minden labdarúgó betartani:" },
  { t: "a) Csak a Klub ügyvezető igazgatója, sportigazgatója nyilatkozhat a sportszervezet belső életéről, illetve a sportszervezetet érintő külső kapcsolatok (szerződések, igazolások stb.) alakulásáról az üzleti titkok megtartása mellett." },
  { t: "b) A labdarúgó jogosult nyilatkozni a sajtónak az őt érintő kérdésekben (kivételt képeznek a klub házirendjében szereplő tiltások), illetve a pályán nyújtott teljesítményéről. A labdarúgó a sajtónak, nem élő műsorban tett nyilatkozata esetén köteles a nyilatkozatot a megjelenése előtt jóváhagyásra megküldetni a sajtó munkatársával, és azt köteles a Kft. sajtófőnökének bemutatni jóváhagyás végett még azt megelőzően, hogy a megjelenésre a sajtó munkatársának a jóváhagyást megadná azzal, hogy a Kft. sajtófőnöke amennyiben a nyilatkozat sérti jelen házirendet, a nyilatkozat megjelenésével kapcsolatosan módosítási, illetve vétójoga van." },
  { t: "c) A labdarúgó a Klub belső ügyeiről nem nyilatkozhat, tulajdonosait, edzőit, vezetőit, valamint játékostársait nyilvánosan nem minősítheti." },
  { h: true, t: "A labdarúgó további kötelességei" },
  { t: "Kötelező az edzésre felkészülten és pihent állapotban, az edző által meghatározott időpontban, pontosan megjelenni. Kötelező a megbeszélt vagy a leírt időpontok, találkozások pontos betartása!" },
  { t: "A mérkőzésre az edző által meghatározott időpontban megjelenni és a csapat egységes megjelenését ruházatában követni." },
  { t: "A Klubtól átvett tárgyi eszközöket, sportfelszereléseket (pl. labda), sportruházatot megőrizni, megóvni, tisztán tartani, hiánytalanul visszaszolgáltatni. Az elveszett eszközök, felszerelések pótlása a sportoló által történő teljes ár megtérítésével valósul meg." },
  { t: "Minden edzésre és mérkőzésre megfelelő egyéni használatú felszereléssel kell rendelkeznie minden játékosnak — cipő, sípcsontvédő, fásli stb. —, ezek rendben tartására különös gondot kell fordítani, és köteles játékra kész állapotba hozni." },
  { t: "Minden labdarúgó számára az egészségügyi stáb előírása alapján kötelező az előírt vizsgálatokon részt venni. A sportorvosi vizsgálatokon, valamint az ehhez kapcsolódó szakorvosi vizsgálatokon az orvos által előírt időben és módon megjelenni. Sérüléséről vagy betegségéről az edzés megkezdése előtt az orvost és az edzői stábot értesíteni." },
  { t: "Sérülés vagy betegség esetén köteles a csapat orvosát vagy fizioterapeutáját azonnal értesíteni. Nem fekvőbetegség esetén, az orvos egyéb rendelkezésének hiányában a játékos köteles a foglalkozásokon megjelenni." },
  { t: "A sportoló semmiféle gyógyszert, kenőcsöt, patikai készítményt, gyógyterméket, egyéb gyógyhatású készítményt nem használhat (alkalmazhat), vagy vehet be a csapat orvosának engedélye nélkül. Minden játékos köteles a csapat orvosa és fizioterapeutája által előírt, a magyarországi törvények által engedélyezett szereket, vitaminokat és egyéb készítményeket a meghatározott időben elfogyasztani." },
  { t: "A külföldi és belföldi utazások alkalmával köteles a csapat egyenruháját viselni. Ezen kötelezettség alól felmentést, vagy más egyéb ruházat használatát csak az ügyvezető engedélyezheti, illetve rendelheti el." },
  { t: "Köteles a vezetőedző edzéseken és mérkőzéseken kívüli, szakmai jellegű utasításait betartani." },
  { t: "Tartózkodik minden olyan megnyilvánulástól a szakmai és magánéletben egyaránt, mely káros lehet a Klub hírnevére." },
  { t: "A nyilvánossággal való érintkezés során, a sajtóval, rádióval és televízióval készült interjúk alkalmával különös gondot fordít a Klub imázsának ápolására." },
  { t: "A labdarúgó nem vehet részt sportfogadásban, azaz labdarúgó sporteseményekre nem fogadhat sem közvetlenül, sem esetlegesen közvetetten megbízott közreműködésével." },
  { t: "A labdarúgó köteles tartózkodni a dohányzástól, kábítószer, kábító hatású egyéb anyag, illetve alkohol fogyasztásától, illetve az ezzel kapcsolatos vizsgálatoknak köteles alávetnie magát." },
  { h: true, t: "Közösségi média használatával kapcsolatos szabályok" },
  { t: "A Klub jogos gazdasági érdekeinek, jó hírnevének és a szerződésekben vállalt üzleti titkok megtartásának védelme érdekében, a labdarúgók esetében a közösségi média használatával kapcsolatban (Facebook és egyéb nyilvános fórumok) az alábbi eljárásrend betartását rendelem el." },
  { t: "A közösségi oldalakon közölt információk, vélemények, adatok: a) nem sérthetik a Klub jó hírnévhez fűzött alapvető jogát, érdekét; b) nem járhatnak a Klub jogos gazdasági érdekének veszélyeztetésével, nem sérthetik a gazdasági érdekeket; c) a bejegyzések nem tartalmazhatnak sértő, trágár kijelentéseket, tartalmakat; d) nem tartalmazhatnak olyan tartalmakat, amelyek alkalmasak lehetnek más személyek, illetve más sportszervezet, illetve az MLSZ és/vagy más sportszövetség, azok alkalmazottjai, illetve szerződéses partnerei, közreműködői — különösen beleértve a játékvezetőket — megsértésére." },
  { t: "A Klub jó hírnevének megsértése körébe tartozik különösen a Klub működésére vonatkozó valótlan tényállítás, vagy a valós tényeknek hamis színben való feltüntetése." },
  { t: "A Klub munkatársait, más sportolót, illetve sportszervezetet, valamint az MLSZ-t és/vagy más sportszövetséget, azok alkalmazottjait, illetve szerződéses partnereit, közreműködőit — különösen beleértve a játékvezetőket — személyüket vagy munkájukat érintően nem lehet becsületsértésre alkalmas, vagy szabálysértési, fegyelmi eljárás, vagy büntetőjog hatálya alá tartozó cselekménnyel vagy mulasztással rágalmazni, valótlan vagy valós tényeket hamis színben feltüntetve közölni, híresztelni." },
  { h: true, t: "Egyéb rendelkezések" },
  { t: "A labdarúgónak az öltözőben, az edzéseken, az edzőmérkőzéseken, az edzőtáborokban és az utazások során is meg kell felelnie a Klub vezetése által meghatározott erkölcsi normáknak, melyek magukban foglalják a viselkedés, a verbális és nonverbális kommunikáció minden elemét. Egymás tisztelete képezi a Klub erkölcsi normáinak alapelemét, melynek kortól, nemtől, nemzeti hovatartozástól, nemzetiségtől, bőrszíntől, vallási és politikai nézettől, valamint világnézettől függetlenül mindig érvényesülnie kell." },
  { t: "Játékos jelen házirend átvételével kifejezetten hozzájárul ahhoz, hogy személyes adatai, illetve a rá vonatkozó, őt ábrázoló kép-, videó- és hangfelvételek a sportolói jogviszonya ellátásával összefüggésben a Klub adatbázisába felvételre kerüljenek, és felhatalmazza a Klubot, hogy ezen adatokat és felvételeket a kommunikációs felületein szabadon felhasználja." },
  { t: "A házirend bármelyik pontját az ügyvezető igazgató, a sportigazgató vagy a vezetőedző, eseti elbírálás és eseti megítélés alapján, az ezzel együtt járó felelősség átvállalásával megváltoztathatja." },
  { t: "Ha a labdarúgó önhibáján kívüli okból a Házirend bármely pontját nem tudja betartani, úgy felmentés iránti kérelmével az ügyvezető igazgatóhoz vagy a sportigazgatóhoz kell, hogy forduljon." },
  { t: "Abban az esetben, ha a labdarúgó jelen Házirend bármely pontját megsérti, úgy az ügyvezető vagy az általa kijelölt munkavállaló a Játékost írásbeli figyelmeztetésben részesítheti, büntetést szabhat ki rá, súlyos esetekben a képzés alól felmentheti." },
];

// ---------------------------------------------------- Akadémiai előadások szöveg

const ELOADASOK = [
  "Akadémiánkon az edukációt kiemelten fontosnak tartjuk. A sportolóink számára lehetőség van sportpszichológiai, sportdietetikai konzultációra, így segítve az egészséges fejlődésüket. A pályán kívüli lehetőségek mellett folyamatos videóelemzési és szakmai kommunikáció zajlik stábunk és sportolóink között, így segítve hosszú távon a sportágban maradást.",
  "A szülők szerepe kiemelten fontos az utánpótlássportban, így 2025-től bevezettünk úgynevezett Szülői Edukációs alkalmakat, amikor online és offline előadásokat van lehetősége a szülőknek meghallgatni olyan témákban, melyek segítségükre lehetnek sportoló gyermekeik nevelésében.",
  "Természetesen edzőink sem maradnak ki a képzésekből. Stábunk részére olyan eseményeket szervezünk, mint az elsősegély- és újraélesztési tanfolyam, külsős és belsős előadók által tartott szakmai előadások, valamint évente részt vesznek szakembereink gyermekvédelmi képzéseken is." ,
];

// ------------------------------------------------------------------------ main

async function main() {
  const env = await loadEnv();
  const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2026-08-01",
    token: env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
  });

  for (const l of LETESITMENYEK) {
    await client.createOrReplace({
      _id: l.id,
      _type: "letesitmeny",
      name: l.name,
      address: l.address,
      order: l.order,
      body: l.body.map((t) => block(t)),
      amenities: l.amenities,
      ...(l.rentInfo ? { rentInfo: l.rentInfo } : {}),
    });
    console.log(`OK: ${l.id}`);
  }

  await client.createOrReplace({
    _id: "szekcio-hazirend",
    _type: "oldalszekcio",
    key: "hazirend",
    title: "Házirend",
    body: HAZIREND.map((p) => block(p.t, p.h ? "h3" : "normal")),
  });
  console.log("OK: szekcio-hazirend");

  await client
    .patch("szekcio-eloadasok")
    .set({ body: ELOADASOK.map((t) => block(t)) })
    .commit();
  console.log("OK: szekcio-eloadasok body frissítve");

  console.log("KÉSZ.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
