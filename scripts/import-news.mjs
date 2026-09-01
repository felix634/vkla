// Lekapart hírek importja a Sanity-be.
//
// Használat:
//   node scripts/import-news.mjs --dry <slug>     # egy cikk konverziójának ellenőrzése (nem tölt fel)
//   node scripts/import-news.mjs --from-year 2019 # éles import (alapértelmezés: 2019)
//   node scripts/import-news.mjs --from-year 2019 --limit 5   # próba: első 5 cikk
//
// Idempotens: determinisztikus _id-k (createOrReplace) + állapotfájl
// (scraped/import-state.json), újrafuttatásnál a kész cikkeket átugorja.

import { readFile, readdir, writeFile, access } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";
import { htmlToBlocks } from "@sanity/block-tools";
import { Schema as SchemaNamed } from "@sanity/schema";
import { JSDOM } from "jsdom";

const Schema = SchemaNamed;

const OUT = path.resolve(process.cwd(), "scraped");
const STATE_FILE = path.join(OUT, "import-state.json");
const ASSET_MAP_FILE = path.join(OUT, "asset-map.json");

const args = process.argv.slice(2);
function argVal(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}
const FROM_YEAR = Number(argVal("--from-year", "2019"));
const LIMIT = Number(argVal("--limit", "0"));
const DRY_SLUG = argVal("--dry", null);

// --- .env.local betöltése (a token miatt) ---
async function loadEnv() {
  const raw = await readFile(path.resolve(process.cwd(), ".env.local"), "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

// --- Minimális séma a body konverzióhoz (tükrözi a sanity/schemaTypes/hir.ts body mezőjét) ---
const compiled = Schema.compile({
  name: "vkla",
  types: [
    {
      name: "hir",
      type: "document",
      fields: [
        {
          name: "body",
          type: "array",
          of: [{ type: "block" }, { type: "image" }, { type: "youtube" }, { type: "instagram" }],
        },
      ],
    },
    { name: "youtube", type: "object", fields: [{ name: "url", type: "url" }] },
    { name: "instagram", type: "object", fields: [{ name: "url", type: "url" }] },
  ],
});
const bodyType = compiled.get("hir").fields.find((f) => f.name === "body").type;

function imageLocalName(url) {
  const clean = url.split("?")[0].replace(/^\.?\//, "").replace(/^uploads\//, "");
  return clean.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function sanitizeId(slug) {
  return "hir-" + slug.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 100);
}

function youtubeUrl(src) {
  if (!src) return null;
  const m = src.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? `https://www.youtube.com/watch?v=${m[1]}` : null;
}

// HTML -> Portable Text; a képeket/YouTube-iframe-eket előre feltöltött
// asset-referenciákkal (srcToRef) helyettesítjük.
function convertBody(html, srcToRef) {
  const rules = [
    {
      deserialize(el, _next, block) {
        if (el.tagName === "IMG") {
          const src = el.getAttribute("src") ?? "";
          const ref = srcToRef.get(src);
          if (!ref) return undefined; // hiányzó kép: kihagyjuk
          return block({ _type: "image", asset: { _type: "reference", _ref: ref } });
        }
        if (el.tagName === "IFRAME") {
          const url = youtubeUrl(el.getAttribute("src"));
          if (url) return block({ _type: "youtube", url });
          return undefined;
        }
        return undefined;
      },
    },
  ];
  const blocks = htmlToBlocks(html, bodyType, {
    parseHtml: (h) => new JSDOM(h).window.document,
    rules,
  });
  // üres bekezdések kiszűrése
  return blocks.filter((b) => {
    if (b._type !== "block") return true;
    const text = (b.children ?? []).map((c) => c.text ?? "").join("").trim();
    return text.length > 0;
  });
}

function firstParagraphText(blocks) {
  for (const b of blocks) {
    if (b._type === "block") {
      const t = (b.children ?? []).map((c) => c.text ?? "").join("").trim();
      if (t.length > 40) return t.length > 240 ? t.slice(0, 237) + "…" : t;
    }
  }
  return null;
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  // cikkek betöltése
  const files = (await readdir(path.join(OUT, "articles"))).filter((f) => f.endsWith(".json"));
  const articles = [];
  for (const f of files) {
    const a = JSON.parse(await readFile(path.join(OUT, "articles", f), "utf8"));
    const year = a.dateIso ? Number(a.dateIso.slice(0, 4)) : a.year;
    if (year >= FROM_YEAR) articles.push(a);
  }
  articles.sort((a, b) => (a.dateIso ?? "").localeCompare(b.dateIso ?? ""));
  console.log(`Importálandó (>= ${FROM_YEAR}): ${articles.length} cikk`);

  // --dry: csak konverzió, kiírás
  if (DRY_SLUG) {
    const a = articles.find((x) => x.slug === DRY_SLUG) ??
      JSON.parse(await readFile(path.join(OUT, "articles", `${DRY_SLUG}.json`), "utf8"));
    const fakeRefs = new Map((a.images ?? []).map((s) => [s, "image-FAKE-ref"]));
    const blocks = convertBody(a.bodyHtml, fakeRefs);
    console.log(JSON.stringify({
      _id: sanitizeId(a.slug),
      title: a.title,
      slug: a.slug,
      publishedAt: a.dateIso,
      category: a.category,
      excerpt: firstParagraphText(blocks),
      blockCount: blocks.length,
      blocks,
    }, null, 2));
    return;
  }

  // éles import
  const env = await loadEnv();
  if (!env.SANITY_API_WRITE_TOKEN) throw new Error("Hiányzik a SANITY_API_WRITE_TOKEN a .env.local-ból");
  const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2026-08-01",
    token: env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
  });

  const state = (await exists(STATE_FILE)) ? JSON.parse(await readFile(STATE_FILE, "utf8")) : { done: [] };
  const doneSet = new Set(state.done);
  const assetMap = (await exists(ASSET_MAP_FILE)) ? JSON.parse(await readFile(ASSET_MAP_FILE, "utf8")) : {};

  async function uploadImage(srcUrl) {
    const local = imageLocalName(srcUrl);
    if (assetMap[local]) return assetMap[local];
    const p = path.join(OUT, "images", local);
    if (!(await exists(p))) return null;
    try {
      const asset = await client.assets.upload("image", createReadStream(p), { filename: local });
      assetMap[local] = asset._id;
      return asset._id;
    } catch (e) {
      console.error(`  KÉP FELTÖLTÉS HIBA: ${local} — ${e.message}`);
      return null;
    }
  }

  let processed = 0;
  let errors = 0;
  const todo = articles.filter((a) => !doneSet.has(a.slug));
  const list = LIMIT > 0 ? todo.slice(0, LIMIT) : todo;
  console.log(`Ebből még hátravan: ${todo.length}${LIMIT ? `, most: ${list.length}` : ""}`);

  for (const a of list) {
    try {
      if (!a.dateIso) {
        console.log(`  KIHAGYVA (nincs dátum, nem cikk): ${a.slug}`);
        doneSet.add(a.slug);
        continue;
      }
      // törzsképek feltöltése
      const srcToRef = new Map();
      for (const src of a.images ?? []) {
        const ref = await uploadImage(src);
        if (ref) srcToRef.set(src, ref);
      }

      let blocks = convertBody(a.bodyHtml ?? "", srcToRef);
      // Indexkép: a cikk első (nagy felbontású) képe. A listaoldali bélyegkép
      // a régi oldalon mindössze 195x97 px — az csak végső tartalék.
      // Az első képet kivesszük a törzsből, hogy ne szerepeljen duplán.
      let heroRef = null;
      if (blocks[0]?._type === "image" && blocks[0]?.asset?._ref) {
        heroRef = blocks[0].asset._ref;
        blocks = blocks.slice(1);
      } else if (a.thumb) {
        heroRef = await uploadImage(a.thumb);
      }
      const doc = {
        _id: sanitizeId(a.slug),
        _type: "hir",
        title: a.title,
        slug: { _type: "slug", current: a.slug },
        publishedAt: a.dateIso,
        category: a.category ?? "VKLA",
        excerpt: firstParagraphText(blocks),
        body: blocks.map((b, i) => ({ _key: `b${i}`, ...b })),
        legacy: true,
        ...(heroRef
          ? { heroImage: { _type: "image", asset: { _type: "reference", _ref: heroRef } } }
          : {}),
      };
      await client.createOrReplace(doc);
      doneSet.add(a.slug);
      processed++;
      if (processed % 25 === 0) {
        console.log(`  ...${processed}/${list.length}`);
        await writeFile(STATE_FILE, JSON.stringify({ done: [...doneSet] }));
        await writeFile(ASSET_MAP_FILE, JSON.stringify(assetMap));
      }
    } catch (e) {
      errors++;
      console.error(`  HIBA: ${a.slug} — ${e.message}`);
    }
  }

  await writeFile(STATE_FILE, JSON.stringify({ done: [...doneSet] }));
  await writeFile(ASSET_MAP_FILE, JSON.stringify(assetMap));
  console.log(`\nKÉSZ. Importálva most: ${processed}, hiba: ${errors}, összesen kész: ${doneSet.size}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
