// Drive-ból érkezett dokumentumok (TAO PDF-ek, Etikai kódex, Házirend)
// feltöltése a Sanity-be "dokumentum" típusként. Idempotens (determinisztikus
// _id-k, createOrReplace) — újrafuttatható.

import { readFile, readdir } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

const DRIVE = path.resolve(
  process.cwd(),
  "..",
  "Drive-tartalom",
  "VKLA - weboldal"
);

async function loadEnv() {
  const raw = await readFile(path.resolve(process.cwd(), ".env.local"), "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

function docId(name) {
  return (
    "dok-" +
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/.[a-z0-9]+$/, "").replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 90)
  );
}

// Évszám a fájlnévből: "2016-17", "2019-2020", "2023.04.07", "2026.04.24" stb.
function detectYear(name) {
  const season = name.match(/(20\d{2})[-\/](\d{2,4})/);
  if (season) return season[1];
  const date = name.match(/(20\d{2})\.\d{2}\.\d{2}/);
  if (date) return date[1];
  const bare = name.match(/\b(20\d{2})\b/);
  if (bare) return bare[1];
  return null;
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

  const jobs = [];

  // TAO PDF-ek
  const taoDir = path.join(DRIVE, "TAO-program");
  for (const f of await readdir(taoDir)) {
    if (!f.toLowerCase().endsWith(".pdf")) continue;
    jobs.push({
      file: path.join(taoDir, f),
      title: f.replace(/\.pdf$/i, ""),
      category: "TAO",
      year: detectYear(f),
    });
  }

  // Etikai kódex + Házirend -> Szabályzatok
  jobs.push({
    file: path.join(DRIVE, "Etikai kódex", "Etikai kódex.pdf"),
    title: "Etikai kódex",
    category: "Szabályzatok",
    year: null,
  });
  jobs.push({
    file: path.join(DRIVE, "Házirend", "Házirend.docx"),
    title: "Házirend",
    category: "Szabályzatok",
    year: null,
  });

  console.log(`Feltöltendő dokumentum: ${jobs.length}`);
  let ok = 0;
  for (const j of jobs) {
    try {
      const asset = await client.assets.upload("file", createReadStream(j.file), {
        filename: path.basename(j.file),
      });
      await client.createOrReplace({
        _id: docId(path.basename(j.file)),
        _type: "dokumentum",
        title: j.title,
        category: j.category,
        ...(j.year ? { year: j.year } : {}),
        file: { _type: "file", asset: { _type: "reference", _ref: asset._id } },
      });
      ok++;
      if (ok % 10 === 0) console.log(`  ...${ok}/${jobs.length}`);
    } catch (e) {
      console.error(`  HIBA: ${j.title} — ${e.message}`);
    }
  }
  console.log(`KÉSZ: ${ok}/${jobs.length} dokumentum a Sanity-ben.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
