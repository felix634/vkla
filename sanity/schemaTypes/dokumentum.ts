import { defineType, defineField } from "sanity";
import { DOKUMENTUM_KATEGORIAK } from "../constants";

export default defineType({
  name: "dokumentum",
  title: "Dokumentum",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Megnevezés", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "category",
      title: "Kategória",
      type: "string",
      options: { list: [...DOKUMENTUM_KATEGORIAK] },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "year",
      title: "Év (TAO-dokumentumoknál)",
      type: "string",
      hidden: ({ document }) => document?.category !== "TAO",
    }),
    defineField({ name: "file", title: "Fájl", type: "file", validation: (r) => r.required() }),
    defineField({
      name: "date",
      title: "Dátum",
      type: "date",
      initialValue: () => new Date().toISOString().slice(0, 10),
    }),
  ],
  preview: {
    select: { title: "title", category: "category", year: "year" },
    prepare: ({ title, category, year }) => ({
      title,
      subtitle: [category, year].filter(Boolean).join(" · "),
    }),
  },
});
