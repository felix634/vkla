// Sanity CDN képméretezés: a kért szélességre skálázott, modern formátumú
// (webp/avif) változatot kérünk — éles kép, kisebb sávszélesség.
// Nem-Sanity URL-eknél (helyi placeholderek) változatlanul visszaadja.
export function sized(url: string | null, width: number): string | null {
  if (!url) return null;
  if (!url.includes("cdn.sanity.io")) return url;
  return `${url}?w=${width}&auto=format`;
}

export type Fokuszpont = { x: number; y: number } | null | undefined;

// A Studióban kijelölt fókuszpont (hotspot) CSS-ben: az object-cover kivágás
// e köré igazodik, így a képarányra vágott kártyákon sem esnek ki az arcok.
export function fokusz(pont: Fokuszpont): string | undefined {
  if (!pont || typeof pont.x !== "number" || typeof pont.y !== "number") return undefined;
  return `${Math.round(pont.x * 100)}% ${Math.round(pont.y * 100)}%`;
}
