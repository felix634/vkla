// Kép nélkül átjött idei hírek pótlása (2026.11.16.). A régebbi dátummal
// utólag feltett cikkek képeit a hirek-frissites.mjs eddig nem töltötte le,
// így az import kép nélkül vette fel őket. Ahol a régi lista mutat képet
// (uploads/images/news/big/), azt tesszük be indexképnek. A helykitöltős
// cikkekhez (nincs lista-kép) nem nyúlunk: ott a klub logója áll.
// Idempotens. Az eredeti állapotot előbb a git-ignorált scraped/ mappába menti.
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

const EV = new Date().getFullYear();
const lista = JSON.parse(readFileSync(new URL(`../scraped/index-${EV}.json`, import.meta.url), "utf8"));
const thumbs = new Map(lista.map((a) => [a.slug, a.thumb]));

const docs = await client.fetch(
  `*[_type == "hir" && publishedAt >= $tol && !defined(heroImage)]{ _id, title, "slug": slug.current }`,
  { tol: `${EV}-01-01` }
);
const javitando = docs.filter((d) => thumbs.get(d.slug)?.includes("uploads/images/news/"));
console.log(`Kép nélküli idei hír: ${docs.length}, ebből van kép a régi listán: ${javitando.length}`);

const mentes = new URL("../scraped/mentes-hirkepek-1116.json", import.meta.url);
if (!existsSync(mentes)) writeFileSync(mentes, JSON.stringify(docs, null, 2));

for (const d of javitando) {
  const src = thumbs.get(d.slug);
  const res = await fetch(`https://vkla.hu/${src.replace(/^\.?\//, "")}`);
  if (!res.ok || !res.headers.get("content-type")?.startsWith("image/")) {
    console.log(`  NINCS KÉP: ${src}  ${d.title}`);
    continue;
  }
  const asset = await client.assets.upload("image", Buffer.from(await res.arrayBuffer()), {
    filename: src.split("?")[0].replace(/^\.?\//, "").replace(/^uploads\//, "").replace(/[^a-zA-Z0-9._-]/g, "_"),
  });
  await client
    .patch(d._id)
    .set({ heroImage: { _type: "image", asset: { _type: "reference", _ref: asset._id } } })
    .commit();
  console.log(`  KÉSZ: ${d.title}`);
}
