import { NextResponse } from "next/server";
import { emailEnabled, sendEmail } from "../../../lib/email";
import { fiokEnabled } from "../../../lib/fiok/db";
import {
  TulSokKeres,
  ervenyesEmail,
  normalizeEmail,
  siteUrl,
  ujBelepoLink,
} from "../../../lib/fiok/auth";
import { belepoLevel } from "../../../lib/fiok/levelek";

// Belépési link kérése: e-mail-cím -> egyszer használatos link levélben.
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
  if (!ervenyesEmail(email)) {
    return NextResponse.json({ error: "Érvénytelen e-mail-cím." }, { status: 400 });
  }

  try {
    const link = await ujBelepoLink(email, siteUrl(req));
    const level = belepoLevel(link);
    await sendEmail({ to: email, ...level });
  } catch (e) {
    if (e instanceof TulSokKeres) {
      return NextResponse.json(
        { error: "Túl sok belépési kérés érkezett erre a címre. Próbáld újra 15 perc múlva." },
        { status: 429 }
      );
    }
    console.error("Belépési link hiba:", e);
    return NextResponse.json(
      { error: "A belépési link elküldése nem sikerült. Próbáld újra később." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
