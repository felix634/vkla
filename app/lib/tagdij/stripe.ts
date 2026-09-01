import "server-only";
import Stripe from "stripe";

// Tagdíjfizetés — Stripe integráció, három üzemmódban:
//   1. DEMO  — nincs STRIPE_SECRET_KEY: a folyamat végigjárható, fizetés nélkül
//   2. TESZT — sk_test_... kulcs: valódi Stripe Checkout, teszt-kártyákkal
//   3. ÉLES  — sk_live_... kulcs: éles fizetés (az ügyfél kereskedői fiókjával)
//
// A szolgáltató-választás (Stripe vs. SimplePay) az ügyfél döntése — a
// folyamat (űrlap -> checkout -> webhook -> napló) szolgáltató-független,
// SimplePay esetén ez a modul cserélendő le.
//
// Az ügyféltől várt döntések (2026.08.04-i e-mail, 7 kérdés):
//   összegek/kedvezmények, fizetési időszak, szolgáltató + fogadó számla,
//   automatikus terhelés vs. kézi indítás, számlázás (Számlázz.hu/Billingo),
//   BigMac API hozzáférés.

const secretKey = process.env.STRIPE_SECRET_KEY ?? "";

export const stripeMode: "demo" | "test" | "live" = !secretKey
  ? "demo"
  : secretKey.startsWith("sk_test_")
    ? "test"
    : "live";

export const stripe: Stripe | null = secretKey ? new Stripe(secretKey) : null;

// Minta havi tagdíj (Ft) — a valós összegek az ügyfél válaszáig env-ből jönnek.
export const TAGDIJ_MONTHLY_HUF = Number(process.env.TAGDIJ_MONTHLY_HUF ?? "15000");
