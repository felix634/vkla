// Megjelenítési segédek a szülői fiókhoz (szerver- és kliensoldalon is használható).

export const BANKSZAMLA = "11731001-21170988";
export const KEDVEZMENYEZETT = "Vasas Akadémia Kft.";

const HONAPOK = [
  "január", "február", "március", "április", "május", "június",
  "július", "augusztus", "szeptember", "október", "november", "december",
];

// Ezres tagolás négyjegyű összegeknél is (7 500 Ft), nem törő szóközzel —
// a hu-HU locale a négyjegyűeket nem tagolná, ami 15 000 mellett következetlen.
export function ft(n: number): string {
  return `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ft`;
}

// "2026-10-31" -> "2026. október 31."
export function datum(d: string | null): string {
  if (!d) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  if (!m) return d;
  return `${m[1]}. ${HONAPOK[Number(m[2]) - 1]} ${Number(m[3])}.`;
}

// Az átutalás közleménye a klub szabálya szerint: gyermek neve, korosztálya
// és a hónap — a számla adataiból előre kitöltve.
export function kozlemeny(sz: {
  gyermek_nev: string | null;
  korosztaly: string | null;
  idoszak: string | null;
}): string {
  return [sz.gyermek_nev, sz.korosztaly, sz.idoszak ? idoszak(sz.idoszak) : null]
    .filter(Boolean)
    .join(", ");
}

// "2026-10" -> "2026. október"; más formátumot változatlanul hagy.
export function idoszak(s: string | null): string {
  if (!s) return "—";
  const m = /^(\d{4})-(\d{2})$/.exec(s.trim());
  if (!m) return s;
  return `${m[1]}. ${HONAPOK[Number(m[2]) - 1]}`;
}
