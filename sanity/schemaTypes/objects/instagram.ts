import { defineType, defineField } from "sanity";

// Cikkbe ágyazható Instagram-poszt — a szerkesztő csak a linket másolja be.
export default defineType({
  name: "instagram",
  title: "Instagram poszt",
  type: "object",
  fields: [
    defineField({
      name: "url",
      title: "Instagram link",
      type: "url",
      description: "A poszt vagy reel linkje, pl. https://www.instagram.com/p/...",
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { url: "url" },
    prepare: ({ url }) => ({ title: "Instagram poszt", subtitle: url }),
  },
});
