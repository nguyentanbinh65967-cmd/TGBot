/**
 * Prisma Client для работы с БД
 * 
 * Поддерживает PostgreSQL и SQLite (fallback).
 * Автоматически определяет провайдера из DATABASE_URL.
 * 
 * Использование:
 * import { db } from "@/lib/db/prisma";
 * 
 * // ID пользователя (String для совместимости с SQLite и PostgreSQL)
 * const user = await db.user.findUnique({ where: { id: "123456789" } });
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Проверяем DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.warn("⚠️ DATABASE_URL not set, Prisma will use default connection");
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
