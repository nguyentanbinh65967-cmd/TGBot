/**
 * Скрипт для определения провайдера БД из DATABASE_URL
 * 
 * Использование:
 * node scripts/detect-db-provider.js
 * 
 * Возвращает: "postgresql" или "sqlite"
 */

const databaseUrl = process.env.DATABASE_URL || "";

if (!databaseUrl) {
  // Если DATABASE_URL не установлен, используем SQLite
  console.log("sqlite");
  process.exit(0);
}

// Проверяем формат DATABASE_URL
if (databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://")) {
  console.log("postgresql");
} else if (databaseUrl.startsWith("file:")) {
  console.log("sqlite");
} else {
  // По умолчанию SQLite
  console.log("sqlite");
}
