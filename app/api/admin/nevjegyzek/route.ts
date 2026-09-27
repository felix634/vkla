import { NextResponse } from "next/server";
import { fiokEnabled } from "../../../lib/fiok/db";
import { aktualisEmail, isAdmin } from "../../../lib/fiok/auth";
import { gyermekMentes, type ImportSor } from "../../../lib/fiok/nevjegyzek";

// Névjegyzék-sorok mentése (importnál kötegekben, kézi felvételnél egyesével).
const MAX_SOR = 50;

export async function POST(req: Request) {
  if (!fiokEnabled) return NextResponse.json({ error: "Az adatbázis nincs beállítva." }, { status: 503 });
  if (!isAdmin(await aktualisEmail())) return NextResponse.json({ error: "Nincs jogosultság." }, { status: 403 });

  let sorok: ImportSor[];
  try {
    sorok = (await req.json()).sorok;
  } catch {
    return NextResponse.json({ error: "Hibás kérés." }, { status: 400 });
  }
  if (!Array.isArray(sorok) || sorok.length === 0 || sorok.length > MAX_SOR) {
    return NextResponse.json({ error: `1–${MAX_SOR} sor küldhető egyszerre.` }, { status: 400 });
  }

  const eredmenyek = [];
  for (const sor of sorok) {
    try {
      eredmenyek.push(
        await gyermekMentes({
          nev: String(sor?.nev ?? ""),
          korosztaly: sor?.korosztaly ? String(sor.korosztaly) : null,
          vevokod: sor?.vevokod ? String(sor.vevokod) : null,
          emailek: Array.isArray(sor?.emailek) ? sor.emailek.map(String) : [],
        })
      );
    } catch (e) {
      console.error("Névjegyzék-mentési hiba:", e);
      eredmenyek.push({ allapot: "hiba" as const, uzenet: "Mentési hiba" });
    }
  }
  return NextResponse.json({ ok: true, eredmenyek });
}
