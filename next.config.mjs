/** @type {import('next').NextConfig} */
const nextConfig = {
  // Critical for AWS Amplify SSR
  output: "standalone",

  images: {
    unoptimized: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
