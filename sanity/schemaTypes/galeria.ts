import { defineType, defineField } from "sanity";
import { GALERIA_ALBUMOK } from "../constants";

export default defineType({
  name: "galeria",
  title: "Galéria album",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Album címe", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "category",
      title: "Kategória",
      type: "string",
      options: { list: [...GALERIA_ALBUMOK] },
      validation: (r) => r.required(),
    }),
    defineField({ name: "date", title: "Esemény dátuma", type: "date" }),
    defineField({
      name: "images",
      title: "Képek",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (r) => r.min(1),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "images.0" },
  },
});
