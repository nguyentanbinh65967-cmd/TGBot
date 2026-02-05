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
import fs from "fs";
import path from "path";
import { ensureDatabaseInitialized } from "./init-db";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Проверяем и настраиваем DATABASE_URL для SQLite
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // Автоматически устанавливаем SQLite fallback
  const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;
  const sqlitePath = isVercel ? "/tmp/dev.db" : "./dev.db";
  databaseUrl = `file:${sqlitePath}`;
  process.env.DATABASE_URL = databaseUrl;
  console.log(`⚠️ DATABASE_URL not set, using SQLite fallback: ${databaseUrl}`);
}

// Для SQLite: убеждаемся, что директория существует
if (databaseUrl.startsWith("file:")) {
  const dbPath = databaseUrl.replace("file:", "");
  const dbDir = path.dirname(dbPath);
  
  // На Vercel /tmp должен существовать, но проверим
  if (dbDir !== "." && !fs.existsSync(dbDir)) {
    try {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`📁 Created database directory: ${dbDir}`);
    } catch (error) {
      console.warn(`⚠️  Could not create database directory ${dbDir}:`, error);
    }
  }
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Примечание: База данных должна быть инициализирована во время build (vercel-build).
// Если база данных не существует при первом запросе, ensureDatabaseInitialized()
// создаст пустой файл, но схема должна быть применена через prisma db push во время build.
