// Google Térkép útvonaltervező link egy címhez — a kattintható címek ide visznek.
// A név is a keresésbe kerülhet: a Fáy utcai stadion és sportcentrum címe azonos.
// Az emelet („…, 3. emelet”) a kereséshez nem kell, azt levágjuk.
export function utvonalUrl(cim: string, nev?: string): string {
  const hely = cim.replace(/,?\s*\d+\.\s*emelet.*$/i, "").trim();
  const q = encodeURIComponent(nev ? `${nev}, ${hely}` : hely);
  return `https://www.google.com/maps/dir/?api=1&destination=${q}`;
}
