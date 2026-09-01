import { defineType, defineField } from "sanity";

export default defineType({
  name: "letesitmeny",
  title: "Létesítmény",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Név", type: "string", validation: (r) => r.required() }),
    defineField({ name: "address", title: "Cím", type: "string" }),
    defineField({
      name: "images",
      title: "Fotók",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "amenities",
      title: "Jellemzők",
      type: "array",
      of: [{ type: "string" }],
      description: "Pl. 2 nagypálya (füves), öltözők, parkolás…",
    }),
    defineField({ name: "rentInfo", title: "Bérlési információk", type: "text", rows: 4 }),
    defineField({ name: "mapImage", title: "Térkép / pályarajz", type: "image" }),
    defineField({ name: "order", title: "Sorrend", type: "number" }),
  ],
  orderings: [
    { title: "Sorrend", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: { select: { title: "name", subtitle: "address" } },
});
