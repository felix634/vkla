import { defineType, defineField } from "sanity";
import { KOROSZTALYOK, POSZTOK } from "../constants";

export default defineType({
  name: "korosztaly",
  title: "Korosztály (csapat)",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Korosztály",
      type: "string",
      options: { list: [...KOROSZTALYOK] },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "coach",
      title: "Edző",
      type: "reference",
      to: [{ type: "edzo" }],
    }),
    defineField({
      name: "players",
      title: "Játékosok",
      type: "array",
      of: [
        {
          type: "object",
          name: "jatekos",
          title: "Játékos",
          fields: [
            defineField({ name: "name", title: "Név", type: "string", validation: (r) => r.required() }),
            defineField({
              name: "position",
              title: "Poszt",
              type: "string",
              options: { list: [...POSZTOK] },
            }),
            defineField({ name: "number", title: "Mezszám", type: "number" }),
            defineField({ name: "photo", title: "Fotó", type: "image", options: { hotspot: true } }),
          ],
          preview: {
            select: { title: "name", subtitle: "position", media: "photo" },
          },
        },
      ],
    }),
    defineField({
      name: "order",
      title: "Sorrend",
      type: "number",
      description: "A csapatok megjelenítési sorrendje (kisebb = előrébb).",
    }),
  ],
  orderings: [
    { title: "Sorrend", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", coach: "coach.name" },
    prepare: ({ title, coach }) => ({ title, subtitle: coach ? `Edző: ${coach}` : "Nincs edző megadva" }),
  },
});
