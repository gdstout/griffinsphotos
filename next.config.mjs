/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Critical for AWS Amplify SSR deployments
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
