import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { emailEnabled } from "../../../lib/email";
import { SZAMLA_MEZOK, fiokEnabled, sql, type Szamla } from "../../../lib/fiok/db";
import { aktualisEmail, ervenyesEmail, isAdmin, normalizeEmail, siteUrl } from "../../../lib/fiok/auth";
import { szamlaErtesites } from "../../../lib/fiok/szamlak";

// Egy számla feltöltése (a pénzügyi felület soronként hívja, CSV-ből vagy
// egyenként): PDF a privát Blob-tárba, adatok az adatbázisba, és kérésre
// értesítő levél a szülőnek a PDF-fel csatolva.

const MAX_PDF = 4 * 1024 * 1024;
const DATUM = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(req: Request) {
  if (!fiokEnabled) return NextResponse.json({ error: "Az adatbázis nincs beállítva." }, { status: 503 });
  const admin = await aktualisEmail();
  if (!isAdmin(admin)) return NextResponse.json({ error: "Nincs jogosultság." }, { status: 403 });

  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return NextResponse.json({ error: "Hibás kérés." }, { status: 400 });
  }
  const mezo = (k: string) => String(fd.get(k) ?? "").trim() || null;

  const szamlaszam = mezo("szamlaszam");
  const email = normalizeEmail(mezo("email") ?? "");
  const osszeg = Number(String(mezo("osszeg") ?? "").replace(/[^\d]/g, ""));
  const kelt = mezo("kelt");
  const hatarido = mezo("hatarido");
  const pdf = fd.get("pdf");

  const hibak: string[] = [];
  if (!szamlaszam || szamlaszam.length > 100) hibak.push("számlaszám");
  if (!ervenyesEmail(email)) hibak.push("e-mail-cím");
  if (!Number.isInteger(osszeg) || osszeg <= 0) hibak.push("összeg");
  if (kelt && !DATUM.test(kelt)) hibak.push("kelt (ÉÉÉÉ-HH-NN)");
  if (hatarido && !DATUM.test(hatarido)) hibak.push("határidő (ÉÉÉÉ-HH-NN)");
  if (!(pdf instanceof File) || pdf.size === 0) hibak.push("PDF");
  if (hibak.length) {
    return NextResponse.json({ error: `Hiányzó vagy hibás: ${hibak.join(", ")}` }, { status: 400 });
  }

  const fajl = pdf as File;
  if (fajl.size > MAX_PDF) return NextResponse.json({ error: "A PDF túl nagy (max. 4 MB)." }, { status: 400 });
  const bajtok = new Uint8Array(await fajl.arrayBuffer());
  if (new TextDecoder().decode(bajtok.slice(0, 5)) !== "%PDF-") {
    return NextResponse.json({ error: "A fájl nem PDF." }, { status: 400 });
  }

  const db = sql();
  const letezo = (await db.query(`SELECT 1 FROM szamla WHERE szamlaszam = $1`, [szamlaszam])) as unknown[];
  if (letezo.length) {
    return NextResponse.json({ error: "Ez a számlaszám már fel van töltve." }, { status: 409 });
  }

  const idoszak = mezo("idoszak");
  const biztonsagos = (s: string) => s.replace(/[^\w.-]+/g, "_").slice(0, 80);
  const blob = await put(
    `szamlak/${biztonsagos(idoszak ?? "egyeb")}/${biztonsagos(szamlaszam!)}.pdf`,
    Buffer.from(bajtok),
    { access: "private", addRandomSuffix: true, contentType: "application/pdf" }
  );

  const [sz] = (await db.query(
    `INSERT INTO szamla (szamlaszam, email, vevo_nev, gyermek_nev, korosztaly, idoszak, osszeg, kelt, hatarido, pdf_pathname)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING ${SZAMLA_MEZOK}`,
    [
      szamlaszam,
      email,
      mezo("vevo_nev"),
      mezo("gyermek_nev"),
      mezo("korosztaly"),
      idoszak,
      osszeg,
      kelt,
      hatarido,
      blob.pathname,
    ]
  )) as Szamla[];

  let ertesitesHiba: string | null = null;
  if (fd.get("ertesites") === "1") {
    if (!emailEnabled) {
      ertesitesHiba = "Az e-mail-küldés nincs bekapcsolva.";
    } else {
      try {
        await szamlaErtesites(sz, siteUrl(req), bajtok);
      } catch (e) {
        console.error("Számla-értesítés hiba:", e);
        ertesitesHiba = "A számla feltöltve, de az értesítő levél nem ment ki — később újraküldhető.";
      }
    }
  }

  return NextResponse.json({ ok: true, id: sz.id, ertesitesHiba });
}
