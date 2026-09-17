import { NextResponse } from "next/server";
import { emailEnabled, sendFormEmail, sorok } from "../../lib/email";
import { getBeallitasok } from "../../lib/sanity/tartalom";

// Általános kapcsolatfelvételi űrlap → e-mail a központi címre.
export async function POST(req: Request) {
  if (!emailEnabled) {
    return NextResponse.json(
      { error: "Az üzenetküldés még nincs bekapcsolva. Kérjük, írj közvetlenül e-mailben." },
      { status: 503 }
    );
  }

  let body: Record<string, string | undefined>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Hibás kérés." }, { status: 400 });
  }

  // Honeypot: emberi látogató ezt a mezőt nem tölti ki.
  if (body.website?.trim()) return NextResponse.json({ ok: true });

  const nev = body.nev?.trim();
  const email = body.email?.trim();
  const targy = body.targy?.trim();
  const uzenet = body.uzenet?.trim();
  if (!nev || !email || !targy || !uzenet) {
    return NextResponse.json({ error: "Minden mező kitöltése kötelező." }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Érvénytelen e-mail cím." }, { status: 400 });
  }
  if (uzenet.length > 5000 || targy.length > 200 || nev.length > 200) {
    return NextResponse.json({ error: "Túl hosszú üzenet." }, { status: 400 });
  }

  const b = await getBeallitasok();
  const cimzett = b?.email ?? "info@vkla.hu";

  try {
    await sendFormEmail({
      to: cimzett,
      subject: `Weboldal-megkeresés: ${targy}`,
      replyTo: email,
      html:
        `<h2 style="font-size:16px;color:#0f172a">Új megkeresés érkezett a vkla.hu kapcsolat-űrlapjáról</h2>` +
        sorok([
          ["Név", nev],
          ["E-mail", email],
          ["Tárgy", targy],
          ["Üzenet", uzenet],
        ]) +
        `<p style="color:#94a3b8;font-size:12px;margin-top:16px">Válaszolni közvetlenül erre a levélre lehet (a válasz a feladónak megy).</p>`,
    });
  } catch (e) {
    console.error("Kapcsolat-űrlap küldési hiba:", e);
    return NextResponse.json(
      { error: "Az üzenet elküldése nem sikerült. Próbáld újra később." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
