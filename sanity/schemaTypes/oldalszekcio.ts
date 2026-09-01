import { defineType, defineField } from "sanity";

// Szerkeszthető szöveges oldal-szekciók (Akadémia, Programok oldal blokkjai).
// A "key" köti a szekciót az oldal adott helyéhez — azt nem kell módosítani,
// a cím, a szöveg és a képek szabadon szerkeszthetők.
export default defineType({
  name: "oldalszekcio",
  title: "Oldal-szekció",
  type: "document",
  fields: [
    defineField({
      name: "key",
      title: "Szekció-azonosító (ne módosítsd)",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "title",
      title: "Cím",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "body",
      title: "Szöveg",
      type: "array",
      of: [{ type: "block" }, { type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "headerImage",
      title: "Fejléc-kép (széles, opcionális)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "images",
      title: "Kapcsolódó fotók (opcionális galéria a szöveg alatt)",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "key" },
  },
});
