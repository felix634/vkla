// Placeholder csapat-adatok. A tényleges edzők, játékosok, képek a CMS-ből,
// illetve az MLSZ adatbankból (adatbank.mlsz.hu) jönnek később, API-n keresztül.

export type Player = {
  name: string;
  position: string;
  number: number;
  photo: string;
};

const POSITIONS = ["Kapus", "Védő", "Középpályás", "Csatár"];

// Egy korosztály placeholder keretének legenerálása (nevek/képek később).
export function placeholderRoster(count = 16): Player[] {
  return Array.from({ length: count }, (_, i) => ({
    name: "Játékos neve",
    position: POSITIONS[i % POSITIONS.length],
    number: i + 1,
    photo: "/images/player.jpg",
  }));
}

export const COACH_PHOTO = "/images/team.jpg";
