import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vkla.vercel.app";
const INDEXABLE = process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true";

// Élesítésig (NEXT_PUBLIC_SITE_INDEXABLE=true) minden robot ki van tiltva,
// hogy a staging ne kerüljön a keresőkbe a vkla.hu mellé.
export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
