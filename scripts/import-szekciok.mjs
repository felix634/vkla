// Akadémia/Programok szöveges szekcióinak importja a Drive-tartalomból
// (Drive-tartalom/sections.json alapján). Idempotens.

import { readFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

const BASE = path.resolve(process.cwd(), "..", "Drive-tartalom");
const DRIVE = path.join(BASE, "VKLA - weboldal");

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

// Bekezdés -> Portable Text blokk. A rövid, kettősponttal záruló vagy
// csupa nagybetűs sorok alcímként (h3) jelennek meg.
function toBlock(text) {
  const isHeading =
    (text.length < 70 && /[:?]$/.test(text)) ||
    (text.length < 60 && text === text.toUpperCase() && /[A-ZÁÉÍÓÖŐÚÜŰ]/.test(text));
  return {
    _type: "block",
    _key: k(),
    style: isHeading ? "h3" : "normal",
    markDefs: [],
    children: [{ _type: "span", _key: k(), text, marks: [] }],
  };
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

  const sections = JSON.parse(await readFile(path.join(BASE, "sections.json"), "utf8"));
  const assetCache = {};

  async function upload(rel) {
    if (!rel) return null;
    if (assetCache[rel]) return assetCache[rel];
    try {
      const asset = await client.assets.upload("image", createReadStream(path.join(DRIVE, rel)), {
        filename: path.basename(rel),
      });
      assetCache[rel] = asset._id;
      return asset._id;
    } catch (e) {
      console.error(`  KÉP HIBA: ${rel} — ${e.message}`);
      return null;
    }
  }

  for (const s of sections) {
    const bannerRef = await upload(s.banner);
    const photoRefs = [];
    for (const p of s.photos ?? []) {
      const ref = await upload(p);
      if (ref) photoRefs.push(ref);
    }
    await client.createOrReplace({
      _id: `szekcio-${s.key}`,
      _type: "oldalszekcio",
      key: s.key,
      title: s.title,
      body: s.paras.map(toBlock),
      ...(bannerRef
        ? { headerImage: { _type: "image", asset: { _type: "reference", _ref: bannerRef } } }
        : {}),
      ...(photoRefs.length
        ? {
            images: photoRefs.map((r) => ({
              _type: "image",
              _key: k(),
              asset: { _type: "reference", _ref: r },
            })),
          }
        : {}),
    });
    console.log(`OK: szekcio-${s.key} (${s.paras.length} bek., ${photoRefs.length} fotó)`);
  }
  console.log("KÉSZ.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
