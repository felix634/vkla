import { defineType, defineField } from "sanity";

// Egyetlen (singleton) dokumentum az oldal általános adataihoz.
export default defineType({
  name: "beallitasok",
  title: "Oldal beállítások",
  type: "document",
  fields: [
    defineField({ name: "phone", title: "Telefonszám", type: "string" }),
    defineField({ name: "email", title: "Központi e-mail", type: "string" }),
    defineField({
      name: "probaedzesEmail",
      title: "Próbaedzés-jelentkezések e-mail címe",
      type: "string",
    }),
    defineField({ name: "address", title: "Cím", type: "string" }),
    defineField({
      name: "irodaCim",
      title: "Központi iroda címe",
      type: "string",
      description: "Az emeletet is ide lehet írni, pl. „1139 Budapest, Hajdú utca 42., 3. emelet”.",
    }),
    defineField({
      name: "hirekKezdete",
      title: "Hírlista kezdő dátuma",
      type: "date",
      description:
        "A Hírek oldalon csak az ettől a naptól megjelent hírek látszanak (pl. az aktuális szezon kezdete). A régebbi hírek linkkel továbbra is elérhetők. Üresen hagyva minden hír megjelenik.",
    }),
    defineField({
      name: "hirKorosztalyok",
      title: "Hírek — korosztály-szűrő",
      type: "array",
      description:
        "A Hírek oldal korosztály-szűrője ebben a sorrendben mutatja az elemeket (húzással átrendezhető). Új korosztály (pl. U20) felvétele után a hírek Kategória mezőjében is választható.",
      of: [
        {
          type: "object",
          name: "hirKorosztaly",
          fields: [
            defineField({
              name: "kod",
              title: "Kategória-kód",
              type: "string",
              description: "Ez kerül a hírre, pl. U16 vagy U16L.",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "nev",
              title: "Megjelenő név (opcionális)",
              type: "string",
              description: "A szűrőben ez látszik, pl. „Női NB II”. Üresen hagyva a kód.",
            }),
          ],
          preview: {
            select: { kod: "kod", nev: "nev" },
            prepare: ({ kod, nev }) => ({ title: nev || kod, subtitle: nev ? kod : undefined }),
          },
        },
      ],
    }),
    defineField({ name: "officeHours", title: "Iroda nyitvatartás", type: "string" }),
    defineField({
      name: "kepzesiDijFiu",
      title: "Havi képzési díj — fiú korosztályok (Ft)",
      type: "number",
      description: "A Képzési díj oldalon jelenik meg. Üresen hagyva az összeg nem látszik.",
    }),
    defineField({
      name: "kepzesiDijLany",
      title: "Havi képzési díj — leány korosztályok (Ft)",
      type: "number",
    }),
    defineField({ name: "facebook", title: "Facebook link", type: "url" }),
    defineField({ name: "instagram", title: "Instagram link", type: "url" }),
    // A YouTube, az X és a Vasas FC II külső linkje nem jelenik meg (Tóth Patrik, 10.23.).
    defineField({ name: "youtubeChannel", title: "YouTube csatorna", type: "url", hidden: true }),
    defineField({ name: "twitter", title: "X (Twitter) link", type: "url", hidden: true }),
    defineField({ name: "tiktok", title: "TikTok link", type: "url" }),
    defineField({ name: "webshopUrl", title: "Vasas webshop link", type: "url" }),
    defineField({ name: "vasasFcUrl", title: "Vasas FC link", type: "url" }),
    defineField({ name: "vasasFcIIUrl", title: "Vasas FC II link", type: "url", hidden: true }),
    defineField({
      name: "szponzorArak",
      title: "Szponzorációs csomagok árai",
      type: "object",
      description: "Üresen hagyva „Tervezés alatt” felirat jelenik meg. Pl. „500 000 Ft / év”.",
      fields: [
        defineField({ name: "arany", title: "Arany csomag", type: "string" }),
        defineField({ name: "ezust", title: "Ezüst csomag", type: "string" }),
        defineField({ name: "bronz", title: "Bronz csomag", type: "string" }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Oldal beállítások" }) },
});
