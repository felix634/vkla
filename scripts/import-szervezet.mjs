// Szakmai stáb + csapatok importja a Drive "Szervezet.docx" alapján.
// Forrás: VKLA - weboldal/Szervezet/Szervezet.docx (2026. szeptemberi állapot).
// Idempotens: determinisztikus _id-k, createOrReplace.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@sanity/client";

const COACHES = [
  ["Nagy Miklós", "Akadémia igazgató"],
  ["Tóth Csaba", "Szakmai vezető, felső szekció vezetője"],
  ["Angyal Péter", "Alsó szekció vezetője"],
  ["Belvon Attila", "U19 vezetőedző"],
  ["Horváth Gábor", "U17 vezetőedző"],
  ["Lengyel Patrik", "U16 vezetőedző"],
  ["Pfister Erik", "U15 vezetőedző"],
  ["Balázs Péter", "U14 vezetőedző"],
  ["Oláh Dániel", "U13 vezetőedző"],
  ["Blaumann János", "U12 vezetőedző"],
  ["Hegedűs Patrik", "U11 vezetőedző"],
  ["Ferencz Ákos", "U10 vezetőedző"],
  ["Kormos Marcell", "U9 vezetőedző"],
  ["Németh Gergely", "U8-A vezetőedző"],
  ["Orosz Dávid", "U8-B és U5-7 vezetőedző"],
  ["Hámori Ferenc", "Felnőtt női csapat vezetőedzője"],
  ["Pintér Róbert", "U19 és U16 leány vezetőedző"],
  ["Ludmán Andor", "U14 leány vezetőedző, női kapusedző"],
  ["Zádori Enikő", "U12 és U10 leány vezetőedző"],
  ["Cserpák Dániel", "Asszisztensedző, videoelemző"],
  ["Máj Zoltán", "Asszisztensedző"],
  ["Gál Mátyás", "Asszisztensedző, videoelemző"],
  ["Jekler Tas", "Asszisztensedző"],
  ["Csoszor Gergely", "Utánpótlásedző"],
  ["Gömöri Ottó", "Kapusedző (U19–U16)"],
  ["Bollók Gábor", "Kapusedző (U17–U15)"],
  ["Szakács Kristóf", "Kapusedző (U14–U12)"],
  ["Tulipán Ákos", "Kapusedző (U11–U8)"],
  ["Répási László", "Erőnléti edző"],
  ["Kiss Attila", "Erőnléti edző"],
  ["Nagy Barnabás", "Erőnléti edző"],
  ["Sárközi Tamás", "Fizioterapeuta"],
  ["Nemes Kristóf", "Fizioterapeuta"],
  ["Nagy Lívia", "Fizioterapeuta"],
  ["Kiss András", "Sportpszichológus"],
  ["Vadicska Olivér", "Videoelemző"],
];

// [név, szekció, vezetőedző, asszisztensek]
const TEAMS = [
  ["U19", "Felső szekció", "Belvon Attila", ["Lengyel Patrik", "Cserpák Dániel"]],
  ["U17", "Felső szekció", "Horváth Gábor", ["Pfister Erik", "Máj Zoltán", "Gál Mátyás"]],
  ["U16", "Felső szekció", "Lengyel Patrik", ["Belvon Attila", "Cserpák Dániel"]],
  ["U15", "Felső szekció", "Pfister Erik", ["Horváth Gábor", "Máj Zoltán", "Gál Mátyás"]],
  ["U14", "Felső szekció", "Balázs Péter", ["Jekler Tas"]],
  ["U13", "Alsó szekció", "Oláh Dániel", ["Jekler Tas"]],
  ["U12", "Alsó szekció", "Blaumann János", ["Oláh Dániel"]],
  ["U11", "Alsó szekció", "Hegedűs Patrik", ["Ferencz Ákos"]],
  ["U10", "Alsó szekció", "Ferencz Ákos", ["Hegedűs Patrik"]],
  ["U9", "Alsó szekció", "Kormos Marcell", ["Németh Gergely"]],
  ["U8-A", "Alsó szekció", "Németh Gergely", ["Kormos Marcell"]],
  ["U8-B", "Alsó szekció", "Orosz Dávid", []],
  ["U5-7", "Alsó szekció", "Orosz Dávid", ["Csoszor Gergely", "Kormos Marcell"]],
  ["Felnőtt női", "Női szakág", "Hámori Ferenc", []],
  ["U19 leány", "Női szakág", "Pintér Róbert", []],
  ["U16 leány", "Női szakág", "Pintér Róbert", ["Zádori Enikő"]],
  ["U14 leány", "Női szakág", "Ludmán Andor", []],
  ["U12 leány", "Női szakág", "Zádori Enikő", []],
  ["U10 leány", "Női szakág", "Zádori Enikő", []],
];

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function loadEnv() {
  const raw = await readFile(path.resolve(process.cwd(), ".env.local"), "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

async function main() {
  const env = await loadEnv();
  const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2026-08-01",
    token: env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
  });

  let tx = client.transaction();
  for (const [name, role] of COACHES) {
    tx = tx.createOrReplace({
      _id: `edzo-${slugify(name)}`,
      _type: "edzo",
      name,
      role,
      featured: true,
    });
  }
  for (let i = 0; i < TEAMS.length; i++) {
    const [name, section, coach, assistants] = TEAMS[i];
    tx = tx.createOrReplace({
      _id: `korosztaly-${slugify(name)}`,
      _type: "korosztaly",
      name,
      section,
      coach: { _type: "reference", _ref: `edzo-${slugify(coach)}` },
      ...(assistants.length ? { assistants } : {}),
      order: (i + 1) * 10,
    });
  }
  await tx.commit();
  console.log(`KÉSZ: ${COACHES.length} edző + ${TEAMS.length} korosztály a Sanity-ben.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
