// Közös hír-megjelenítési segédek (főoldali News + /hirek lista).

export function catColor(cat: string): string {
  if (/^U\d/.test(cat) || cat === "Női") return "bg-royal";
  if (cat === "VKLA") return "bg-vasasRed";
  if (cat === "VFC" || cat === "VFCII" || cat === "NBII") return "bg-navy";
  return "bg-gold";
}

export function formatDate(iso: string | null): string {
  if (!iso) return "Dátum";
  return new Date(iso).toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
