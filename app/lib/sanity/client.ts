import { createClient, type SanityClient } from "next-sanity";
import { projectId, dataset, apiVersion, sanityEnabled } from "@/sanity/env";

export { sanityEnabled };

// Amíg nincs projekt beállítva, a kliens null — a lekérdezők fallbacket adnak.
export const client: SanityClient | null = sanityEnabled
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      perspective: "published",
    })
  : null;
