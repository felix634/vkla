import { NextResponse } from "next/server";
import { fiokEnabled, sql } from "../../../../lib/fiok/db";
import { aktualisEmail, ervenyesEmail, isAdmin, normalizeEmail } from "../../../../lib/fiok/auth";

// Egy gyermek névjegyzék-adatainak módosítása: szülői e-mail-cím hozzáadása
// vagy eltávolítása, korosztály módosítása, illetve törlés.

async function jogosult() {
  return fiokEnabled && isAdmin(await aktualisEmail());
}

const ID = /^[0-9a-f-]{36}$/i;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await jogosult())) return NextResponse.json({ error: "Nincs jogosultság." }, { status: 403 });
  if (!ID.test(params.id)) return NextResponse.json({ error: "Nem található." }, { status: 404 });

  let body: { muvelet?: string; email?: string; korosztaly?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Hibás kérés." }, { status: 400 });
  }
  const db = sql();

  if (body.muvelet === "email_hozzaad" || body.muvelet === "email_torol") {
    const email = normalizeEmail(body.email ?? "");
    if (!ervenyesEmail(email)) return NextResponse.json({ error: "Érvénytelen e-mail-cím." }, { status: 400 });
    if (body.muvelet === "email_hozzaad") {
      await db.query(
        `INSERT INTO gyermek_email (gyermek_id, email) SELECT id, $2 FROM gyermek WHERE id = $1
         ON CONFLICT DO NOTHING`,
        [params.id, email]
      );
    } else {
      await db.query(`DELETE FROM gyermek_email WHERE gyermek_id = $1 AND email = $2`, [params.id, email]);
    }
  } else if (body.muvelet === "korosztaly") {
    await db.query(`UPDATE gyermek SET korosztaly = $2 WHERE id = $1`, [
      params.id,
      body.korosztaly?.trim() || null,
    ]);
  } else {
    return NextResponse.json({ error: "Ismeretlen művelet." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await jogosult())) return NextResponse.json({ error: "Nincs jogosultság." }, { status: 403 });
  if (!ID.test(params.id)) return NextResponse.json({ error: "Nem található." }, { status: 404 });
  const db = sql();
  const [{ n }] = (await db.query(`SELECT count(*)::int AS n FROM szamla WHERE gyermek_id = $1`, [
    params.id,
  ])) as { n: number }[];
  if (n > 0) {
    return NextResponse.json(
      { error: `A gyermekhez ${n} számla tartozik, ezért nem törölhető (a szülők így továbbra is látják a számláikat).` },
      { status: 409 }
    );
  }
  await db.query(`DELETE FROM gyermek WHERE id = $1`, [params.id]);
  return NextResponse.json({ ok: true });
}
