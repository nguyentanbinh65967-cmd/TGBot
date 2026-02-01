/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  // output: "standalone" - не нужен для Vercel, но безопасно оставить
  
  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  
  // Disable directory listing
  poweredByHeader: false,
  
  // Production optimizations
  compress: true,
  reactStrictMode: true,
  
  // Ensure Node.js runtime for Prisma and crypto operations
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  
  // Webpack configuration to exclude server-only modules from client bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude server-only modules from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
      };
      
      // Ignore server-only files in client bundle
      config.resolve.alias = {
        ...config.resolve.alias,
        "@/lib/auth/server": false,
      };
    }
    
    // Ignore drizzle files if drizzle-orm is not installed
    config.resolve.alias = {
      ...config.resolve.alias,
      "drizzle-orm": false,
      "@/config/rbac.db.drizzle": false,
      "@/lib/db/drizzle": false,
      "@/db/schema": false,
    };
    
    return config;
  },
};

module.exports = nextConfig;
