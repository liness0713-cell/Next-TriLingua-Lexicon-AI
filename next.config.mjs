/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure we don't try to load fs modules on client
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;