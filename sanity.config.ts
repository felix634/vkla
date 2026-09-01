"use client";

import { defineConfig } from "sanity";
import { structureTool, type StructureResolver } from "sanity/structure";
import { huHULocale } from "@sanity/locale-hu-hu";
import { projectId, dataset } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";

// Magyar nyelvű, az irodai munkatársaknak rendezett tartalomstruktúra.
const structure: StructureResolver = (S) =>
  S.list()
    .title("Tartalom")
    .items([
      S.documentTypeListItem("hir").title("Hírek"),
      S.divider(),
      S.listItem()
        .title("Csapatok")
        .child(
          S.list()
            .title("Csapatok")
            .items([
              S.documentTypeListItem("korosztaly").title("Korosztályok"),
              S.documentTypeListItem("edzo").title("Edzők"),
              S.documentTypeListItem("hetirend").title("Heti edzésrend"),
            ])
        ),
      S.listItem()
        .title("Média")
        .child(
          S.list()
            .title("Média")
            .items([
              S.documentTypeListItem("galeria").title("Galéria albumok"),
              S.documentTypeListItem("video").title("Videók (Vasas TV)"),
            ])
        ),
      S.documentTypeListItem("szponzor").title("Szponzorok"),
      S.documentTypeListItem("letesitmeny").title("Létesítmények"),
      S.documentTypeListItem("dokumentum").title("Dokumentumok"),
      S.documentTypeListItem("allas").title("Karrier — álláshirdetések"),
      S.divider(),
      S.listItem()
        .title("Oldal beállítások")
        .child(
          S.document().schemaType("beallitasok").documentId("beallitasok")
        ),
    ]);

export default defineConfig({
  name: "vkla",
  title: "Vasas Kubala Akadémia",
  basePath: "/studio",
  projectId: projectId || "hianyzo-projekt",
  dataset,
  plugins: [structureTool({ structure }), huHULocale()],
  schema: { types: schemaTypes },
});
