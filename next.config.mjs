/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  compiler: {
    // A Sanity Studio styled-components-et használ
    styledComponents: true,
  },
};

export default nextConfig;
