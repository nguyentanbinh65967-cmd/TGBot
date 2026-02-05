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
  let sqlitePath: string;
  if (isVercel) {
    sqlitePath = "/tmp/dev.db";
  } else {
    // Используем абсолютный путь для локальной разработки
    const projectRoot = process.cwd();
    sqlitePath = path.join(projectRoot, "dev.db");
  }
  databaseUrl = `file:${sqlitePath}`;
  process.env.DATABASE_URL = databaseUrl;
  console.log(`⚠️ DATABASE_URL not set, using SQLite fallback: ${databaseUrl}`);
}

// Для SQLite: убеждаемся, что директория существует и файл доступен
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
  
  // Проверяем доступность файла базы данных
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    console.log(`✅ Database file found: ${dbPath} (${stats.size} bytes)`);
  } else {
    console.warn(`⚠️  Database file not found: ${dbPath}. It will be created on first query.`);
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
