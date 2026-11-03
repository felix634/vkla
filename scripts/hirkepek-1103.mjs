// Elmosódott hírképek cseréje (Tóth Patrik jelezte, 2026.11.03.).
// Ahol a cikkben nem volt kép, az import a régi lista 195x97 px-es bélyegképét
// tette indexképnek. Ugyanez a kép a régi oldalon 800x400-ban is megvan
// (uploads/images/news/big/), ezt töltjük fel helyette. A régi oldal
// helykitöltő képe (img_kubala.png) lekerül, ott a klub logója áll a helyén.
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

const docs = await client.fetch(`*[_type == "hir" && defined(heroImage)
  && heroImage.asset->metadata.dimensions.width < 600
  && (heroImage.asset->originalFilename match "images_news_*" || heroImage.asset->originalFilename == "img_kubala.png")]{
  _id, title, heroImage, "fn": heroImage.asset->originalFilename }`);
console.log(`Érintett hír: ${docs.length}`);

const mentes = new URL("../scraped/mentes-hirkepek-1103.json", import.meta.url);
if (!existsSync(mentes)) {
  writeFileSync(mentes, JSON.stringify(docs, null, 2));
  console.log("Mentve → scraped/mentes-hirkepek-1103.json");
}

let csere = 0, levett = 0;
for (const d of docs) {
  if (d.fn === "img_kubala.png") {
    await client.patch(d._id).unset(["heroImage"]).commit();
    levett++;
    continue;
  }
  const fajl = d.fn.replace(/^images_news_/, "");
  const res = await fetch(`https://vkla.hu/uploads/images/news/big/${fajl}`);
  if (!res.ok || !res.headers.get("content-type")?.startsWith("image/")) {
    console.log(`  NINCS NAGY KÉP: ${fajl}  ${d.title}`);
    continue;
  }
  const asset = await client.assets.upload("image", Buffer.from(await res.arrayBuffer()), {
    filename: `images_news_big_${fajl}`,
  });
  await client
    .patch(d._id)
    .set({ heroImage: { _type: "image", asset: { _type: "reference", _ref: asset._id } } })
    .commit();
  csere++;
}
console.log(`Kicserélve: ${csere}, helykitöltő levéve: ${levett}`);
