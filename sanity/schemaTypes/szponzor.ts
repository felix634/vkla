import { defineType, defineField } from "sanity";

export default defineType({
  name: "szponzor",
  title: "Szponzor",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Név", type: "string", validation: (r) => r.required() }),
    defineField({ name: "logo", title: "Logó", type: "image" }),
    defineField({
      name: "tier",
      title: "Szint",
      type: "string",
      options: {
        list: [
          { title: "Fő támogató (kiemelt, főoldalon)", value: "fo" },
          { title: "Partner", value: "partner" },
        ],
        layout: "radio",
      },
      initialValue: "partner",
      validation: (r) => r.required(),
    }),
    defineField({ name: "url", title: "Weboldal (opcionális)", type: "url" }),
    defineField({ name: "order", title: "Sorrend", type: "number" }),
  ],
  orderings: [
    { title: "Sorrend", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", tier: "tier", media: "logo" },
    prepare: ({ title, tier, media }) => ({
      title,
      subtitle: tier === "fo" ? "Fő támogató" : "Partner",
      media,
    }),
  },
});
