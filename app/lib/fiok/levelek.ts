import "server-only";
import { esc, gomb, sorok } from "../email";
import type { Szamla } from "./db";
import { BANKSZAMLA, KEDVEZMENYEZETT, datum, ft, idoszak, kozlemeny } from "./format";

const keret = (tartalom: string) =>
  `<div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;font-size:14px;line-height:1.55;max-width:560px">` +
  tartalom +
  `<p style="color:#94a3b8;font-size:12px;margin-top:28px">Vasas Kubala Akadémia · 1139 Budapest, Fáy utca 58.</p></div>`;

export function belepoLevel(link: string): { subject: string; html: string } {
  return {
    subject: "Belépés a VKLA szülői fiókba",
    html: keret(
      `<h2 style="font-size:18px;margin:0 0 12px">Belépés a szülői fiókba</h2>` +
        `<p>Az alábbi gombra kattintva léphetsz be a Vasas Kubala Akadémia szülői fiókjába, ahol a képzési díj számláidat találod.</p>` +
        gomb(link, "Belépés a fiókba") +
        `<p style="color:#64748b;font-size:13px">A link 30 percig érvényes, és egyszer használható. Ha nem te kérted, nyugodtan hagyd figyelmen kívül ezt a levelet.</p>`
    ),
  };
}

export function szamlaLevel(sz: Szamla, fiokUrl: string): { subject: string; html: string } {
  const kinek = sz.gyermek_nev ? ` (${sz.gyermek_nev})` : "";
  return {
    subject: `Képzési díj számla — ${idoszak(sz.idoszak)}${kinek}`,
    html: keret(
      `<h2 style="font-size:18px;margin:0 0 12px">Új számla érkezett</h2>` +
        `<p>Kedves ${esc(sz.vevo_nev ?? "Szülő")}!</p>` +
        `<p>Elkészült a képzési díjról szóló számla. A számlát csatolva küldjük, és a szülői fiókodban is bármikor megtalálod.</p>` +
        sorok([
          ["Számlaszám", sz.szamlaszam],
          ["Gyermek", [sz.gyermek_nev, sz.korosztaly].filter(Boolean).join(" · ") || undefined],
          ["Időszak", idoszak(sz.idoszak)],
          ["Összeg", ft(sz.osszeg)],
          ["Fizetési határidő", sz.hatarido ? datum(sz.hatarido) : undefined],
        ]) +
        `<p style="margin-top:18px"><strong>Befizetés átutalással:</strong> ${esc(KEDVEZMENYEZETT)}, ${esc(BANKSZAMLA)}<br/>` +
        `<span style="color:#64748b">Közlemény: ${esc(kozlemeny(sz))}</span></p>` +
        gomb(fiokUrl, "Szülői fiók megnyitása")
    ),
  };
}
