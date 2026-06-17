/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ioredis is a server-only dependency; keep it external to the server bundle.
  experimental: {
    serverComponentsExternalPackages: ["ioredis"],
  },
};

export default nextConfig;
