import { NextResponse } from "next/server";
import { emailEnabled, sendEmail } from "../../../lib/email";
import { fiokEnabled, sql } from "../../../lib/fiok/db";
import { TulSokKeres, ervenyesEmail, jelszoLink, normalizeEmail, siteUrl } from "../../../lib/fiok/auth";
import { jelszoLevel } from "../../../lib/fiok/levelek";

// Regisztráció: név + e-mail-cím → levél a jelszó-beállító linkkel. A válasz
// mindig ugyanaz, így az űrlapból nem derül ki, van-e már fiók az adott címmel.
export async function POST(req: Request) {
  if (!fiokEnabled || !emailEnabled) {
    return NextResponse.json({ error: "A szülői fiók hamarosan indul." }, { status: 503 });
  }
  let body: { nev?: string; email?: string; website?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Hibás kérés." }, { status: 400 });
  }
  if (body.website?.trim()) return NextResponse.json({ ok: true }); // honeypot

  const nev = body.nev?.trim() ?? "";
  const email = normalizeEmail(body.email ?? "");
  if (!nev || nev.length > 120) return NextResponse.json({ error: "Add meg a neved." }, { status: 400 });
  if (!ervenyesEmail(email)) return NextResponse.json({ error: "Érvénytelen e-mail-cím." }, { status: 400 });

  try {
    const db = sql();
    const rows = (await db.query(`SELECT megerositve_at FROM szulo WHERE email = $1`, [email])) as {
      megerositve_at: string | null;
    }[];
    const marVan = !!rows[0]?.megerositve_at;
    if (!marVan) {
      await db.query(
        `INSERT INTO szulo (email, nev) VALUES ($1, $2)
         ON CONFLICT (email) DO UPDATE SET nev = EXCLUDED.nev`,
        [email, nev]
      );
    }
    const link = await jelszoLink(email, siteUrl(req), marVan ? 60 : 24 * 60);
    await sendEmail({
      to: email,
      ...jelszoLevel(marVan ? "marVanFiok" : "regisztracio", link, marVan ? "60 percig" : "24 óráig"),
    });
  } catch (e) {
    if (e instanceof TulSokKeres) {
      return NextResponse.json(
        { error: "Túl sok kérés érkezett erre a címre. Próbáld újra 15 perc múlva." },
        { status: 429 }
      );
    }
    console.error("Regisztrációs hiba:", e);
    return NextResponse.json({ error: "A levél elküldése nem sikerült. Próbáld újra később." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
