// A klub „VKLA Galériák” Drive-mappájának (2026.11.16-án megosztva) feltöltése a
// Sanity galériájába: albumonként egy „galeria” dokumentum (Mérkőzések / Események).
//
// Bemenet (a git-ignorált munkamappából, nem a repóból):
//   manifest.json – {"Események": [{id, title, files: [{id, title}]}], "Mérkőzések": [...]}
//   kepek/<albumId>/<fileId>.jpg – a Drive-képek 2000 px-re kicsinyítve
//   borito.json (opcionális) – {"<albumId>": "<fileId>"}: ez a kép kerül az album elejére (borító)
//
// Futtatás: node scripts/galeriak-1116.mjs <manifest.json> <kepek mappa> [borito.json]
// Idempotens: a feltöltött képeket a scraped/galeria-feltoltes-1116.json tartja nyilván,
// a Sanity az azonos képet amúgy is egyszer tárolja. A már létező albumot nem írja felül
// (a Studióban azóta átrendezett borító megmarad); --frissit kapcsolóval újraírja.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
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

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const frissit = process.argv.includes("--frissit");
const [manifestPath, kepekDir, boritoPath] = args;
if (!manifestPath || !kepekDir) throw new Error("Használat: node scripts/galeriak-1116.mjs <manifest.json> <kepek mappa> [borito.json]");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const borito = boritoPath && existsSync(boritoPath) ? JSON.parse(readFileSync(boritoPath, "utf8")) : {};

const KATEGORIA = { "Események": "Esemény", "Mérkőzések": "Mérkőzés" };

// „2024.06.07. - U16-os Országos Kupadöntő: …” → dátum + cím. A mappanevek írásmódja
// változó („2024.06.24 - …”, „2024.06.07. U16-os …”), ezért laza a minta.
function bontas(mappa) {
  const m = mappa.match(/^(\d{4})\.(\d{2})\.(\d{2})\.?\s*-?\s*(.+)$/);
  if (!m) return { date: null, title: mappa.trim() };
  // Elírás a mappanévben: „Nő szekciónk” → „Női szekciónk”.
  const title = m[4].trim().replace(/^Nő szekciónk/, "Női szekciónk");
  return { date: `${m[1]}-${m[2]}-${m[3]}`, title };
}

const allapotFajl = new URL("../scraped/galeria-feltoltes-1116.json", import.meta.url);
const allapot = existsSync(allapotFajl) ? JSON.parse(readFileSync(allapotFajl, "utf8")) : {};
const ment = () => writeFileSync(allapotFajl, JSON.stringify(allapot, null, 1));

async function feltolt(albumId, f) {
  if (allapot[f.id]) return allapot[f.id];
  const fajl = path.join(kepekDir, albumId, `${f.id}.jpg`);
  if (!existsSync(fajl)) return null;
  const nev = f.title.replace(/\.[^.]+$/, "") + ".jpg";
  for (let probal = 1; ; probal++) {
    try {
      const asset = await client.assets.upload("image", readFileSync(fajl), { filename: nev });
      allapot[f.id] = asset._id;
      return asset._id;
    } catch (e) {
      if (probal >= 3) throw e;
      await new Promise((r) => setTimeout(r, 2000 * probal));
    }
  }
}

let ujAlbum = 0, kihagyott = 0, kepOssz = 0;
for (const [katNev, albumok] of Object.entries(manifest)) {
  const category = KATEGORIA[katNev];
  if (!category) throw new Error(`Ismeretlen kategória: ${katNev}`);
  for (const a of albumok) {
    const docId = `galeria-drive-${a.id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const { date, title } = bontas(a.title);
    if (!frissit && (await client.getDocument(docId))) {
      kihagyott++;
      continue;
    }
    // Csak teljesen letöltött album kerül fel (a letöltés még futhat).
    const hianyzo = a.files.filter((f) => !existsSync(path.join(kepekDir, a.id, `${f.id}.jpg`))).length;
    if (hianyzo) {
      console.log(`  MÉG LETÖLTÉS ALATT (${hianyzo} kép hiányzik), kihagyva: ${a.title}`);
      continue;
    }
    // Borító elöl, utána a Drive-sorrend (fájlnév szerint).
    let fajlok = [...a.files];
    const b = borito[a.id];
    if (b) fajlok = [...fajlok.filter((f) => f.id === b), ...fajlok.filter((f) => f.id !== b)];

    const images = [];
    for (let i = 0; i < fajlok.length; i += 4) {
      const ids = await Promise.all(fajlok.slice(i, i + 4).map((f) => feltolt(a.id, f)));
      ids.forEach((assetId, j) => {
        if (assetId)
          images.push({ _type: "image", _key: fajlok[i + j].id.slice(-12).replace(/[^a-zA-Z0-9]/g, "x"), asset: { _type: "reference", _ref: assetId } });
      });
      ment();
    }
    const hiany = fajlok.length - images.length;
    if (images.length === 0) {
      console.log(`  NINCS KÉP: ${a.title}`);
      continue;
    }
    // Ugyanaz a kép kétszer ne szerepeljen (a Sanity az azonos fájlt egy assetként tárolja).
    const latott = new Set();
    const egyedi = images.filter((im) => !latott.has(im.asset._ref) && latott.add(im.asset._ref));
    await client.createOrReplace({ _id: docId, _type: "galeria", title, category, date, images: egyedi });
    ujAlbum++;
    kepOssz += egyedi.length;
    console.log(`  KÉSZ: ${category} · ${date ?? "–"} · ${title} · ${egyedi.length} kép${hiany ? ` (${hiany} hiányzik)` : ""}`);
  }
}
ment();
console.log(`\nÚj/frissített album: ${ujAlbum} (${kepOssz} kép), már meglévő: ${kihagyott}`);
