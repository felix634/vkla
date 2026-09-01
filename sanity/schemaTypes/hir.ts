import { defineType, defineField } from "sanity";
import { HIR_KATEGORIAK } from "../constants";

export default defineType({
  name: "hir",
  title: "Hír",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Cím",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "URL-cím (slug)",
      type: "slug",
      options: { source: "title", maxLength: 120 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Publikálás dátuma",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Kategória",
      type: "string",
      options: { list: [...HIR_KATEGORIAK] },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "heroImage",
      title: "Indexkép",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "excerpt",
      title: "Rövid összefoglaló (opcionális)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "body",
      title: "Cikk szövege",
      type: "array",
      of: [
        { type: "block" },
        { type: "image", options: { hotspot: true } },
        { type: "youtube" },
        { type: "instagram" },
      ],
    }),
    defineField({
      name: "legacy",
      title: "Régi oldalról migrált",
      type: "boolean",
      initialValue: false,
      readOnly: true,
      hidden: ({ value }) => !value,
    }),
  ],
  orderings: [
    {
      title: "Publikálás (legújabb elöl)",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", category: "category", date: "publishedAt", media: "heroImage" },
    prepare: ({ title, category, date, media }) => ({
      title,
      subtitle: [category, date?.slice(0, 10)].filter(Boolean).join(" · "),
      media,
    }),
  },
});
