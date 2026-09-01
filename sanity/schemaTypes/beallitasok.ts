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
    defineField({ name: "officeHours", title: "Iroda nyitvatartás", type: "string" }),
    defineField({ name: "facebook", title: "Facebook link", type: "url" }),
    defineField({ name: "instagram", title: "Instagram link", type: "url" }),
    defineField({ name: "youtubeChannel", title: "YouTube csatorna", type: "url" }),
    defineField({ name: "tiktok", title: "TikTok link", type: "url" }),
    defineField({ name: "webshopUrl", title: "Vasas webshop link", type: "url" }),
    defineField({ name: "vasasFcUrl", title: "Vasas FC link", type: "url" }),
    defineField({ name: "vasasFcIIUrl", title: "Vasas FC II link", type: "url" }),
  ],
  preview: { prepare: () => ({ title: "Oldal beállítások" }) },
});
