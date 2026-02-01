/**
 * Скрипт для запуска команды с установленным DATABASE_URL
 * 
 * Использование:
 * node scripts/run-with-env.js "npx prisma generate"
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

// Загружаем ensure-env.js для установки DATABASE_URL
require("./ensure-env.js");

// Получаем команду из аргументов
const command = process.argv.slice(2).join(" ");

if (!command) {
  console.error("❌ Error: No command provided");
  console.log("Usage: node scripts/run-with-env.js <command>");
  process.exit(1);
}

// Выполняем команду с установленным DATABASE_URL
try {
  execSync(command, {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL,
    },
  });
} catch (error) {
  process.exit(error.status || 1);
}
