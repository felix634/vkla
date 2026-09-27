import "server-only";
import { esc, gomb, sorok } from "../email";
import type { Szamla } from "./db";
import { BANKSZAMLA, KEDVEZMENYEZETT, datum, ft, idoszak, kozlemeny } from "./format";

const keret = (tartalom: string) =>
  `<div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;font-size:14px;line-height:1.55;max-width:560px">` +
  tartalom +
  `<p style="color:#94a3b8;font-size:12px;margin-top:28px">Vasas Kubala Akadémia · 1139 Budapest, Fáy utca 58.</p></div>`;

const labjegy = (szoveg: string) => `<p style="color:#64748b;font-size:13px">${szoveg}</p>`;

// Regisztráció befejezése / új jelszó / már létező fiók — mindhárom egy
// jelszó-beállító linket küld, csak a szöveg más.
export function jelszoLevel(
  tipus: "regisztracio" | "elfelejtett" | "marVanFiok",
  link: string,
  ervenyes: string
): { subject: string; html: string } {
  const szoveg = {
    regisztracio: {
      subject: "VKLA szülői fiók — regisztráció befejezése",
      cim: "Már csak a jelszavad hiányzik",
      bev: "Köszönjük a regisztrációt! Az alábbi gombra kattintva add meg a jelszavadat, és utána beléphetsz a Vasas Kubala Akadémia szülői fiókjába.",
      gomb: "Jelszó beállítása",
    },
    elfelejtett: {
      subject: "VKLA szülői fiók — új jelszó beállítása",
      cim: "Új jelszó beállítása",
      bev: "Az alábbi gombra kattintva adhatsz meg új jelszót a szülői fiókodhoz.",
      gomb: "Új jelszó beállítása",
    },
    marVanFiok: {
      subject: "VKLA szülői fiók — már van fiókod",
      cim: "Ezzel a címmel már van fiókod",
      bev: "Valaki (remélhetőleg te) regisztrálni próbált ezzel az e-mail-címmel, de már van szülői fiókod. Ha elfelejtetted a jelszavad, az alábbi gombra kattintva újat állíthatsz be.",
      gomb: "Új jelszó beállítása",
    },
  }[tipus];
  return {
    subject: szoveg.subject,
    html: keret(
      `<h2 style="font-size:18px;margin:0 0 12px">${szoveg.cim}</h2>` +
        `<p>${szoveg.bev}</p>` +
        gomb(link, szoveg.gomb) +
        labjegy(`A link ${ervenyes} érvényes, és egyszer használható. Ha nem te kérted, nyugodtan hagyd figyelmen kívül ezt a levelet.`)
    ),
  };
}

export function szamlaLevel(sz: Szamla, alapUrl: string): { subject: string; html: string } {
  const kinek = sz.gyermek_nev ? ` (${sz.gyermek_nev})` : "";
  return {
    subject: `Képzési díj számla — ${idoszak(sz.idoszak)}${kinek}`,
    html: keret(
      `<h2 style="font-size:18px;margin:0 0 12px">Új számla érkezett</h2>` +
        `<p>Kedves Szülő!</p>` +
        `<p>Elkészült a képzési díjról szóló számla. A számlát csatolva küldjük, és a szülői fiókban is bármikor megtalálod.</p>` +
        sorok([
          ["Számlaszám", sz.szamlaszam],
          ["Gyermek", [sz.gyermek_nev, sz.korosztaly].filter(Boolean).join(" · ") || undefined],
          ["Időszak", idoszak(sz.idoszak)],
          ["Összeg", ft(sz.osszeg)],
          ["Fizetési határidő", sz.hatarido ? datum(sz.hatarido) : undefined],
        ]) +
        `<p style="margin-top:18px"><strong>Befizetés átutalással:</strong> ${esc(KEDVEZMENYEZETT)}, ${esc(BANKSZAMLA)}<br/>` +
        `<span style="color:#64748b">Közlemény: ${esc(kozlemeny(sz))}</span></p>` +
        gomb(`${alapUrl}/fiok`, "Szülői fiók megnyitása") +
        labjegy(
          `Még nincs fiókod? <a href="${esc(`${alapUrl}/regisztracio`)}" style="color:#123274">Regisztrálj ezzel az e-mail-címmel</a>, és minden számlád egy helyen lesz.`
        )
    ),
  };
}
