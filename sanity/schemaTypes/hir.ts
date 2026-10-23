import { defineType, defineField } from "sanity";
import HirKategoriaInput from "../components/HirKategoriaInput";

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
      description: "Új korosztályt az Oldal beállítások → Hírek — korosztály-szűrő listájában lehet felvenni.",
      components: { input: HirKategoriaInput },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "kiemelt",
      title: "Kiemelt hír a főoldalon",
      type: "boolean",
      description:
        "Bekapcsolva ez a hír jelenik meg nagyban a főoldal tetején. Ha több hír is kiemelt, a legfrissebb látszik; ha egy sem, a legújabb hír.",
    }),
    defineField({
      name: "heroImage",
      title: "Indexkép",
      type: "image",
      options: { hotspot: true },
      description:
        "Fekvő kép, legalább 1600 px széles. Feltöltés után a kép melletti ceruza ikonnal kijelölhető a fókuszpont (pl. az arcok) — a kép kivágása mindig e köré igazodik.",
    }),
    defineField({
      name: "lead",
      title: "Lead (kiemelt bevezető a kép alatt, opcionális)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "excerpt",
      title: "Rövid összefoglaló (opcionális)",
      type: "text",
      rows: 3,
      description: "A hírlistában a cím alatt jelenik meg.",
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
