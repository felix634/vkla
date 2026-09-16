// Berkes Máté 2026.09.16-i kérése: a "Sportiskolai és kollégiumi háttér"
// szekcióból (szekcio-oktatasi-program) az alábbiak törlése:
// - Szervezési vezető (Kiss Dávid) elérhetőség + ügyintézési idők blokk
//   (a hozzá tartozó, egyedül maradó "Kapcsolat:" alcímmel együtt)
// - Pannónia Kollégium cím/elérhetőség blokk
// - a kollégium-átadásról szóló két bekezdés
// - a 10 éves megállapodás konkrétumai a nyitott-modell mondatból
//   ("10 éves", "a most felújított és átadott épületszárny területére",
//    "ezen időszak alatt" — a mondat többi része marad)
// Idempotens: újrafuttatva nem változtat tovább.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@sanity/client";

const DOC = "szekcio-oktatasi-program";
const DEL_KEYS = new Set(["k98", "k9a", "k9g", "k9i", "k9y"]);
const REPLACEMENTS = [
  [
    " 10 éves megállapodás született a most felújított és átadott épületszárny területére, mely",
    " megállapodás született, mely",
  ],
  [" ezen időszak alatt kizárólagosságot", " kizárólagosságot"],
];

async function loadEnv() {
  const raw = await readFile(path.resolve(process.cwd(), ".env.local"), "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
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

  const doc = await client.getDocument(DOC);
  if (!doc?.body) throw new Error(`${DOC}: nincs body`);
  const eredeti = doc.body.length;

  const body = doc.body
    .filter((b) => !DEL_KEYS.has(b._key))
    .map((b) => {
      if (b._key !== "k9e" || !Array.isArray(b.children)) return b;
      return {
        ...b,
        children: b.children.map((c) => {
          if (typeof c.text !== "string") return c;
          let t = c.text;
          for (const [from, to] of REPLACEMENTS) t = t.replace(from, to);
          return { ...c, text: t };
        }),
      };
    });

  await client.patch(DOC).set({ body }).commit();
  console.log(`OK: ${eredeti} -> ${body.length} blokk (${eredeti - body.length} törölve), k9e mondat rövidítve`);

  const ell = await client.fetch(`*[_id=="${DOC}"][0].body[_key=="k9e"][0]`);
  const t = (ell?.children ?? []).map((c) => c.text).join("");
  console.log("k9e most:", t.slice(0, 400));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
