// Hír-kategóriák — a régi vkla.hu kategóriáival egyezően (migráció!),
// kiegészítve az új oldal korosztályaival.
export const HIR_KATEGORIAK = [
  "VKLA",
  "VFC",
  "VFCII",
  "MLSZ",
  "NBII",
  "KUPA",
  "SAJTÓ",
  "MIP",
  "U5",
  "U6",
  "U7",
  "U8",
  "U9",
  "U10",
  "U11",
  "U12",
  "U13",
  "U14",
  "U15",
  "U16",
  "U17",
  "U18",
  "U19",
  "U10L",
  "U11L",
  "U12L",
  "U13L",
  "U14L",
  "U16L",
  "U19L",
  "Női",
] as const;

// A hír-kategóriák új felosztása (Tóth Patrik, 2026.10.23.): a fő kategóriák
// fixek, a korosztályok listáját a Studio kezeli (Oldal beállítások → Hírek —
// korosztály-szűrő). Ez az alapértelmezés: legnagyobbtól lefelé, előbb fiúk,
// aztán lányok. Az NBII a felnőtt női csapat kategóriája a régi oldalon.
export const HIR_FO_KATEGORIAK = ["VKLA", "VFC", "VFCII", "MLSZ", "KUPA", "SAJTÓ", "MIP"] as const;

export type HirKorosztaly = { kod: string; nev?: string | null };

export const HIR_KOROSZTALYOK_ALAP: HirKorosztaly[] = [
  ...["U19", "U17", "U16", "U15", "U14", "U13", "U12", "U11", "U10", "U9", "U8", "U7", "U6"].map((kod) => ({ kod })),
  { kod: "NBII", nev: "Női NB II" },
  ...["U19L", "U16L", "U14L", "U13L", "U12L", "U11L", "U10L"].map((kod) => ({ kod })),
];

export const KOROSZTALYOK = [
  "U5-7",
  "U8-A",
  "U8-B",
  "U9",
  "U10",
  "U11",
  "U12",
  "U13",
  "U14",
  "U15",
  "U16",
  "U17",
  "U19",
  "Felnőtt női",
  "U19 leány",
  "U16 leány",
  "U14 leány",
  "U12 leány",
  "U10 leány",
] as const;

export const POSZTOK = ["Kapus", "Védő", "Középpályás", "Csatár"] as const;

export const DOKUMENTUM_KATEGORIAK = [
  "Szabályzatok",
  "Nyomtatványok",
  "Adatvédelem",
  "TAO",
  "Egyéb",
] as const;

// A galéria két nagy albuma (Tóth Patrik, 2026.10.23.) — az Edzés kategória lekerült.
export const GALERIA_ALBUMOK = ["Mérkőzés", "Esemény"] as const;

export const NAPOK = [
  "Hétfő",
  "Kedd",
  "Szerda",
  "Csütörtök",
  "Péntek",
  "Szombat",
  "Vasárnap",
] as const;
