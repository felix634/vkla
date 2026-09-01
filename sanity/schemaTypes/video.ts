import { defineType, defineField } from "sanity";

export default defineType({
  name: "video",
  title: "Videó (Vasas TV)",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Cím", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "url",
      title: "YouTube link",
      type: "url",
      validation: (r) => r.required(),
    }),
    defineField({ name: "date", title: "Dátum", type: "date" }),
  ],
  preview: { select: { title: "title", subtitle: "url" } },
});
