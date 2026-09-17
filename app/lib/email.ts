// Űrlap-értesítő e-mailek a Resend REST API-n keresztül (SDK nélkül).
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

export async function sendFormEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<void> {
  if (!API_KEY) throw new Error("RESEND_API_KEY nincs beállítva");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [OVERRIDE ?? to],
      subject: OVERRIDE ? `[teszt → ${to}] ${subject}` : subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  if (!res.ok) {
    const hiba = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${hiba.slice(0, 300)}`);
  }
}
