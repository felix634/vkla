// A képzési díj összegei a Képzési díj oldalra (Máté jóváhagyása, 2026.09.25):
// fiú korosztályok 15 000 Ft/hó, leány korosztályok 7 500 Ft/hó.
// Később a Studióban (Oldal beállítások) módosítható.
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

await client.patch("beallitasok").set({ kepzesiDijFiu: 15000, kepzesiDijLany: 7500 }).commit();
console.log(await client.fetch(`*[_id == "beallitasok"][0]{kepzesiDijFiu, kepzesiDijLany}`));
