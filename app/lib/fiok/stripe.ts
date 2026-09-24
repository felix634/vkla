import "server-only";
import Stripe from "stripe";

// Bankkártyás fizetés — számlánként, a kiállított számla sorszámára
// hivatkozva (a klub kérése, 2026.09.23). A klub a kártyás fizetést jövő év
// elejére halasztotta, ezért alapból KIKAPCSOLVA: csak KARTYAS_FIZETES=1 és
// Stripe-kulcs együttes megléte esetén jelenik meg a „Fizetés kártyával” gomb.
//   sk_test_... kulcs: teszt-kártyákkal próbálható
//   sk_live_... kulcs: éles fizetés (a klub kereskedői fiókjával)

const secretKey = process.env.STRIPE_SECRET_KEY ?? "";

export const stripe: Stripe | null = secretKey ? new Stripe(secretKey) : null;

export const kartyasFizetes = !!stripe && process.env.KARTYAS_FIZETES === "1";
