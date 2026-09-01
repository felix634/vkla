import { NextResponse } from "next/server";
import { stripe, stripeMode, TAGDIJ_MONTHLY_HUF } from "../../../lib/tagdij/stripe";

// Havi ismétlődő tagdíj-fizetés indítása (az ügyfél kérése szerint
// ismétlődő, nem egyszeri — 2026.04.13-i e-mail).
export async function POST(req: Request) {
  let body: { szulo?: string; email?: string; gyermek?: string; korosztaly?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Hibás kérés." }, { status: 400 });
  }

  const szulo = body.szulo?.trim();
  const email = body.email?.trim();
  const gyermek = body.gyermek?.trim();
  const korosztaly = body.korosztaly?.trim();
  if (!szulo || !email || !gyermek || !korosztaly) {
    return NextResponse.json({ error: "Minden mező kitöltése kötelező." }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Érvénytelen e-mail cím." }, { status: 400 });
  }

  const origin = req.headers.get("origin") ?? "http://localhost:3000";

  // DEMO mód: Stripe-kulcs nélkül a folyamat fizetés nélkül zárul.
  if (!stripe) {
    return NextResponse.json({ url: `${origin}/tagdij?fizetes=siker&mod=demo` });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "huf",
            unit_amount: TAGDIJ_MONTHLY_HUF * 100,
            recurring: { interval: "month" },
            product_data: {
              name: `Képzési díj — ${gyermek} (${korosztaly})`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { szulo, gyermek, korosztaly },
      subscription_data: { metadata: { szulo, gyermek, korosztaly } },
      locale: "hu",
      success_url: `${origin}/tagdij?fizetes=siker&mod=${stripeMode}`,
      cancel_url: `${origin}/tagdij?fizetes=megszakitva`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe checkout hiba:", e);
    return NextResponse.json(
      { error: "A fizetés indítása nem sikerült. Próbáld újra később." },
      { status: 500 }
    );
  }
}
