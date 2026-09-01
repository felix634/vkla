import { defineType, defineField } from "sanity";

// Cikkbe ágyazható YouTube-videó — a szerkesztő csak a linket másolja be.
export default defineType({
  name: "youtube",
  title: "YouTube videó",
  type: "object",
  fields: [
    defineField({
      name: "url",
      title: "YouTube link",
      type: "url",
      description: "Pl. https://www.youtube.com/watch?v=... vagy https://youtu.be/...",
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { url: "url" },
    prepare: ({ url }) => ({ title: "YouTube videó", subtitle: url }),
  },
});
