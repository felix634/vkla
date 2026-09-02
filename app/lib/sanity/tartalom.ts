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

export type BeallitasokData = {
  phone: string | null;
  email: string | null;
  probaedzesEmail: string | null;
  address: string | null;
  officeHours: string | null;
  facebook: string | null;
  instagram: string | null;
  youtubeChannel: string | null;
  tiktok: string | null;
  webshopUrl: string | null;
  vasasFcUrl: string | null;
  vasasFcIIUrl: string | null;
};

// Oldal-beállítások singleton (elérhetőségek, social + külső linkek).
export async function getBeallitasok(): Promise<BeallitasokData | null> {
  if (!sanityEnabled || !client) return null;
  return client.fetch(
    `*[_type == "beallitasok" && _id == "beallitasok"][0]{
      phone, email, probaedzesEmail, address, officeHours,
      facebook, instagram, youtubeChannel, tiktok,
      webshopUrl, vasasFcUrl, vasasFcIIUrl
    }`,
    {},
    REVALIDATE
  );
}

export type HetirendAlkalom = {
  day: string;
  from: string | null;
  to: string | null;
  location: string | null;
};

export type HetirendData = {
  korosztaly: string;
  entries: HetirendAlkalom[] | null;
};

export async function getHetirend(): Promise<HetirendData[] | null> {
  if (!sanityEnabled || !client) return null;
  return client.fetch(
    `*[_type == "hetirend"] | order(korosztaly asc) {
      korosztaly,
      entries[]{ day, from, to, location }
    }`,
    {},
    REVALIDATE
  );
}

export type GaleriaAlbumData = {
  _id: string;
  title: string;
  category: string;
  date: string | null;
  imageUrls: string[] | null;
};

export type VideoData = {
  _id: string;
  title: string;
  url: string;
  date: string | null;
};

export async function getGaleriaAlbumok(): Promise<GaleriaAlbumData[] | null> {
  if (!sanityEnabled || !client) return null;
  return client.fetch(
    `*[_type == "galeria"] | order(date desc) {
      _id, title, category, date, "imageUrls": images[].asset->url
    }`,
    {},
    REVALIDATE
  );
}

export async function getVideok(): Promise<VideoData[] | null> {
  if (!sanityEnabled || !client) return null;
  return client.fetch(
    `*[_type == "video"] | order(date desc) { _id, title, url, date }`,
    {},
    REVALIDATE
  );
}

export type LetesitmenyData = {
  _id: string;
  name: string;
  address: string | null;
  body: unknown[] | null;
  amenities: string[] | null;
  rentInfo: string | null;
  imageUrls: string[] | null;
  mapImageUrl: string | null;
};

export async function getLetesitmenyek(): Promise<LetesitmenyData[] | null> {
  if (!sanityEnabled || !client) return null;
  return client.fetch(
    `*[_type == "letesitmeny"] | order(order asc) {
      _id, name, address, body, amenities, rentInfo,
      "imageUrls": images[].asset->url,
      "mapImageUrl": mapImage.asset->url
    }`,
    {},
    REVALIDATE
  );
}

export type SzponzorData = {
  _id: string;
  name: string;
  tier: "fo" | "partner";
  logoUrl: string | null;
  url: string | null;
};

export async function getSzponzorok(): Promise<SzponzorData[] | null> {
  if (!sanityEnabled || !client) return null;
  return client.fetch(
    `*[_type == "szponzor"] | order(order asc) {
      _id, name, tier, "logoUrl": logo.asset->url, url
    }`,
    {},
    REVALIDATE
  );
}
