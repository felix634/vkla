import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { HirListItem, HirDetail } from "./sanity/hirek";

// Statikus hír-archívum olvasó. A scripts/archive-hirek.mjs által generált
// fájlokból szolgálja ki a Sanity-ből már archivált (törölt) cikkeket.
// Amíg az archívum-mappa nem létezik (pl. friss klón), minden üresen tér
// vissza, és az oldal kizárólag a CMS-ből dolgozik.

const CONTENT_DIR = path.join(process.cwd(), "content", "archiv");

let indexCache: HirListItem[] | null = null;
let slugSet: Set<string> | null = null;

export async function getArchivIndex(): Promise<HirListItem[]> {
  if (indexCache) return indexCache;
  try {
    const raw = await readFile(path.join(CONTENT_DIR, "index.json"), "utf8");
    indexCache = JSON.parse(raw) as HirListItem[];
  } catch {
    indexCache = [];
  }
  slugSet = new Set(indexCache.map((c) => c.slug ?? ""));
  return indexCache;
}

export async function archivLetezik(slug: string): Promise<boolean> {
  if (!slugSet) await getArchivIndex();
  return slugSet!.has(slug);
}

export async function getArchivCikk(slug: string): Promise<HirDetail | null> {
  // csak biztonságos slugokat engedünk fájlnévként használni
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  if (!(await archivLetezik(slug))) return null;
  try {
    const raw = await readFile(path.join(CONTENT_DIR, "cikkek", `${slug}.json`), "utf8");
    return JSON.parse(raw) as HirDetail;
  } catch {
    return null;
  }
}
