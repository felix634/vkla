// Máté 2026.09.24-i kérései: a központi iroda címe (Hajdú utca 42) a Fáy
// utcai cím mellett, és a Hírek listája csak a 2026/27-es szezontól (07.01.).
// Mindkettő a Studio „Oldal beállítások” dokumentumában szerkeszthető.
import { readFileSync } from "node:fs";
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

await client
  .patch("beallitasok")
  .set({ irodaCim: "1139 Budapest, Hajdú utca 42.", hirekKezdete: "2026-07-01" })
  .commit();
console.log(await client.fetch(`*[_id == "beallitasok"][0]{address, irodaCim, hirekKezdete}`));
