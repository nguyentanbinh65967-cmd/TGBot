/**
 * Скрипт для настройки базы данных
 * 
 * Автоматически определяет провайдера из DATABASE_URL и настраивает БД:
 * - Если DATABASE_URL не установлен → использует SQLite (file:./dev.db)
 * - Если DATABASE_URL указывает на PostgreSQL → использует PostgreSQL
 * - Если DATABASE_URL указывает на SQLite → использует SQLite
 * 
 * Использование:
 * node scripts/setup-database.js
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Загружаем .env.local если существует
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  });
}

const databaseUrl = process.env.DATABASE_URL || "";

// Определяем провайдера и настраиваем DATABASE_URL
let provider = "sqlite";
let finalDatabaseUrl = databaseUrl;

if (!databaseUrl) {
  // Если DATABASE_URL не установлен, используем SQLite
  finalDatabaseUrl = "file:./dev.db";
  console.log("📦 DATABASE_URL not set, using SQLite fallback: file:./dev.db");
} else if (databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://")) {
  provider = "postgresql";
  console.log("🐘 Using PostgreSQL database");
} else if (databaseUrl.startsWith("file:")) {
  provider = "sqlite";
  console.log("💾 Using SQLite database");
} else {
  // По умолчанию SQLite
  finalDatabaseUrl = "file:./dev.db";
  console.log("📦 Invalid DATABASE_URL format, using SQLite fallback: file:./dev.db");
}

// Устанавливаем DATABASE_URL для Prisma
process.env.DATABASE_URL = finalDatabaseUrl;

console.log(`\n🔧 Database Provider: ${provider}`);
console.log(`📝 DATABASE_URL: ${finalDatabaseUrl}\n`);

// Генерируем Prisma Client
console.log("🔨 Generating Prisma Client...");
try {
  execSync("npx prisma generate", { stdio: "inherit" });
  console.log("✅ Prisma Client generated successfully\n");
} catch (error) {
  console.error("❌ Failed to generate Prisma Client");
  process.exit(1);
}

// Применяем миграции
console.log("📊 Applying database migrations...");
try {
  if (provider === "postgresql") {
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
  } else {
    // Для SQLite используем migrate dev (создает БД если не существует)
    execSync("npx prisma migrate dev --name init", { stdio: "inherit" });
  }
  console.log("✅ Migrations applied successfully\n");
} catch (error) {
  console.warn("⚠️  Migration failed, trying migrate dev...");
  try {
    execSync("npx prisma migrate dev --name init", { stdio: "inherit" });
    console.log("✅ Migrations applied successfully\n");
  } catch (error2) {
    console.error("❌ Failed to apply migrations");
    process.exit(1);
  }
}

console.log("🎉 Database setup completed!");
