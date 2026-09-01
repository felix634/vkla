import { defineType, defineField } from "sanity";
import { KOROSZTALYOK, NAPOK } from "../constants";

export default defineType({
  name: "hetirend",
  title: "Heti edzésrend",
  type: "document",
  fields: [
    defineField({
      name: "korosztaly",
      title: "Korosztály",
      type: "string",
      options: { list: [...KOROSZTALYOK] },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "entries",
      title: "Alkalmak",
      type: "array",
      of: [
        {
          type: "object",
          name: "alkalom",
          title: "Alkalom",
          fields: [
            defineField({
              name: "day",
              title: "Nap",
              type: "string",
              options: { list: [...NAPOK] },
              validation: (r) => r.required(),
            }),
            defineField({ name: "from", title: "Kezdés (pl. 16:30)", type: "string" }),
            defineField({ name: "to", title: "Vége (pl. 18:00)", type: "string" }),
            defineField({ name: "location", title: "Helyszín / pálya", type: "string" }),
          ],
          preview: {
            select: { day: "day", from: "from", to: "to", location: "location" },
            prepare: ({ day, from, to, location }) => ({
              title: `${day ?? ""} ${from ?? ""}–${to ?? ""}`.trim(),
              subtitle: location,
            }),
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "korosztaly" },
    prepare: ({ title }) => ({ title: `${title} — heti edzésrend` }),
  },
});
