import "server-only";
import { get } from "@vercel/blob";
import { sendEmail } from "../email";
import { getBeallitasok } from "../sanity/tartalom";
import { sql, type Szamla } from "./db";
import { szamlaLevel } from "./levelek";

// Értesítő levél a szülőnek, a számla PDF-jével csatolva. Siker esetén
// rögzíti az értesítés időpontját.
export async function szamlaErtesites(sz: Szamla, alapUrl: string, pdf?: Uint8Array) {
  let tartalom = pdf;
  if (!tartalom) {
    const blob = await get(sz.pdf_pathname, { access: "private" });
    if (blob?.statusCode !== 200 || !blob.stream) throw new Error("A számla PDF nem található");
    tartalom = new Uint8Array(await new Response(blob.stream).arrayBuffer());
  }
  const b = await getBeallitasok();
  const level = szamlaLevel(sz, `${alapUrl}/fiok`);
  await sendEmail({
    to: sz.email,
    ...level,
    // A szülő válasza a klub központi címére menjen, ne a feladóra.
    replyTo: b?.email ?? "info@vkla.hu",
    attachments: [
      {
        filename: `szamla-${sz.szamlaszam.replace(/[^\w.-]+/g, "_")}.pdf`,
        content: Buffer.from(tartalom).toString("base64"),
      },
    ],
  });
  await sql().query(`UPDATE szamla SET ertesitve_at = now() WHERE id = $1`, [sz.id]);
}
