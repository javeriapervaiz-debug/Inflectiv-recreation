import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Server external packages
  serverExternalPackages: ['pdf-parse'],

  // Turbopack config (Next.js 16 default bundler)
  turbopack: {},

  // Webpack config for fallback (when turbopack isn't used)
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

export default nextConfig;
