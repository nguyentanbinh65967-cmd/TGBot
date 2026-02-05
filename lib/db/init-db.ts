/**
 * Функция для автоматической инициализации базы данных
 * Вызывается при первом подключении, если база данных не существует
 * 
 * На Vercel база данных должна быть создана во время build (vercel-build),
 * но если по какой-то причине она не существует, эта функция попытается
 * создать её при первом запросе.
 */

import fs from "fs";
import path from "path";

let isInitializing = false;
let initializationPromise: Promise<void> | null = null;

export async function ensureDatabaseInitialized(): Promise<void> {
  // Если уже инициализируется, ждем завершения
  if (isInitializing && initializationPromise) {
    return initializationPromise;
  }

  // Проверяем, нужна ли инициализация
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || !databaseUrl.startsWith("file:")) {
    // Не SQLite, не нужно инициализировать
    return;
  }

  const dbPath = databaseUrl.replace("file:", "");
  
  // Если файл существует, база данных уже инициализирована
  if (fs.existsSync(dbPath)) {
    return;
  }

  // Начинаем инициализацию
  isInitializing = true;
  initializationPromise = (async () => {
    try {
      console.log(`🔧 Database file not found at ${dbPath}, ensuring directory exists...`);
      
      // Убеждаемся, что директория существует
      const dbDir = path.dirname(dbPath);
      if (dbDir !== "." && !fs.existsSync(dbDir)) {
        try {
          fs.mkdirSync(dbDir, { recursive: true });
          console.log(`📁 Created database directory: ${dbDir}`);
        } catch (error) {
          console.warn(`⚠️  Could not create database directory ${dbDir}:`, error);
        }
      }

      // Создаем пустой файл базы данных
      // Prisma создаст схему при первом запросе, если файл существует
      try {
        fs.writeFileSync(dbPath, "");
        console.log(`📝 Created empty database file at ${dbPath}`);
        console.log(`⚠️  Note: Database schema will be created on first query.`);
        console.log(`⚠️  For production, ensure database is initialized during build (vercel-build).`);
      } catch (error) {
        console.error(`❌ Failed to create database file:`, error);
        throw error;
      }
    } catch (error) {
      console.error(`❌ Failed to initialize database:`, error);
      throw error;
    } finally {
      isInitializing = false;
      initializationPromise = null;
    }
  })();

  return initializationPromise;
}
