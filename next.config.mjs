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

  allowedDevOrigins: ["192.168.1.173"],
};

export default nextConfig;
