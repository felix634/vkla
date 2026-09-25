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
    defineField({ name: "irodaCim", title: "Központi iroda címe", type: "string" }),
    defineField({
      name: "hirekKezdete",
      title: "Hírlista kezdő dátuma",
      type: "date",
      description:
        "A Hírek oldalon csak az ettől a naptól megjelent hírek látszanak (pl. az aktuális szezon kezdete). A régebbi hírek linkkel továbbra is elérhetők. Üresen hagyva minden hír megjelenik.",
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
    defineField({ name: "youtubeChannel", title: "YouTube csatorna", type: "url" }),
    defineField({ name: "twitter", title: "X (Twitter) link", type: "url" }),
    defineField({ name: "tiktok", title: "TikTok link", type: "url" }),
    defineField({ name: "webshopUrl", title: "Vasas webshop link", type: "url" }),
    defineField({ name: "vasasFcUrl", title: "Vasas FC link", type: "url" }),
    defineField({ name: "vasasFcIIUrl", title: "Vasas FC II link", type: "url" }),
  ],
  preview: { prepare: () => ({ title: "Oldal beállítások" }) },
});
