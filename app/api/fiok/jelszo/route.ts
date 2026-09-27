import { NextResponse } from "next/server";
import { fiokEnabled } from "../../../lib/fiok/db";
import { JELSZO_MIN, jelszoBeallitas } from "../../../lib/fiok/auth";

// Jelszó beállítása a levélben kapott linkkel (regisztráció és elfelejtett
// jelszó). Siker esetén a szülő be is lép.
export async function POST(req: Request) {
  if (!fiokEnabled) {
    return NextResponse.json({ error: "A szülői fiók hamarosan indul." }, { status: 503 });
  }
  let body: { t?: string; jelszo?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Hibás kérés." }, { status: 400 });
  }
  const jelszo = body.jelszo ?? "";
  if (jelszo.length < JELSZO_MIN || jelszo.length > 200) {
    return NextResponse.json(
      { error: `A jelszó legalább ${JELSZO_MIN} karakter legyen.` },
      { status: 400 }
    );
  }
  const email = body.t ? await jelszoBeallitas(body.t, jelszo) : null;
  if (!email) {
    return NextResponse.json(
      { error: "A link lejárt vagy már felhasználták. Kérj újat az „Elfelejtett jelszó” oldalon." },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}
