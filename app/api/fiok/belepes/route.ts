import { NextResponse } from "next/server";
import { fiokEnabled } from "../../../lib/fiok/db";
import { belepes, normalizeEmail } from "../../../lib/fiok/auth";

// Belépés e-mail-címmel és jelszóval. 5 hibás próbálkozás után a fiók 15
// percre zárol.
export async function POST(req: Request) {
  if (!fiokEnabled) {
    return NextResponse.json({ error: "A szülői fiók hamarosan indul." }, { status: 503 });
  }
  let body: { email?: string; jelszo?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Hibás kérés." }, { status: 400 });
  }
  const email = normalizeEmail(body.email ?? "");
  const jelszo = body.jelszo ?? "";
  if (!email || !jelszo || jelszo.length > 200) {
    return NextResponse.json({ error: "Add meg az e-mail-címed és a jelszavad." }, { status: 400 });
  }

  const eredmeny = await belepes(email, jelszo);
  if (eredmeny === "zarolva") {
    return NextResponse.json(
      { error: "Túl sok sikertelen próbálkozás. Próbáld újra 15 perc múlva, vagy állíts be új jelszót." },
      { status: 429 }
    );
  }
  if (eredmeny === "hibas") {
    return NextResponse.json(
      {
        error:
          "Hibás e-mail-cím vagy jelszó. Ha még nem állítottál be jelszót, használd a regisztrációs levél linkjét, vagy kérj újat az „Elfelejtett jelszó” oldalon.",
      },
      { status: 401 }
    );
  }
  return NextResponse.json({ ok: true });
}
