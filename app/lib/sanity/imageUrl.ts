// Sanity CDN képméretezés: a kért szélességre skálázott, modern formátumú
// (webp/avif) változatot kérünk — éles kép, kisebb sávszélesség.
// Nem-Sanity URL-eknél (helyi placeholderek) változatlanul visszaadja.
export function sized(url: string | null, width: number): string | null {
  if (!url) return null;
  if (!url.includes("cdn.sanity.io")) return url;
  return `${url}?w=${width}&auto=format`;
}
