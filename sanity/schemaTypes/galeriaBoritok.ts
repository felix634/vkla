import { defineType, defineField } from "sanity";

// A Galéria nyitóoldalán a két nagy kártya (Mérkőzések, Események) borítóképe.
// Egyetlen (singleton) dokumentum. Üres mezőnél a kategória legfrissebb albumának
// borítója jelenik meg (a 2026.11.24. előtti működés). A klub kérése (Felix,
// 2026.11.24.); a két képet Tóth Patrik választja ki.
const leiras =
  "A Galéria oldal nyitó kártyáján ez a kép jelenik meg. Feltölthetsz újat, vagy a már feltöltött képek közül is választhatsz (például egy album egyik képét). A fókuszpontot állítsd a kép fontos részére, a kártya kivágása ahhoz igazodik. Üresen hagyva a legfrissebb album borítója jelenik meg.";

export default defineType({
  name: "galeriaBoritok",
  title: "Galéria borítóképek",
  type: "document",
  fields: [
    defineField({
      name: "merkozesek",
      title: "Mérkőzések – borítókép",
      type: "image",
      options: { hotspot: true },
      description: leiras,
    }),
    defineField({
      name: "esemenyek",
      title: "Események – borítókép",
      type: "image",
      options: { hotspot: true },
      description: leiras,
    }),
  ],
  preview: { prepare: () => ({ title: "Galéria borítóképek" }) },
});
