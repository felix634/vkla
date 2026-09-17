import { NextResponse } from "next/server";
import { emailEnabled, sendFormEmail, sorok } from "../../lib/email";
import { getBeallitasok } from "../../lib/sanity/tartalom";

// Próbaedzés-jelentkezés → e-mail a beállításokban megadott központi címre.
// Kötelező mezők Berkes Máté 2026.09.08-i kérése szerint.
export async function POST(req: Request) {
  if (!emailEnabled) {
    return NextResponse.json(
      { error: "A jelentkezés-küldés még nincs bekapcsolva. Kérjük, írj közvetlenül e-mailben." },
      { status: 503 }
    );
  }

  let body: Record<string, string | undefined>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Hibás kérés." }, { status: 400 });
  }

  if (body.website?.trim()) return NextResponse.json({ ok: true });

  const kotelezo = [
    "gyermekNev",
    "szuletesiIdo",
    "szuletesiHely",
    "anyjaNeve",
    "jelenlegiCsapat",
    "szuloNev",
    "telefon",
    "email",
  ] as const;
  const adat: Record<string, string> = {};
  for (const mezo of kotelezo) {
    const v = body[mezo]?.trim();
    if (!v) {
      return NextResponse.json({ error: "Minden csillagos mező kitöltése kötelező." }, { status: 400 });
    }
    if (v.length > 300) {
      return NextResponse.json({ error: "Túl hosszú mezőérték." }, { status: 400 });
    }
    adat[mezo] = v;
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adat.email)) {
    return NextResponse.json({ error: "Érvénytelen e-mail cím." }, { status: 400 });
  }
  const megjegyzes = body.megjegyzes?.trim().slice(0, 3000);

  const b = await getBeallitasok();
  const cimzett = b?.probaedzesEmail ?? b?.email ?? "info@vkla.hu";

  try {
    await sendFormEmail({
      to: cimzett,
      subject: `Próbaedzés-jelentkezés: ${adat.gyermekNev}`,
      replyTo: adat.email,
      html:
        `<h2 style="font-size:16px;color:#0f172a">Új próbaedzés-jelentkezés érkezett a vkla.hu-ról</h2>` +
        sorok([
          ["Gyermek neve", adat.gyermekNev],
          ["Születési idő", adat.szuletesiIdo],
          ["Születési hely", adat.szuletesiHely],
          ["Édesanyja leánykori neve", adat.anyjaNeve],
          ["Jelenlegi csapata", adat.jelenlegiCsapat],
          ["Szülő neve", adat.szuloNev],
          ["Telefonszám", adat.telefon],
          ["E-mail", adat.email],
          ["Megjegyzés", megjegyzes],
        ]) +
        `<p style="color:#94a3b8;font-size:12px;margin-top:16px">Válaszolni közvetlenül erre a levélre lehet (a válasz a szülőnek megy).</p>`,
    });
  } catch (e) {
    console.error("Próbaedzés-űrlap küldési hiba:", e);
    return NextResponse.json(
      { error: "A jelentkezés elküldése nem sikerült. Próbáld újra később." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
