import type { MetadataRoute } from "next";
import { client, sanityEnabled } from "./lib/sanity/client";
import { getArchivIndex } from "./lib/archiv";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vkla.vercel.app";

const STATIC_ROUTES = [
  "",
  "/hirek",
  "/akademia",
  "/csapatok",
  "/merkozesek",
  "/programok",
  "/galeria",
  "/letesitmenyek",
  "/szponzoracio",
  "/kapcsolat",
  "/tagdij",
  "/tao",
  "/karrier",
  "/dokumentumok",
];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: p === "" || p === "/hirek" ? "daily" : "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  const archiv = await getArchivIndex();
  const archivEntries: MetadataRoute.Sitemap = archiv.map((a) => ({
    url: `${SITE_URL}/hirek/${a.slug}`,
    ...(a.publishedAt ? { lastModified: new Date(a.publishedAt) } : {}),
    changeFrequency: "yearly" as const,
    priority: 0.4,
  }));

  if (!sanityEnabled || !client) return [...staticEntries, ...archivEntries];

  const hirek = await client.fetch<{ slug: string; date: string | null }[]>(
    `*[_type == "hir" && defined(slug.current)]{ "slug": slug.current, date }`
  );
  const cmsSlugs = new Set(hirek.map((h) => h.slug));

  return [
    ...staticEntries,
    ...hirek.map((h) => ({
      url: `${SITE_URL}/hirek/${h.slug}`,
      ...(h.date ? { lastModified: new Date(h.date) } : {}),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    // archív cikkek, amik már nincsenek a CMS-ben
    ...archivEntries.filter((e) => !cmsSlugs.has(e.url.split("/").pop()!)),
  ];
}
