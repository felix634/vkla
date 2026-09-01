import { defineType, defineField } from "sanity";

export default defineType({
  name: "allas",
  title: "Álláshirdetés",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Pozíció", type: "string", validation: (r) => r.required() }),
    defineField({ name: "area", title: "Terület", type: "string", description: "Pl. Szakmai, Edzői stáb, Adminisztráció" }),
    defineField({
      name: "jobType",
      title: "Foglalkoztatás",
      type: "string",
      options: { list: ["Teljes munkaidő", "Részmunkaidő", "Megbízási"] },
    }),
    defineField({ name: "location", title: "Helyszín", type: "string", initialValue: "Budapest, Fáy u. 58." }),
    defineField({ name: "description", title: "Leírás", type: "text", rows: 6 }),
    defineField({ name: "active", title: "Aktív (megjelenik az oldalon)", type: "boolean", initialValue: true }),
  ],
  preview: {
    select: { title: "title", subtitle: "area", active: "active" },
    prepare: ({ title, subtitle, active }) => ({
      title: active ? title : `${title} (inaktív)`,
      subtitle,
    }),
  },
});
