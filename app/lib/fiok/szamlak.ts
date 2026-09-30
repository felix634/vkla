import "server-only";
import { get } from "@vercel/blob";
import { sendEmail } from "../email";
import { getBeallitasok } from "../sanity/tartalom";
import { gyermekEmailjei, sql, type Szamla } from "./db";
import { szamlaLevel } from "./levelek";

// Értesítő levél a gyermekhez tartozó MINDEN szülői e-mail-címre, a számla
// PDF-jével csatolva. Visszaadja, hány címre ment ki; ha legalább egyre
// sikerült, rögzíti az értesítés időpontját. Ha egyre sem, a számla
// „levél pótlandó” jelölést kap, és a pénzügyi felületről később egy
// gombnyomással újraküldhető (pl. ha a levelező napi korlátja betelt).
export async function szamlaErtesites(sz: Szamla, alapUrl: string, pdf?: Uint8Array): Promise<number> {
  try {
    const elkuldve = await kuldes(sz, alapUrl, pdf);
    await sql().query(`UPDATE szamla SET ertesitve_at = now(), ertesites_hiba_at = NULL WHERE id = $1`, [sz.id]);
    return elkuldve;
  } catch (e) {
    await sql().query(`UPDATE szamla SET ertesites_hiba_at = now() WHERE id = $1`, [sz.id]);
    throw e;
  }
}

async function kuldes(sz: Szamla, alapUrl: string, pdf?: Uint8Array): Promise<number> {
  const cimek = await gyermekEmailjei(sz.gyermek_id);
  if (cimek.length === 0) throw new Error("NINCS_CIM");

  let tartalom = pdf;
  if (!tartalom) {
    const blob = await get(sz.pdf_pathname, { access: "private" });
    if (blob?.statusCode !== 200 || !blob.stream) throw new Error("A számla PDF nem található");
    tartalom = new Uint8Array(await new Response(blob.stream).arrayBuffer());
  }
  const b = await getBeallitasok();
  const level = szamlaLevel(sz, alapUrl);
  const csatolmany = {
    filename: `szamla-${sz.szamlaszam.replace(/[^\w.-]+/g, "_")}.pdf`,
    content: Buffer.from(tartalom),
  };

  let elkuldve = 0;
  let utolsoHiba: unknown = null;
  for (const to of cimek) {
    try {
      // A szülő válasza a klub központi címére menjen, ne a feladóra.
      await sendEmail({ to, ...level, replyTo: b?.email ?? "info@vkla.hu", attachments: [csatolmany] });
      elkuldve++;
    } catch (e) {
      utolsoHiba = e;
      console.error(`Számla-értesítés hiba (${sz.szamlaszam}):`, e);
    }
  }
  if (elkuldve === 0) throw utolsoHiba ?? new Error("A levél nem ment ki");
  return elkuldve;
}
