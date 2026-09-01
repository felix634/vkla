import { client, sanityEnabled } from "./client";

// Drive-ból importált tartalmak lekérdezői (dokumentumok, állások, csapatok, stáb).
// CMS nélkül minden null-t ad — az oldalak ilyenkor a placeholderüket mutatják.

export type DokumentumData = {
  _id: string;
  title: string;
  category: string;
  year: string | null;
  url: string | null;
};

export type AllasData = {
  _id: string;
  title: string;
  area: string | null;
  jobType: string | null;
  location: string | null;
  description: string | null;
};

export type JatekosData = {
  name: string;
  position: string | null;
  number: number | null;
  photoUrl: string | null;
};

export type CsapatData = {
  name: string;
  section: string | null;
  coachName: string | null;
  coachRole: string | null;
  coachPhotoUrl: string | null;
  assistants: string[] | null;
  players: JatekosData[] | null;
};

export type EdzoData = {
  name: string;
  role: string | null;
  photoUrl: string | null;
};

const REVALIDATE = { next: { revalidate: 300 } };

export async function getDokumentumok(): Promise<DokumentumData[] | null> {
  if (!sanityEnabled || !client) return null;
  return client.fetch(
    `*[_type == "dokumentum"] | order(year desc, title asc) {
      _id, title, category, year, "url": file.asset->url
    }`,
    {},
    REVALIDATE
  );
}

export async function getAllasok(): Promise<AllasData[] | null> {
  if (!sanityEnabled || !client) return null;
  return client.fetch(
    `*[_type == "allas" && active == true] | order(title asc) {
      _id, title, area, jobType, location, description
    }`,
    {},
    REVALIDATE
  );
}

export async function getCsapatok(): Promise<CsapatData[] | null> {
  if (!sanityEnabled || !client) return null;
  return client.fetch(
    `*[_type == "korosztaly"] | order(order asc) {
      name,
      section,
      "coachName": coach->name,
      "coachRole": coach->role,
      "coachPhotoUrl": coach->photo.asset->url,
      assistants,
      "players": players[]{ name, position, number, "photoUrl": photo.asset->url }
    }`,
    {},
    REVALIDATE
  );
}

// A stáb-rács rendezése: vezetők elöl, aztán vezetőedzők, szakemberek, asszisztensek.
function roleRank(role: string | null): number {
  const r = (role ?? "").toLowerCase();
  if (r.includes("igazgató")) return 0;
  if (r.includes("szakmai vezető")) return 1;
  if (r.includes("szekció vezetője")) return 2;
  if (r.includes("vezetőedző")) return 3;
  if (r.includes("kapusedző")) return 4;
  if (r.includes("erőnléti")) return 5;
  if (r.includes("fizioterapeuta")) return 6;
  if (r.includes("sportpszichológus")) return 7;
  if (r.includes("videoelemző")) return 8;
  return 9;
}

export async function getEdzok(): Promise<EdzoData[] | null> {
  if (!sanityEnabled || !client) return null;
  const edzok = await client.fetch<EdzoData[]>(
    `*[_type == "edzo" && featured == true] | order(name asc) {
      name, role, "photoUrl": photo.asset->url
    }`,
    {},
    REVALIDATE
  );
  return edzok.sort((a, b) => roleRank(a.role) - roleRank(b.role));
}

export type SzekcioData = {
  key: string;
  title: string;
  body: unknown[] | null;
  headerImageUrl: string | null;
  imageUrls: string[] | null;
};

// Oldal-szekciók kulcs szerint (Akadémia/Programok szöveges blokkjai).
export async function getSzekciok(): Promise<Record<string, SzekcioData> | null> {
  if (!sanityEnabled || !client) return null;
  const list = await client.fetch<SzekcioData[]>(
    `*[_type == "oldalszekcio"]{
      key,
      title,
      body[]{ ..., _type == "image" => { ..., "url": asset->url } },
      "headerImageUrl": headerImage.asset->url,
      "imageUrls": images[].asset->url
    }`,
    {},
    REVALIDATE
  );
  return Object.fromEntries(list.map((s) => [s.key, s]));
}
