// A régi vkla.hu-n megjelent új hírek átemelése a Sanity-be (élesítésig,
// amíg a klub a régi oldalra is ír). Egy lépésben: friss 2026-os lista →
// új cikkek + képeik letöltése → import. Újrafuttatható; a már átemelt
// cikkeket kihagyja.
//
// Futtatás: node scripts/hirek-frissites.mjs

import { existsSync, readFileSync, renameSync } from "node:fs";
import { execFileSync } from "node:child_process";

const EV = new Date().getFullYear();
const INDEX = `scraped/index-${EV}.json`;

// Az eddigi legfrissebb cikk napja: ennél újabbak képei kellenek.
const elozo = existsSync(INDEX) ? JSON.parse(readFileSync(INDEX, "utf8")) : [];
const since = elozo.map((a) => a.dateIso ?? "").sort().at(-1)?.slice(0, 10) ?? `${EV}-01-01`;
const regiSlugok = new Set(elozo.map((a) => a.slug));
if (existsSync(INDEX)) renameSync(INDEX, `scraped/index-${EV}.elozo.json`);

const futtat = (szkript, args) => execFileSync("node", [szkript, ...args], { stdio: "inherit" });

futtat("scripts/scrape-old-news.mjs", ["--from", String(EV), "--to", String(EV), "--images-from-year", String(EV), "--images-since", since]);

const uj = JSON.parse(readFileSync(INDEX, "utf8")).filter((a) => !regiSlugok.has(a.slug));
console.log(`\nÚj cikk a régi oldalon ${since} óta: ${uj.length}`);
for (const a of uj) console.log(`  ${a.dateRaw}  ${a.title}`);

// A klub néha régebbi dátummal tesz fel cikket (2026.11.16-án 6 ilyen jött).
// Ezek képei az első körben kimaradnak, ezért a legrégebbi új cikk napjától
// még egyszer lefut a letöltés (a cikkek és a meglévő képek a gyorsítótárból jönnek).
const legregebbi = uj.map((a) => a.dateIso ?? "").filter(Boolean).sort()[0]?.slice(0, 10);
if (legregebbi && legregebbi < since) {
  console.log(`\nRégebbi dátumú új cikk is van (${legregebbi}), a képeit is letöltöm.`);
  futtat("scripts/scrape-old-news.mjs", ["--from", String(EV), "--to", String(EV), "--images-from-year", String(EV), "--images-since", legregebbi]);
}

futtat("scripts/import-news.mjs", ["--from-year", String(EV)]);
