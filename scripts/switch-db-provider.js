/**
 * Скрипт для переключения между SQLite и PostgreSQL схемами
 * 
 * Использование:
 * node scripts/switch-db-provider.js
 * 
 * Автоматически определяет провайдера из DATABASE_URL и копирует нужную схему
 */

const fs = require("fs");
const path = require("path");

const databaseUrl = process.env.DATABASE_URL || "";

const sqliteSchemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
const postgresSchemaPath = path.join(__dirname, "..", "prisma", "schema.postgres.prisma");

// Определяем провайдера
let provider = "sqlite"; // По умолчанию SQLite

if (databaseUrl) {
  if (databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://")) {
    provider = "postgresql";
  } else if (databaseUrl.startsWith("file:")) {
    provider = "sqlite";
  }
}

console.log(`Detected database provider: ${provider}`);

if (provider === "postgresql") {
  // Используем PostgreSQL схему
  if (fs.existsSync(postgresSchemaPath)) {
    const postgresSchema = fs.readFileSync(postgresSchemaPath, "utf8");
    // Обновляем datasource provider в основной схеме
    const currentSchema = fs.readFileSync(sqliteSchemaPath, "utf8");
    const updatedSchema = currentSchema.replace(
      /datasource db \{[^}]+provider = "[^"]+"/,
      'datasource db {\n  provider = "postgresql"'
    );
    fs.writeFileSync(sqliteSchemaPath, updatedSchema);
    console.log("✅ Switched to PostgreSQL schema");
  } else {
    console.warn("⚠️  PostgreSQL schema file not found, using SQLite");
  }
} else {
  // Используем SQLite схему (по умолчанию)
  const currentSchema = fs.readFileSync(sqliteSchemaPath, "utf8");
  const updatedSchema = currentSchema.replace(
    /datasource db \{[^}]+provider = "[^"]+"/,
    'datasource db {\n  provider = "sqlite"'
  );
  fs.writeFileSync(sqliteSchemaPath, updatedSchema);
  console.log("✅ Using SQLite schema (default)");
}
