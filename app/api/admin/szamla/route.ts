import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { emailEnabled } from "../../../lib/email";
import { SZAMLA_MEZOK, fiokEnabled, sql, type Szamla } from "../../../lib/fiok/db";
import { aktualisEmail, isAdmin, siteUrl } from "../../../lib/fiok/auth";
import { gyermekKeres } from "../../../lib/fiok/nevjegyzek";
import { szamlaErtesites } from "../../../lib/fiok/szamlak";

// A levélküldés átmeneti hibáknál újrapróbál — ehhez több idő kell az alapnál.
export const maxDuration = 60;

// Egy számla feltöltése (a pénzügyi felület soronként hívja, táblázatból vagy
// egyenként): a számla a névjegyzék gyermekéhez párosul (vevőkód vagy név),
// a PDF a privát Blob-tárba kerül, és kérésre értesítő levél megy a gyermekhez
// rendelt összes szülői címre, a PDF-fel csatolva.

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
  const gyermekNev = mezo("gyermek_nev");
  const vevokod = mezo("vevokod");
  const osszeg = Number(String(mezo("osszeg") ?? "").replace(/[^\d]/g, ""));
  const kelt = mezo("kelt");
  const hatarido = mezo("hatarido");
  const pdf = fd.get("pdf");

  const hibak: string[] = [];
  if (!szamlaszam || szamlaszam.length > 100) hibak.push("számlaszám");
  if (!gyermekNev && !vevokod) hibak.push("gyermek neve vagy vevőkód");
  if (!Number.isInteger(osszeg) || osszeg <= 0) hibak.push("összeg");
  if (kelt && !DATUM.test(kelt)) hibak.push("kelt (ÉÉÉÉ-HH-NN)");
  if (hatarido && !DATUM.test(hatarido)) hibak.push("határidő (ÉÉÉÉ-HH-NN)");
  if (!(pdf instanceof File) || pdf.size === 0) hibak.push("PDF");
  if (hibak.length) {
    return NextResponse.json({ error: `Hiányzó vagy hibás: ${hibak.join(", ")}` }, { status: 400 });
  }

  const talalat = await gyermekKeres(gyermekNev, vevokod);
  if ("hiba" in talalat) {
    return NextResponse.json(
      {
        error:
          talalat.hiba === "tobb"
            ? "Több azonos nevű gyermek van a névjegyzékben — adj meg vevőkódot."
            : "Nincs ilyen gyermek a névjegyzékben — előbb vedd fel a Szülői névjegyzékbe.",
      },
      { status: 422 }
    );
  }
  const gyermek = talalat.gyermek;

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
    `WITH uj AS (
       INSERT INTO szamla (szamlaszam, gyermek_id, gyermek_nev, korosztaly, idoszak, osszeg, kelt, hatarido, pdf_pathname)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
     ) SELECT ${SZAMLA_MEZOK} FROM uj s`,
    [
      szamlaszam,
      gyermek.id,
      gyermek.nev,
      gyermek.korosztaly ?? mezo("korosztaly"),
      idoszak,
      osszeg,
      kelt,
      hatarido,
      blob.pathname,
    ]
  )) as Szamla[];

  let ertesitesHiba: string | null = null;
  let cimzettek = 0;
  if (fd.get("ertesites") === "1") {
    if (!emailEnabled) {
      ertesitesHiba = "Az e-mail-küldés nincs bekapcsolva.";
    } else {
      try {
        cimzettek = await szamlaErtesites(sz, siteUrl(req), bajtok);
      } catch (e) {
        ertesitesHiba =
          e instanceof Error && e.message === "NINCS_CIM"
            ? "Feltöltve, de a gyermekhez nincs szülői e-mail-cím a névjegyzékben."
            : "Feltöltve, de az értesítő levél nem ment ki — később újraküldhető.";
        if (!(e instanceof Error && e.message === "NINCS_CIM")) console.error("Számla-értesítés hiba:", e);
      }
    }
  }

  return NextResponse.json({ ok: true, id: sz.id, gyermek: gyermek.nev, cimzettek, ertesitesHiba });
}
