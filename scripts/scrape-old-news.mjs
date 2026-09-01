// Régi vkla.hu hírek letöltése (scraper).
//
// Használat:
//   node scripts/scrape-old-news.mjs                 # minden év (2011-2026)
//   node scripts/scrape-old-news.mjs --from 2019     # csak 2019-től
//   node scripts/scrape-old-news.mjs --only-listing  # csak a listák (gyors felmérés)
//
// Kimenet:
//   scraped/index-<év>.json      — évenkénti cikklista (slug, cím, kategória, dátum, indexkép)
//   scraped/articles/<slug>.json — cikkenként: teljes törzs HTML + képlista
//   scraped/images/<fájl>        — az összes hivatkozott kép
//
// Újraindítás-biztos: a már letöltött cikkeket/képeket átugorja.

import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";

const BASE = "https://vkla.hu";
const OUT = path.resolve(process.cwd(), "scraped");
const CONCURRENCY = 4;
const DELAY_MS = 120; // kíméletes tempó az éles szerverükkel
const RETRIES = 3;

const args = process.argv.slice(2);
function argVal(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}
const FROM = Number(argVal("--from", "2011"));
const TO = Number(argVal("--to", "2026"));
// Képeket csak ettől az évtől töltünk (a cikkszöveg minden évre megvan) —
// a teljes képanyag ~25 ezer fájl / ~8-10 GB lenne, feleslegesen.
const IMG_FROM = Number(argVal("--images-from-year", "0"));
const ONLY_LISTING = args.includes("--only-listing");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function fetchText(url) {
  for (let i = 0; i < RETRIES; i++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "VKLA-migracio (Prometheus Digital)" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (i === RETRIES - 1) throw e;
      await sleep(500 * (i + 1));
    }
  }
}

async function downloadFile(url, dest) {
  for (let i = 0; i < RETRIES; i++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "VKLA-migracio (Prometheus Digital)" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
      return true;
    } catch (e) {
      if (i === RETRIES - 1) {
        console.error(`  KÉP HIBA: ${url} — ${e.message}`);
        return false;
      }
      await sleep(500 * (i + 1));
    }
  }
}

// Egyszerű HTML-entitás dekódolás címekhez.
function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&raquo;/g, "»")
    .replace(/&laquo;/g, "«")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&bdquo;/g, "„")
    .replace(/&rsquo;/g, "’")
    .replace(/&hellip;/g, "…")
    .replace(/\s+/g, " ")
    .trim();
}

// "2026.08.19. 10:12" -> ISO (Budapest: nyáron +02, télen +01 közelítés)
function parseDate(s) {
  const m = s?.match(/(\d{4})\.(\d{2})\.(\d{2})\.?\s*(\d{1,2}):(\d{2})?/);
  if (!m) return null;
  const [, y, mo, d, h = "12", mi = "00"] = m;
  const month = Number(mo);
  const offset = month >= 4 && month <= 10 ? "+02:00" : "+01:00";
  return `${y}-${mo}-${d}T${h.padStart(2, "0")}:${mi}:00${offset}`;
}

// Kép-URL -> lapos, egyedi helyi fájlnév (uploads/ alatti útvonalból).
function imageLocalName(url) {
  const clean = url.split("?")[0].replace(/^\.?\//, "").replace(/^uploads\//, "");
  return clean.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function absUrl(src) {
  if (src.startsWith("http")) return src;
  return `${BASE}/${src.replace(/^\.?\//, "")}`;
}

// Évlista feldolgozása: news-item blokkok.
function parseListing(html, year) {
  const items = [];
  const blocks = html.split('<div class="news-item">').slice(1);
  for (const block of blocks) {
    const cat = block.match(/news-category[^>]*>\s*<a[^>]*>([^<]+)</);
    const link = block.match(/<h2 class="news-cim">\s*<a href="\.\/([^"]+)">([\s\S]*?)<\/a>/);
    const img = block.match(/<img class="news-img" src="([^"]+)"/);
    const datum = block.match(/<p class="datum">([^<]+)</);
    if (!link) continue;
    items.push({
      year,
      slug: decodeURIComponent(link[1]).trim(),
      title: decodeEntities(link[2]),
      category: cat ? decodeEntities(cat[1]) : null,
      thumb: img ? img[1] : null,
      dateRaw: datum ? datum[1].trim() : null,
      dateIso: datum ? parseDate(datum[1]) : null,
    });
  }
  return items;
}

// Cikkoldal feldolgozása: cím, kategória, dátum, törzs HTML, képek.
function parseArticle(html) {
  const start = html.indexOf('class="fckeditor-zoom');
  if (start < 0) return null;
  let end = html.indexOf('<p class="back"', start);
  if (end < 0) end = html.indexOf("</body", start);
  const zone = html.slice(start, end);

  const h1 = zone.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  let title = null;
  let category = null;
  if (h1) {
    const catM = h1[1].match(/<a[^>]*>([\s\S]*?)<\/a>/);
    category = catM ? decodeEntities(catM[1]) : null;
    title = decodeEntities(h1[1].replace(/<a[\s\S]*?<\/a>/, "").replace(/<[^>]+>/g, ""));
  }

  const datumM = zone.match(/<p class="datum">([^<]+)</);
  const h1End = h1 ? zone.indexOf(h1[0]) + h1[0].length : 0;
  const datumStart = datumM ? zone.lastIndexOf('<p class="datum">') : zone.length;
  let body = zone
    .slice(h1End, datumStart)
    .replace(/<div class="button[\s\S]*?<\/div>/g, "")
    .replace(/<div class="fb-share-button[\s\S]*?<\/div>/g, "")
    .trim();

  const images = [...body.matchAll(/src="([^"]*uploads[^"]*)"/g)].map((m) => m[1]);

  return {
    title,
    category,
    dateRaw: datumM ? datumM[1].trim() : null,
    dateIso: datumM ? parseDate(datumM[1]) : null,
    bodyHtml: body,
    images,
  };
}

// Egyszerű worker-pool.
async function pool(items, worker) {
  let i = 0;
  let done = 0;
  const errors = [];
  async function run() {
    while (i < items.length) {
      const idx = i++;
      try {
        await worker(items[idx], idx);
      } catch (e) {
        errors.push({ item: items[idx], error: e.message });
        console.error(`  HIBA: ${items[idx].slug ?? items[idx]} — ${e.message}`);
      }
      done++;
      if (done % 100 === 0) console.log(`  ...${done}/${items.length}`);
      await sleep(DELAY_MS);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, run));
  return errors;
}

async function main() {
  await mkdir(path.join(OUT, "articles"), { recursive: true });
  await mkdir(path.join(OUT, "images"), { recursive: true });

  // 1. Évlisták
  const all = [];
  for (let year = FROM; year <= TO; year++) {
    const idxPath = path.join(OUT, `index-${year}.json`);
    let items;
    if (await exists(idxPath)) {
      items = JSON.parse(await readFile(idxPath, "utf8"));
    } else {
      const html = await fetchText(`${BASE}/hirek-${year}`);
      items = parseListing(html, year);
      await writeFile(idxPath, JSON.stringify(items, null, 2));
      await sleep(DELAY_MS);
    }
    console.log(`hirek-${year}: ${items.length} cikk`);
    all.push(...items);
  }

  // Duplikátumok kiszűrése (slug szerint, első előfordulás nyer)
  const seen = new Set();
  const unique = all.filter((a) => {
    if (seen.has(a.slug)) return false;
    seen.add(a.slug);
    return true;
  });
  console.log(`Összesen: ${all.length} tétel, egyedi: ${unique.length}`);
  if (ONLY_LISTING) return;

  // 2. Cikkoldalak
  console.log(`\nCikkek letöltése (${CONCURRENCY} szálon, ${DELAY_MS}ms tempóval)...`);
  const imageUrls = new Set();
  const artErrors = await pool(unique, async (item) => {
    const dest = path.join(OUT, "articles", `${item.slug}.json`);
    let record;
    if (await exists(dest)) {
      record = JSON.parse(await readFile(dest, "utf8"));
    } else {
      const html = await fetchText(`${BASE}/${encodeURI(item.slug)}`);
      const parsed = parseArticle(html);
      if (!parsed) throw new Error("nem található cikk-tartalom");
      record = {
        slug: item.slug,
        year: item.year,
        title: parsed.title || item.title,
        category: parsed.category || item.category,
        dateRaw: parsed.dateRaw || item.dateRaw,
        dateIso: parsed.dateIso || item.dateIso,
        thumb: item.thumb,
        bodyHtml: parsed.bodyHtml,
        images: parsed.images,
      };
      await writeFile(dest, JSON.stringify(record, null, 2));
    }
    const recYear = record.dateIso ? Number(record.dateIso.slice(0, 4)) : record.year;
    if (recYear >= IMG_FROM) {
      if (record.thumb) imageUrls.add(record.thumb);
      for (const img of record.images ?? []) imageUrls.add(img);
    }
  });

  // 3. Képek
  const imgList = [...imageUrls];
  console.log(`\nKépek letöltése: ${imgList.length} db...`);
  let imgSkipped = 0;
  const imgErrors = await pool(imgList, async (src) => {
    const dest = path.join(OUT, "images", imageLocalName(src));
    if (await exists(dest)) {
      imgSkipped++;
      return;
    }
    await downloadFile(absUrl(src), dest);
  });

  console.log(`\nKÉSZ.`);
  console.log(`Cikkek: ${unique.length} (hiba: ${artErrors.length})`);
  console.log(`Képek: ${imgList.length} (már megvolt: ${imgSkipped}, hiba: ${imgErrors.length})`);
  if (artErrors.length) {
    await writeFile(path.join(OUT, "errors.json"), JSON.stringify({ artErrors, imgErrors }, null, 2));
    console.log("A hibák listája: scraped/errors.json");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
