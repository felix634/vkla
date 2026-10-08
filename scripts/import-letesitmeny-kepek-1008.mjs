// Létesítményfotók (Patrik, 2026.10.08) feltöltése a Sanity-be.
// A fájlok helye: Drive-tartalom/VKLA - weboldal/1008/. Ami megvan, azt
// feltölti (2400 px-re kicsinyítve), ami hiányzik, azt kihagyja — újra-
// futtatható, a létesítmény első képe mindig a megadott fotó lesz.
//
// Futtatás: node scripts/import-letesitmeny-kepek-1008.mjs

import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createClient } from "@sanity/client";

for (const l of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const i = l.indexOf("=");
  if (i > 0 && /^[A-Z_]+$/.test(l.slice(0, i))) process.env[l.slice(0, i)] = l.slice(i + 1).trim().replace(/^["']|["']$/g, "");
}

const MAPPA = "../Drive-tartalom/VKLA - weboldal/1008";
const KIMENET = "scraped/letesitmeny-1008";
const FOTOK = [
  { fajl: "Vasas_FCSM_Sprttelep.jpg", id: "letesitmeny-fcsm-sporttelep" },
  { fajl: "Stadion_képek-06.jpg", id: "letesitmeny-illovszky-stadion" },
  { fajl: "Fáy utcai Sportcentrum műfüves pálya.jpg", id: "letesitmeny-fay-sportcentrum" },
];

const client = createClient({
  projectId: "c81243u9",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

mkdirSync(KIMENET, { recursive: true });

for (const { fajl, id } of FOTOK) {
  const forras = `${MAPPA}/${fajl}`;
  if (!existsSync(forras)) {
    console.log(`– hiányzik, kihagyva: ${fajl}`);
    continue;
  }
  // Kicsinyítés (a 20–30 MB-os eredetik helyett ~2400 px széles JPEG).
  const cel = `${KIMENET}/${id}.jpg`;
  execFileSync("python", [
    "-c",
    "import sys;from PIL import Image,ImageOps;im=ImageOps.exif_transpose(Image.open(sys.argv[1])).convert('RGB');im.thumbnail((2400,2400));im.save(sys.argv[2],'JPEG',quality=85,optimize=True,progressive=True);print(im.size)",
    forras,
    cel,
  ]);
  const asset = await client.assets.upload("image", readFileSync(cel), { filename: fajl });
  // A klub által esetleg már feltöltött többi kép megmarad, ez kerül az elejére.
  const doc = await client.getDocument(id);
  const tobbi = (doc?.images ?? []).filter((k) => k._key !== "foto1008");
  await client
    .patch(id)
    .set({ images: [{ _type: "image", _key: "foto1008", asset: { _type: "reference", _ref: asset._id } }, ...tobbi] })
    .commit();
  console.log(`✓ ${fajl} → ${id} (${asset.metadata?.dimensions?.width}×${asset.metadata?.dimensions?.height})`);
}
