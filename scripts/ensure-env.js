/**
 * Скрипт для обеспечения наличия DATABASE_URL
 * 
 * Автоматически создает .env.local с SQLite fallback, если DATABASE_URL не установлен.
 * Используется перед Prisma командами (generate, migrate).
 * 
 * Использование:
 * node scripts/ensure-env.js
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

const rootDir = path.join(__dirname, "..");
const envLocalPath = path.join(rootDir, ".env.local");

// Загружаем существующий .env.local если есть
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

// Определяем путь для SQLite БД
// На Vercel используем /tmp, локально - ./dev.db
const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;
const sqlitePath = isVercel ? "/tmp/dev.db" : "./dev.db";
const defaultDatabaseUrl = `file:${sqlitePath}`;

// Если DATABASE_URL не установлен, устанавливаем fallback
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = defaultDatabaseUrl;
  
  // Создаем/обновляем .env.local только если его нет или не содержит DATABASE_URL
  let envContent = "";
  if (fs.existsSync(envLocalPath)) {
    envContent = fs.readFileSync(envLocalPath, "utf8");
  }
  
  // Проверяем, есть ли уже DATABASE_URL в файле
  if (!envContent.includes("DATABASE_URL=")) {
    // Добавляем DATABASE_URL в .env.local
    if (envContent && !envContent.endsWith("\n")) {
      envContent += "\n";
    }
    envContent += `# Auto-generated SQLite fallback\nDATABASE_URL="${defaultDatabaseUrl}"\n`;
    fs.writeFileSync(envLocalPath, envContent, "utf8");
    console.log(`📝 Created/updated .env.local with DATABASE_URL="${defaultDatabaseUrl}"`);
  }
  
  // Определяем провайдера для логирования
  const provider = defaultDatabaseUrl.startsWith("file:") ? "SQLite" : "PostgreSQL";
  console.log(`⚠️  DATABASE_URL not set, using ${provider} fallback: ${defaultDatabaseUrl}`);
} else {
  // Логируем используемый провайдер
  const dbUrl = process.env.DATABASE_URL;
  let provider = "Unknown";
  if (dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://")) {
    provider = "PostgreSQL";
  } else if (dbUrl.startsWith("file:")) {
    provider = "SQLite";
  }
  console.log(`✅ Using ${provider}: ${dbUrl}`);
}

// Устанавливаем DATABASE_URL в process.env для дочерних процессов
// Это критично для Prisma CLI, который читает env переменные напрямую
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = defaultDatabaseUrl;
}

// Для Windows PowerShell нужно экспортировать через cross-env или установить глобально
// Но для Node.js child processes достаточно process.env
