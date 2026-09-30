import nodemailer from "nodemailer";

// E-mailek (űrlap-értesítők, jelszó-linkek, számlák) szabványos SMTP-n.
// Szolgáltatófüggetlen: a klub saját levelezője (webmuhely.hu), Scaleway TEM,
// Brevo stb. egyaránt működik — csak az SMTP_* env-értékek változnak.
// SMTP_HOST vagy EMAIL_FROM nélkül a küldés kikapcsolt állapotban van — az
// űrlapok gombja inaktív, az API 503-at ad. A FORMS_TO_OVERRIDE env-vel
// (staging) minden levél egyetlen címre irányítható át, hogy teszt közben ne
// az ügyfél postafiókja kapja a próbákat.

const HOST = process.env.SMTP_HOST;
const PORT = Number(process.env.SMTP_PORT || 587);
const FROM = process.env.EMAIL_FROM;
const OVERRIDE = process.env.FORMS_TO_OVERRIDE;
// Két levél között tartott minimális szünet (ms) — ha a szolgáltató
// másodpercenkénti korlátot szab. Alapból nincs szünet.
const SZUNET = Number(process.env.EMAIL_SZUNET_MS || 0);

export const emailEnabled = !!HOST && !!FROM;

let transzport: nodemailer.Transporter | null = null;

function smtp(): nodemailer.Transporter {
  transzport ??= nodemailer.createTransport({
    host: HOST,
    port: PORT,
    // 465 = azonnali TLS; 587/25 = STARTTLS, amit kötelezővé teszünk, hogy
    // a levél (és a jelszó) ne mehessen titkosítatlanul. Helyi teszt-
    // postafióknál (localhost) ez kikapcsol.
    secure: PORT === 465,
    requireTLS: PORT !== 465 && !["localhost", "127.0.0.1"].includes(HOST ?? ""),
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? "" } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transzport;
}

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

// Egyszerű szöveges változat a HTML mellé: a csak-HTML levelet a spamszűrők
// gyanúsabbnak tartják, és néhány levelezőprogram csak a szöveget mutatja.
export function szovegesValtozat(html: string): string {
  return html
    .replace(/<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, felirat) => `${felirat} (${href})`)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h\d|tr|li|table)>/gi, "\n")
    .replace(/<\/td>\s*<td[^>]*>/gi, ": ")
    .replace(/<\/td>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export type Csatolmany = { filename: string; content: Buffer };

// Átmeneti hiba (a szolgáltató pillanatnyi korlátja, 4xx válasz vagy
// megszakadt kapcsolat) — ilyenkor rövid várakozás után újrapróbáljuk.
function atmeneti(e: unknown): boolean {
  const h = e as { responseCode?: number; code?: string };
  if (typeof h.responseCode === "number") return h.responseCode >= 400 && h.responseCode < 500;
  return ["ECONNECTION", "ETIMEDOUT", "ESOCKET", "EDNS", "ECONNRESET"].includes(h.code ?? "");
}

let utolsoKuldes = 0;

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
  if (!emailEnabled) throw new Error("Az e-mail-küldés nincs beállítva (SMTP_HOST, EMAIL_FROM)");
  const level = {
    from: FROM,
    to: OVERRIDE ?? to,
    subject: OVERRIDE ? `[teszt → ${to}] ${subject}` : subject,
    html,
    text: szovegesValtozat(html),
    ...(replyTo ? { replyTo } : {}),
    ...(attachments?.length ? { attachments } : {}),
  };
  for (let probalkozas = 0; ; probalkozas++) {
    const varni = utolsoKuldes + SZUNET - Date.now();
    if (varni > 0) await new Promise((r) => setTimeout(r, varni));
    utolsoKuldes = Date.now();
    try {
      await smtp().sendMail(level);
      return;
    } catch (e) {
      if (probalkozas < 2 && atmeneti(e)) {
        await new Promise((r) => setTimeout(r, 1500 * (probalkozas + 1)));
        continue;
      }
      throw e;
    }
  }
}
