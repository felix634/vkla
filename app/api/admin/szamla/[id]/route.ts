import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { emailEnabled } from "../../../../lib/email";
import { fiokEnabled, sql, szamlaById } from "../../../../lib/fiok/db";
import { aktualisEmail, isAdmin, siteUrl } from "../../../../lib/fiok/auth";
import { szamlaErtesites } from "../../../../lib/fiok/szamlak";

// Pénzügyi műveletek egy számlán: értesítő újraküldése, fizetettnek jelölés
// (és visszavonása), illetve törlés (pl. téves feltöltés).

async function jogosult() {
  return fiokEnabled && isAdmin(await aktualisEmail());
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await jogosult())) return NextResponse.json({ error: "Nincs jogosultság." }, { status: 403 });
  const sz = await szamlaById(params.id);
  if (!sz) return NextResponse.json({ error: "Nem található." }, { status: 404 });

  let muvelet = "";
  try {
    muvelet = String((await req.json()).muvelet ?? "");
  } catch {
    return NextResponse.json({ error: "Hibás kérés." }, { status: 400 });
  }

  if (muvelet === "ujrakuldes") {
    if (!emailEnabled) return NextResponse.json({ error: "Az e-mail-küldés nincs bekapcsolva." }, { status: 503 });
    try {
      await szamlaErtesites(sz, siteUrl(req));
    } catch (e) {
      console.error("Újraküldési hiba:", e);
      return NextResponse.json({ error: "A levél elküldése nem sikerült." }, { status: 500 });
    }
  } else if (muvelet === "fizetve") {
    await sql().query(`UPDATE szamla SET fizetve_at = now() WHERE id = $1`, [sz.id]);
  } else if (muvelet === "nemfizetve") {
    await sql().query(`UPDATE szamla SET fizetve_at = NULL WHERE id = $1`, [sz.id]);
  } else {
    return NextResponse.json({ error: "Ismeretlen művelet." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await jogosult())) return NextResponse.json({ error: "Nincs jogosultság." }, { status: 403 });
  const sz = await szamlaById(params.id);
  if (!sz) return NextResponse.json({ error: "Nem található." }, { status: 404 });
  await del(sz.pdf_pathname);
  await sql().query(`DELETE FROM szamla WHERE id = $1`, [sz.id]);
  return NextResponse.json({ ok: true });
}
