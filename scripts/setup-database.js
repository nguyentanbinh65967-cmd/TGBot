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
const os = require("os");

// Загружаем ensure-env.js для установки DATABASE_URL
require("./ensure-env.js");

const databaseUrl = process.env.DATABASE_URL || "";

// Определяем провайдера и настраиваем DATABASE_URL
let provider = "sqlite";
let finalDatabaseUrl = databaseUrl;

// Определяем путь для SQLite БД
const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;
const sqlitePath = isVercel ? "/tmp/dev.db" : "./dev.db";
const defaultDatabaseUrl = `file:${sqlitePath}`;

if (!databaseUrl) {
  // Если DATABASE_URL не установлен, используем SQLite
  finalDatabaseUrl = defaultDatabaseUrl;
  process.env.DATABASE_URL = finalDatabaseUrl;
  console.log(`📦 DATABASE_URL not set, using SQLite fallback: ${finalDatabaseUrl}`);
} else if (databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://")) {
  provider = "postgresql";
  finalDatabaseUrl = databaseUrl;
  console.log("🐘 Using PostgreSQL database");
} else if (databaseUrl.startsWith("file:")) {
  provider = "sqlite";
  finalDatabaseUrl = databaseUrl;
  console.log("💾 Using SQLite database");
} else {
  // По умолчанию SQLite
  finalDatabaseUrl = defaultDatabaseUrl;
  process.env.DATABASE_URL = finalDatabaseUrl;
  console.log(`📦 Invalid DATABASE_URL format, using SQLite fallback: ${finalDatabaseUrl}`);
}

// Устанавливаем DATABASE_URL для Prisma
process.env.DATABASE_URL = finalDatabaseUrl;

console.log(`\n🔧 Database Provider: ${provider}`);
console.log(`📝 DATABASE_URL: ${finalDatabaseUrl}`);
if (provider === "sqlite") {
  console.log(`📁 SQLite file location: ${finalDatabaseUrl.replace("file:", "")}`);
  if (isVercel) {
    console.log(`⚠️  Note: /tmp is ephemeral on Vercel - data will be lost between deployments`);
  }
}
console.log("");

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
console.log("📊 Applying database schema...");
try {
  if (provider === "postgresql") {
    // Для PostgreSQL используем migrate deploy
    execSync("npx prisma migrate deploy", { 
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: finalDatabaseUrl }
    });
    console.log("✅ Migrations applied successfully\n");
  } else {
    // Для SQLite используем db push (не требует shadow database)
    // Это безопаснее и проще для SQLite
    
    // Убеждаемся, что директория существует (для Vercel /tmp)
    if (isVercel) {
      const tmpDir = "/tmp";
      if (!fs.existsSync(tmpDir)) {
        console.warn(`⚠️  /tmp directory does not exist, this is unexpected on Vercel`);
      } else {
        console.log(`✅ /tmp directory exists`);
      }
    }
    
    // Проверяем, существует ли файл базы данных
    const dbPath = finalDatabaseUrl.replace("file:", "");
    const dbDir = path.dirname(dbPath);
    if (dbDir !== "." && !fs.existsSync(dbDir)) {
      console.log(`📁 Creating database directory: ${dbDir}`);
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    try {
      execSync("npx prisma db push", { 
        stdio: "inherit",
        env: { ...process.env, DATABASE_URL: finalDatabaseUrl }
      });
      
      // Проверяем, что файл создан
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        console.log(`✅ Database file created: ${dbPath} (${stats.size} bytes)`);
      } else {
        console.error(`❌ Database file not found after db push: ${dbPath}`);
        console.error(`   This will cause runtime errors. Check file permissions and disk space.`);
        process.exit(1);
      }
      
      console.log("✅ Database schema applied successfully\n");
    } catch (dbPushError) {
      console.error("❌ Failed to push database schema:", dbPushError);
      console.error(`   Database path: ${dbPath}`);
      console.error(`   Database URL: ${finalDatabaseUrl}`);
      throw dbPushError;
    }
  }
} catch (error) {
  console.warn("⚠️  Schema application failed, trying alternative method...");
  try {
    if (provider === "postgresql") {
      // Для PostgreSQL пробуем migrate dev
      execSync("npx prisma migrate dev --name init", { 
        stdio: "inherit",
        env: { ...process.env, DATABASE_URL: finalDatabaseUrl }
      });
    } else {
      // Для SQLite пробуем migrate dev с --skip-seed
      execSync("npx prisma migrate dev --name init --skip-seed", { 
        stdio: "inherit",
        env: { ...process.env, DATABASE_URL: finalDatabaseUrl }
      });
    }
    console.log("✅ Schema applied successfully\n");
  } catch (error2) {
    console.error("❌ Failed to apply database schema");
    console.error("💡 Try running manually:");
    if (provider === "postgresql") {
      console.error("   npx prisma migrate deploy");
    } else {
      console.error("   npx prisma db push");
    }
    process.exit(1);
  }
}

console.log("🎉 Database setup completed!");
