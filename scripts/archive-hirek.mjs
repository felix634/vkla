// Statikus hír-archívum export: a vágási dátum ELŐTTI cikkeket a Sanity-ből
// fájlokba menti, hogy az oldal CMS nélkül is ki tudja szolgálni őket.
//   node scripts/archive-hirek.mjs --cutoff 2024-01-01 [--limit 20]
// Kimenet:
//   content/archiv/index.json          — listaoldali index (cím, dátum, kategória…)
//   content/archiv/cikkek/<slug>.json  — cikkenként a teljes tartalom
//   public/archiv/kepek/<assetId>.webp — webre optimalizált képek (a Sanity CDN
//                                        kicsinyíti, mi csak letöltjük)
// Újrafuttatható: a kész képeket nem tölti le újra (archiv-kep-map.json).
// FONTOS: ez a szkript NEM töröl semmit a Sanity-ből — az a külön,
// kézzel indított záró lépés, az ügyfél jóváhagyása után.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

const args = process.argv.slice(2);
const argVal = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
};
const CUTOFF = argVal("--cutoff", "2024-01-01");
const LIMIT = Number(argVal("--limit", "0"));

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content", "archiv");
const CIKK_DIR = path.join(CONTENT_DIR, "cikkek");
const KEP_DIR = path.join(ROOT, "public", "archiv", "kepek");
const KEP_MAP_FILE = path.join(ROOT, "scraped", "archiv-kep-map.json");

// Cikktörzs-képek: az oldal hasábja ~770px, az 1200-as webp retinán is elég.
const KEP_PARAMS = "?w=1200&fm=webp&q=72";

async function loadEnv() {
  const raw = await readFile(path.join(ROOT, ".env.local"), "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

function assetIdFromUrl(url) {
  // https://cdn.sanity.io/images/<proj>/<ds>/<hash>-<WxH>.<ext> -> <hash>-<WxH>
  const m = url.match(/\/([A-Za-z0-9]+-\d+x\d+)\.\w+$/);
  return m ? m[1] : null;
}

async function downloadKep(url, kepMap) {
  const id = assetIdFromUrl(url);
  if (!id) return null;
  const local = `/archiv/kepek/${id}.webp`;
  if (kepMap[id]) return local;
  const file = path.join(KEP_DIR, `${id}.webp`);
  if (!existsSync(file)) {
    const res = await fetch(url + KEP_PARAMS);
    if (!res.ok) {
      console.error(`  KÉP HIBA (${res.status}): ${url}`);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(file, buf);
  }
  kepMap[id] = true;
  return local;
}

async function main() {
  const env = await loadEnv();
  const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2026-08-01",
    token: env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
  });

  await mkdir(CIKK_DIR, { recursive: true });
  await mkdir(KEP_DIR, { recursive: true });
  const kepMap = existsSync(KEP_MAP_FILE)
    ? JSON.parse(await readFile(KEP_MAP_FILE, "utf8"))
    : {};
  const saveKepMap = () => writeFile(KEP_MAP_FILE, JSON.stringify(kepMap));

  const total = await client.fetch(
    `count(*[_type == "hir" && defined(slug.current) && publishedAt < $cutoff])`,
    { cutoff: CUTOFF }
  );
  console.log(`Vágás: ${CUTOFF} — ${total} cikk kerül archívumba${LIMIT ? ` (teszt: első ${LIMIT})` : ""}.`);

  const index = [];
  const CHUNK = 100;
  const max = LIMIT || total;
  let done = 0;

  for (let from = 0; from < max; from += CHUNK) {
    const to = Math.min(from + CHUNK, max);
    const cikkek = await client.fetch(
      `*[_type == "hir" && defined(slug.current) && publishedAt < $cutoff]
        | order(publishedAt desc, _id asc) [$from...$to]{
        _id, title, "slug": slug.current, publishedAt, category, excerpt, legacy,
        "imageUrl": heroImage.asset->url,
        body[]{ ..., _type == "image" => { ..., "url": asset->url } }
      }`,
      { cutoff: CUTOFF, from, to }
    );

    for (const c of cikkek) {
      if (index.some((i) => i.slug === c.slug)) continue; // lapozási határ-duplikátum
      // képek: vezérkép + törzsképek lokálisra
      const heroLocal = c.imageUrl ? await downloadKep(c.imageUrl, kepMap) : null;
      const body = [];
      for (const block of c.body ?? []) {
        if (block?._type === "image" && block.url) {
          const local = await downloadKep(block.url, kepMap);
          if (local) body.push({ ...block, url: local, asset: undefined });
          // letölthetetlen kép: a blokk kimarad (a CDN-ről úgyis eltűnne törléskor)
        } else {
          body.push(block);
        }
      }

      const cikk = {
        _id: c.slug,
        title: c.title,
        slug: c.slug,
        publishedAt: c.publishedAt,
        category: c.category,
        excerpt: c.excerpt ?? null,
        imageUrl: heroLocal,
        legacy: c.legacy ?? null,
        body,
      };
      await writeFile(path.join(CIKK_DIR, `${c.slug}.json`), JSON.stringify(cikk));
      index.push({
        _id: c.slug,
        title: c.title,
        slug: c.slug,
        publishedAt: c.publishedAt,
        category: c.category,
        excerpt: c.excerpt ?? null,
        imageUrl: heroLocal,
      });
    }
    await saveKepMap();
    done = to;
    console.log(`${done}/${max} cikk kész (${Object.keys(kepMap).length} kép)`);
  }

  index.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
  await writeFile(path.join(CONTENT_DIR, "index.json"), JSON.stringify(index));
  await writeFile(
    path.join(CONTENT_DIR, "meta.json"),
    JSON.stringify({ cutoff: CUTOFF, exportedAt: new Date().toISOString(), count: index.length }, null, 1)
  );
  console.log(`\nKÉSZ: ${index.length} cikk az archívumban, ${Object.keys(kepMap).length} kép.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
