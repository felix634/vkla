// Sanity környezeti beállítások — amíg nincs projekt (env), a site
// placeholder tartalommal működik, a /studio pedig útmutatót mutat.
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion = "2026-08-01";
export const sanityEnabled = projectId.length > 0;
