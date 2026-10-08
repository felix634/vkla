// Kubala László szekció szövegének cseréje Patrik 2026.10.08-i docx-ére.
// A docx félkövér kiemelései "strong" jelöléssé alakulnak. Csak a szöveg
// (body) cserélődik, a képek maradnak. Előtte mentés a scraped/ mappába.
//
// Futtatás: node scripts/import-kubala-1008.mjs [--vegrehajt]

import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createClient } from "@sanity/client";

for (const l of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const i = l.indexOf("=");
  if (i > 0 && /^[A-Z_]+$/.test(l.slice(0, i))) process.env[l.slice(0, i)] = l.slice(i + 1).trim().replace(/^["']|["']$/g, "");
}

const DOCX = "../Drive-tartalom/VKLA - weboldal/1008/Kubala László.docx";
const ID = "szekcio-kubala";

// A docx XML-jét a rendszer unzip nélkül, Pythonnal olvassuk ki.
const xml = execFileSync("python", ["-c", `import zipfile,sys;sys.stdout.buffer.write(zipfile.ZipFile(sys.argv[1]).read('word/document.xml'))`, DOCX]).toString("utf8");

const unesc = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
let k = 0;
const key = () => `kb${(k++).toString(36)}`;

const blokkok = [];
for (const p of xml.match(/<w:p[ >][\s\S]*?<\/w:p>/g) ?? []) {
  const spanok = [];
  for (const r of p.match(/<w:r[ >][\s\S]*?<\/w:r>/g) ?? []) {
    const szoveg = unesc([...r.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map((m) => m[1]).join(""));
    if (!szoveg) continue;
    const rpr = r.match(/<w:rPr>([\s\S]*?)<\/w:rPr>/)?.[1] ?? "";
    const felkover = /<w:b(?:\s+w:val="(?!0|false)[^"]*")?\s*\/>/.test(rpr);
    const marks = felkover ? ["strong"] : [];
    const elozo = spanok.at(-1);
    if (elozo && elozo.marks.join() === marks.join()) elozo.text += szoveg;
    else spanok.push({ _type: "span", _key: key(), text: szoveg, marks });
  }
  if (!spanok.length || !spanok.some((s) => s.text.trim())) continue;
  blokkok.push({ _type: "block", _key: key(), style: "normal", markDefs: [], children: spanok });
}

console.log(`${blokkok.length} bekezdés, kiemelt részek:`);
for (const b of blokkok) for (const s of b.children) if (s.marks.length) console.log("  •", s.text.trim());

const client = createClient({
  projectId: "c81243u9",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

if (process.argv.includes("--vegrehajt")) {
  const regi = await client.getDocument(ID);
  if (!regi) throw new Error(`${ID} nem található`);
  writeFileSync(`scraped/${ID}-mentes-2026-10-08.json`, JSON.stringify(regi, null, 1));
  await client.patch(ID).set({ body: blokkok }).commit();
  console.log(`Kész: ${ID} szövege frissítve (mentés: scraped/${ID}-mentes-2026-10-08.json).`);
} else {
  console.log("\nPróbafutás — élesítéshez: --vegrehajt");
}
