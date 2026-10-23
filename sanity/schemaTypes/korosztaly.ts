import { defineType, defineField } from "sanity";
import { POSZTOK } from "../constants";

export default defineType({
  name: "korosztaly",
  title: "Korosztály (csapat)",
  type: "document",
  fields: [
    // Szabad szöveg: új korosztály (pl. U20) a Studióban felvehető, és utána
    // a heti edzésrendnél is választható. A sorrendet a "Sorrend" mező adja.
    defineField({
      name: "name",
      title: "Korosztály",
      type: "string",
      description: "Pl. U19, U16 leány, Felnőtt női, Vasas FC II.",
      validation: (r) =>
        r.required().custom(async (value, context) => {
          if (!value) return true;
          const id = (context.document?._id ?? "").replace(/^drafts\./, "");
          const n = await context
            .getClient({ apiVersion: "2024-01-01" })
            .fetch<number>(
              `count(*[_type == "korosztaly" && name == $name && !(_id in [$id, "drafts." + $id])])`,
              { name: value, id }
            );
          return n === 0 || "Ilyen nevű korosztály már van.";
        }),
    }),
    defineField({
      name: "coach",
      title: "Edző",
      type: "reference",
      to: [{ type: "edzo" }],
    }),
    defineField({
      name: "section",
      title: "Szekció",
      type: "string",
      options: { list: ["Vasas FC II", "Akadémia", "Pre-akadémia", "Női szakág"] },
      description: "Üresen hagyva a csapat nem jelenik meg a weboldalon.",
    }),
    defineField({
      name: "assistants",
      title: "Asszisztensedzők / utánpótlásedzők",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "players",
      title: "Játékosok",
      type: "array",
      of: [
        {
          type: "object",
          name: "jatekos",
          title: "Játékos",
          fields: [
            defineField({ name: "name", title: "Név", type: "string", validation: (r) => r.required() }),
            defineField({
              name: "position",
              title: "Poszt",
              type: "string",
              options: { list: [...POSZTOK] },
            }),
            defineField({ name: "number", title: "Mezszám", type: "number" }),
            defineField({ name: "photo", title: "Fotó", type: "image", options: { hotspot: true } }),
          ],
          preview: {
            select: { title: "name", subtitle: "position", media: "photo" },
          },
        },
      ],
    }),
    defineField({
      name: "order",
      title: "Sorrend",
      type: "number",
      description:
        "A csapatok megjelenítési sorrendje (kisebb = előrébb) — a Csapatok oldalon és a heti edzésrend szűrőjében is.",
    }),
  ],
  orderings: [
    { title: "Sorrend", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", coach: "coach.name" },
    prepare: ({ title, coach }) => ({ title, subtitle: coach ? `Edző: ${coach}` : "Nincs edző megadva" }),
  },
});
