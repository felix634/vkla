// Korosztályok — a Csapatok rács, a Mérkőzés-szűrő és a Programok
// egyaránt innen dolgozik. A tényleges adatok (edzők, játékosok, időpontok)
// a CMS-ből, illetve az MLSZ / talentX API-ból jönnek később.

export type AgeGroup = {
  name: string;
  band: "u5-u9" | "u10-u13" | "u14-u19" | "noi";
  highlight?: boolean;
};

export const AGE_GROUPS: AgeGroup[] = [
  { name: "U5", band: "u5-u9" },
  { name: "U6", band: "u5-u9" },
  { name: "U7", band: "u5-u9" },
  { name: "U8", band: "u5-u9" },
  { name: "U9", band: "u5-u9" },
  { name: "U10", band: "u10-u13" },
  { name: "U11", band: "u10-u13" },
  { name: "U12", band: "u10-u13" },
  { name: "U13", band: "u10-u13" },
  { name: "U14", band: "u14-u19" },
  { name: "U15", band: "u14-u19" },
  { name: "U16", band: "u14-u19" },
  { name: "U17", band: "u14-u19" },
  { name: "U18", band: "u14-u19" },
  { name: "U19", band: "u14-u19" },
  { name: "Női", band: "noi", highlight: true },
];

export const AGE_BANDS: { id: AgeGroup["band"]; label: string }[] = [
  { id: "u5-u9", label: "U5–U9" },
  { id: "u10-u13", label: "U10–U13" },
  { id: "u14-u19", label: "U14–U19" },
  { id: "noi", label: "Női csapat" },
];

// Bajnoki mérkőzést játszó korosztályok — a jelenlegi vkla.hu jelölését tükrözi:
// fiúknál sima U + szám, lányoknál L utótag (U14L, U16L, U19L), plusz a felnőtt Női NBII.
export const MATCH_AGE_GROUPS: string[] = [
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
  "U14L",
  "U16L",
  "U19L",
  "Női NBII",
];
