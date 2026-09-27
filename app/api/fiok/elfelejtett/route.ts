import { NextResponse } from "next/server";
import { emailEnabled, sendEmail } from "../../../lib/email";
import { fiokEnabled, sql } from "../../../lib/fiok/db";
import { TulSokKeres, ervenyesEmail, jelszoLink, normalizeEmail, siteUrl } from "../../../lib/fiok/auth";
import { jelszoLevel } from "../../../lib/fiok/levelek";

// Elfelejtett jelszó: ha van fiók a címmel, jelszó-beállító linket küldünk.
// A válasz mindig ugyanaz, hogy az űrlapból ne derüljön ki, kinek van fiókja.
export async function POST(req: Request) {
  if (!fiokEnabled || !emailEnabled) {
    return NextResponse.json({ error: "A szülői fiók hamarosan indul." }, { status: 503 });
  }
  let body: { email?: string; website?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Hibás kérés." }, { status: 400 });
  }
  if (body.website?.trim()) return NextResponse.json({ ok: true }); // honeypot
  const email = normalizeEmail(body.email ?? "");
  if (!ervenyesEmail(email)) return NextResponse.json({ error: "Érvénytelen e-mail-cím." }, { status: 400 });

  try {
    const rows = (await sql().query(`SELECT 1 FROM szulo WHERE email = $1`, [email])) as unknown[];
    if (rows.length) {
      const link = await jelszoLink(email, siteUrl(req), 60);
      await sendEmail({ to: email, ...jelszoLevel("elfelejtett", link, "60 percig") });
    }
  } catch (e) {
    if (e instanceof TulSokKeres) {
      return NextResponse.json(
        { error: "Túl sok kérés érkezett erre a címre. Próbáld újra 15 perc múlva." },
        { status: 429 }
      );
    }
    console.error("Elfelejtett jelszó hiba:", e);
    return NextResponse.json({ error: "A levél elküldése nem sikerült. Próbáld újra később." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
