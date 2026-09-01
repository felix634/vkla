import { NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { stripe } from "../../../lib/tagdij/stripe";
import { projectId, apiVersion } from "../../../../sanity/env";

// Stripe webhook: sikeres befizetések naplózása.
// A fizetési adatok NEM a publikus "production" datasetbe kerülnek, hanem a
// külön, PRIVÁT "tagdij" datasetbe (Manage -> Datasets -> New: "tagdij",
// Private). Amíg az nincs létrehozva, a webhook csak naplóz.

const TAGDIJ_DATASET = process.env.SANITY_TAGDIJ_DATASET ?? "tagdij";

function penzugyClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token || !projectId) return null;
  return createClient({
    projectId,
    dataset: TAGDIJ_DATASET,
    apiVersion,
    token,
    useCdn: false,
  });
}

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe nincs konfigurálva." }, { status: 501 });
  }

  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (secret && signature) {
      event = await stripe.webhooks.constructEventAsync(payload, signature, secret);
    } else {
      // Fejlesztés alatt aláírás-ellenőrzés nélkül is olvasható.
      event = JSON.parse(payload);
    }
  } catch (e) {
    console.error("Webhook aláírás-hiba:", e);
    return NextResponse.json({ error: "Érvénytelen aláírás." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "invoice.paid") {
    const obj = event.data?.object ?? {};
    const record = {
      _type: "befizetes",
      esemeny: event.type,
      stripeId: obj.id ?? null,
      email: obj.customer_email ?? obj.customer_details?.email ?? null,
      osszeg: obj.amount_total ?? obj.amount_paid ?? null,
      penznem: obj.currency ?? null,
      metadata: obj.metadata ?? {},
      idopont: new Date().toISOString(),
    };
    const client = penzugyClient();
    if (client) {
      try {
        await client.create(record);
      } catch (e) {
        // A privát dataset még nem létezik — csak naplózunk.
        console.error("Befizetés-napló mentési hiba (létezik a 'tagdij' dataset?):", e);
      }
    } else {
      console.log("Befizetés (napló):", JSON.stringify(record));
    }
  }

  return NextResponse.json({ received: true });
}
