/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  // output: "standalone" - не нужен для Vercel, но безопасно оставить
  
  // Security headers
  async headers() {
    const isDev = process.env.NODE_ENV !== "production";
    const isVercel = process.env.VERCEL === "1";
    // В production (включая Vercel) не используем unsafe-eval
    const isProduction = isVercel || !isDev;
    
    // CSP для development и production
    // В development разрешаем unsafe-eval для Next.js HMR
    // В production (включая Vercel) запрещаем для безопасности
    const scriptSrc = [
      "'self'",
      "'unsafe-inline'",
      "https://telegram.org",
      "https://*.telegram.org",
    ];
    
    // Добавляем unsafe-eval только в development (не на Vercel)
    if (!isProduction) {
      scriptSrc.push("'unsafe-eval'");
    }
    
    const cspDirectives = [
      "default-src 'self'",
      `script-src ${scriptSrc.join(" ")}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://telegram.org https://*.telegram.org https://api.telegram.org",
      // Разрешаем встраивание Telegram WebApp в web.telegram.org
      "frame-src 'self' https://telegram.org https://*.telegram.org",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      // Разрешаем, чтобы наш сайт мог быть во фрейме Telegram Web (web.telegram.org)
      "frame-ancestors 'self' https://web.telegram.org https://*.telegram.org",
      "upgrade-insecure-requests",
    ].join("; ");
    
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspDirectives,
          },
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
