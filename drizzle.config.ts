/**
 * Drizzle Kit Configuration
 * 
 * Использование:
 * - npx drizzle-kit generate:pg - создать миграцию
 * - npx drizzle-kit migrate - применить миграцию
 * - npx drizzle-kit studio - открыть Drizzle Studio
 */

import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
