import { defineType, defineField } from "sanity";

export default defineType({
  name: "edzo",
  title: "Edző",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Név", type: "string", validation: (r) => r.required() }),
    defineField({ name: "role", title: "Beosztás", type: "string", description: "Pl. korosztály vezetőedző" }),
    defineField({ name: "photo", title: "Fotó", type: "image", options: { hotspot: true } }),
    defineField({ name: "bio", title: "Rövid bemutatkozás", type: "text", rows: 4 }),
    defineField({
      name: "featured",
      title: "Megjelenik az Akadémia oldal edzői stáb rácsában",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: { select: { title: "name", subtitle: "role", media: "photo" } },
});
