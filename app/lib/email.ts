// E-mailek (űrlap-értesítők, belépési linkek, számlák) a Resend REST API-n
// keresztül (SDK nélkül).
// RESEND_API_KEY nélkül a küldés kikapcsolt állapotban van — az űrlapok
// gombja inaktív, az API 503-at ad. A FORMS_TO_OVERRIDE env-vel (staging)
// minden levél egyetlen címre irányítható át, hogy teszt közben ne az
// ügyfél postafiókja kapja a próbákat.

const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM ?? "VKLA weboldal <onboarding@resend.dev>";
const OVERRIDE = process.env.FORMS_TO_OVERRIDE;

export const emailEnabled = !!API_KEY;

export function esc(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function sorok(parok: [string, string | undefined][]): string {
  const tr = parok
    .filter(([, v]) => v && v.trim())
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 14px 6px 0;color:#64748b;font-size:13px;white-space:nowrap;vertical-align:top">${esc(k)}</td>` +
        `<td style="padding:6px 0;color:#0f172a;font-size:14px">${esc(v!.trim()).replaceAll("\n", "<br/>")}</td></tr>`
    )
    .join("");
  return `<table style="border-collapse:collapse">${tr}</table>`;
}

// Egyszerű, levélkliens-barát gomb (táblázat nélkül is jól jelenik meg).
export function gomb(href: string, felirat: string): string {
  return (
    `<p style="margin:24px 0"><a href="${esc(href)}" style="display:inline-block;background:#123274;color:#ffffff;` +
    `font-weight:bold;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:6px">${esc(felirat)}</a></p>`
  );
}

export type Csatolmany = { filename: string; content: string /* base64 */ };

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: Csatolmany[];
}): Promise<void> {
  if (!API_KEY) throw new Error("RESEND_API_KEY nincs beállítva");
  const body = JSON.stringify({
    from: FROM,
    to: [OVERRIDE ?? to],
    subject: OVERRIDE ? `[teszt → ${to}] ${subject}` : subject,
    html,
    ...(replyTo ? { reply_to: replyTo } : {}),
    ...(attachments?.length ? { attachments } : {}),
  });
  // Tömeges számlaküldésnél a Resend másodpercenkénti korlátja (429) elérhető —
  // ilyenkor rövid várakozás után újrapróbáljuk.
  for (let probalkozas = 0; ; probalkozas++) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body,
    });
    if (res.ok) return;
    if (res.status === 429 && probalkozas < 3) {
      await new Promise((r) => setTimeout(r, 1100 * (probalkozas + 1)));
      continue;
    }
    const hiba = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${hiba.slice(0, 300)}`);
  }
}
