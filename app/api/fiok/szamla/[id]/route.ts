import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { fiokEnabled, szamlaById } from "../../../../lib/fiok/db";
import { aktualisEmail, isAdmin } from "../../../../lib/fiok/auth";

// Számla-PDF letöltése a privát Blob-tárból. Csak a számla címzettje
// (vagy a pénzügy) érheti el — a jogosultság-ellenőrzés itt, közvetlenül a
// get() mellett történik, nem middleware-ben.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!fiokEnabled) return new NextResponse("Nem elérhető", { status: 503 });

  const email = await aktualisEmail();
  if (!email) return new NextResponse("Bejelentkezés szükséges", { status: 401 });

  const sz = await szamlaById(params.id);
  if (!sz || (sz.email !== email && !isAdmin(email))) {
    return new NextResponse("Nem található", { status: 404 });
  }

  const blob = await get(sz.pdf_pathname, { access: "private" });
  if (blob?.statusCode !== 200 || !blob.stream) {
    return new NextResponse("Nem található", { status: 404 });
  }

  const fajlnev = `szamla-${sz.szamlaszam.replace(/[^\w.-]+/g, "_")}.pdf`;
  return new NextResponse(blob.stream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fajlnev}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
