// Máté 2026.09.16-i anyagainak szekció-importja:
// - Képzési modell: az ÚJ szöveg (a 09.08-án törölt régi interjú pótlása;
//   a /akademia oldal kepzesi-modell szekció-helye újra megtelik)
// - Impresszum: a Máté emailjében küldött jogi nyilatkozat (/impresszum oldal)
// Forrás: scripts/szekciok-0916.json (a docx-ekből kinyert, jelölt bekezdések).
// Idempotens: createOrReplace — újrafuttatva ugyanazt az állapotot adja.

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

let keyN = 0;
const block = ({ t, h, li }) => ({
  _type: "block",
  _key: `b0916-${keyN++}`,
  style: h ? "h3" : "normal",
  ...(li ? { listItem: "bullet", level: 1 } : {}),
  markDefs: [],
  children: [{ _type: "span", _key: `s0916-${keyN++}`, text: t, marks: [] }],
});

async function main() {
  const env = await loadEnv();
  const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2026-08-01",
    token: env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
  });

  const data = JSON.parse(
    await readFile(path.resolve(process.cwd(), "scripts", "szekciok-0916.json"), "utf8")
  );

  await client.createOrReplace({
    _id: "szekcio-kepzesi-modell",
    _type: "oldalszekcio",
    key: "kepzesi-modell",
    title: "Képzési modell",
    body: data.kepzesi.map(block),
  });
  console.log(`OK: szekcio-kepzesi-modell (${data.kepzesi.length} bekezdés)`);

  await client.createOrReplace({
    _id: "szekcio-impresszum",
    _type: "oldalszekcio",
    key: "impresszum",
    title: "Impresszum",
    body: data.impresszum.map(block),
  });
  console.log(`OK: szekcio-impresszum (${data.impresszum.length} bekezdés)`);
  console.log("KÉSZ.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
