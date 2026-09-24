import { NextResponse } from "next/server";
import { fiokEnabled, szamlaById } from "../../../lib/fiok/db";
import { aktualisEmail, siteUrl } from "../../../lib/fiok/auth";
import { kartyasFizetes, stripe } from "../../../lib/fiok/stripe";

// Egy kiállított számla kifizetése bankkártyával (Stripe Checkout, egyszeri
// fizetés a számla összegére, a számlaszámmal a leírásban).
export async function POST(req: Request) {
  if (!fiokEnabled || !kartyasFizetes || !stripe) {
    return NextResponse.json({ error: "A bankkártyás fizetés jelenleg nem elérhető." }, { status: 503 });
  }
  const email = await aktualisEmail();
  if (!email) return NextResponse.json({ error: "Bejelentkezés szükséges." }, { status: 401 });

  let id = "";
  try {
    id = String((await req.json()).id ?? "");
  } catch {
    return NextResponse.json({ error: "Hibás kérés." }, { status: 400 });
  }
  const sz = await szamlaById(id);
  if (!sz || sz.email !== email) return NextResponse.json({ error: "Nem található." }, { status: 404 });
  if (sz.fizetve_at) return NextResponse.json({ error: "Ez a számla már ki van fizetve." }, { status: 409 });

  const alap = siteUrl(req);
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "huf",
            unit_amount: sz.osszeg * 100,
            product_data: {
              name: `Képzési díj — ${sz.szamlaszam}`,
              description: [sz.gyermek_nev, sz.korosztaly, sz.idoszak].filter(Boolean).join(" · ") || undefined,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { szamla_id: sz.id, szamlaszam: sz.szamlaszam },
      payment_intent_data: {
        description: `Számla: ${sz.szamlaszam}`,
        metadata: { szamla_id: sz.id, szamlaszam: sz.szamlaszam },
      },
      locale: "hu",
      success_url: `${alap}/fiok?fizetes=siker`,
      cancel_url: `${alap}/fiok`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe checkout hiba:", e);
    return NextResponse.json({ error: "A fizetés indítása nem sikerült. Próbáld újra később." }, { status: 500 });
  }
}
