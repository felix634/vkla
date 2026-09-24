import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { fiokEnabled, sql } from "../../../lib/fiok/db";
import { stripe } from "../../../lib/fiok/stripe";

// Stripe webhook: sikeres kártyás fizetés után a számla „Fizetve” jelölést
// kap. Élesben kötelező a STRIPE_WEBHOOK_SECRET (aláírás-ellenőrzés).
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret || !fiokEnabled) {
    return NextResponse.json({ error: "Nincs konfigurálva." }, { status: 501 });
  }

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, req.headers.get("stripe-signature") ?? "", secret);
  } catch (e) {
    console.error("Webhook aláírás-hiba:", e);
    return NextResponse.json({ error: "Érvénytelen aláírás." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    const id = session.metadata?.szamla_id;
    if (id && session.payment_status === "paid") {
      await sql().query(`UPDATE szamla SET fizetve_at = now() WHERE id = $1 AND fizetve_at IS NULL`, [id]);
    }
  }
  return NextResponse.json({ received: true });
}
