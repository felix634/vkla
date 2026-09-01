import { client, sanityEnabled } from "./client";

export type HirListItem = {
  _id: string;
  title: string;
  slug: string | null;
  publishedAt: string | null;
  category: string;
  excerpt: string | null;
  imageUrl: string | null;
};

export type HirDetail = HirListItem & {
  body: unknown[] | null;
};

export const HIREK_OLDALMERET = 13; // 1 kiemelt + 12 rács

const LIST_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  category,
  excerpt,
  "imageUrl": heroImage.asset->url
`;

// Helykitöltő hírek — amíg a CMS nincs bekötve, a látványterv ezt mutatja.
const PLACEHOLDER_IMAGES = ["/images/flag.jpg", "/images/team.jpg", "/images/player.jpg"];
const PLACEHOLDER_HIREK: HirListItem[] = Array.from({ length: 9 }, (_, i) => ({
  _id: `placeholder-${i}`,
  title: "Hír címe ide kerül",
  slug: null,
  publishedAt: null,
  category: ["VKLA", "MLSZ", "VFCII", "SAJTÓ"][i % 4],
  excerpt:
    "Rövid bevezető szöveg a hírhez — két-három mondatos összefoglaló a kattintható tartalomról.",
  imageUrl: PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length],
}));

export async function getHirek(opts: {
  category?: string;
  page?: number;
}): Promise<{ items: HirListItem[]; total: number }> {
  const category = opts.category ?? "";
  const page = Math.max(1, opts.page ?? 1);

  if (!sanityEnabled || !client) {
    const items =
      category === ""
        ? PLACEHOLDER_HIREK
        : PLACEHOLDER_HIREK.filter((h) => h.category === category);
    return { items, total: items.length };
  }

  const from = (page - 1) * HIREK_OLDALMERET;
  const to = from + HIREK_OLDALMERET;
  const filter = `_type == "hir" && defined(slug.current) && ($category == "" || category == $category)`;
  const [items, total] = await Promise.all([
    client.fetch<HirListItem[]>(
      `*[${filter}] | order(publishedAt desc) [$from...$to]{ ${LIST_FIELDS} }`,
      { category, from, to },
      { next: { revalidate: 300 } }
    ),
    client.fetch<number>(
      `count(*[${filter}])`,
      { category },
      { next: { revalidate: 300 } }
    ),
  ]);
  return { items, total };
}

export async function getHir(slug: string): Promise<HirDetail | null> {
  if (!sanityEnabled || !client) return null;
  return client.fetch<HirDetail | null>(
    `*[_type == "hir" && slug.current == $slug][0]{
      ${LIST_FIELDS},
      body[]{
        ...,
        _type == "image" => { ..., "url": asset->url }
      }
    }`,
    { slug },
    { next: { revalidate: 300 } }
  );
}

export async function hirLetezik(slug: string): Promise<boolean> {
  if (!sanityEnabled || !client) return false;
  const n = await client.fetch<number>(
    `count(*[_type == "hir" && slug.current == $slug])`,
    { slug },
    { next: { revalidate: 3600 } }
  );
  return n > 0;
}
