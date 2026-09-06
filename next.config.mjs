/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  experimental: {
    // A statikus hír-archívum (content/archiv) fájljait a szerverless
    // bundle-be kell csomagolni, mert futásidőben fs-ből olvassuk őket.
    outputFileTracingIncludes: {
      "/hirek": ["./content/archiv/**"],
      "/hirek/[slug]": ["./content/archiv/**"],
      "/[slug]": ["./content/archiv/index.json"],
      "/sitemap.xml": ["./content/archiv/index.json"],
    },
  },
  compiler: {
    // A Sanity Studio styled-components-et használ
    styledComponents: true,
  },
};

export default nextConfig;
