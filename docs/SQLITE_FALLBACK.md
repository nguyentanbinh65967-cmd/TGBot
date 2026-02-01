# SQLite Fallback - Полное руководство

## Обзор

Проект автоматически использует SQLite, если `DATABASE_URL` не установлен. Это позволяет:
- ✅ Собирать проект без настройки PostgreSQL
- ✅ Запускать локально без дополнительной конфигурации
- ✅ Тестировать на Vercel без подключения БД
- ✅ Не падать при отсутствии `DATABASE_URL`

## Как это работает

### 1. Автоматическая генерация DATABASE_URL

**Скрипт `scripts/ensure-env.js`:**
- Проверяет наличие `DATABASE_URL` в `process.env`
- Если отсутствует → устанавливает SQLite fallback:
  - **Локально:** `file:./dev.db`
  - **На Vercel:** `file:/tmp/dev.db`
- Создает/обновляет `.env.local` с `DATABASE_URL` (если файл существует)
- Логирует используемый провайдер

**Скрипт `scripts/run-with-env.js`:**
- Загружает `ensure-env.js` для установки `DATABASE_URL`
- Передает `DATABASE_URL` в дочерние процессы (Prisma CLI)
- Критично для Prisma CLI, который читает env переменные напрямую

### 2. Где хранится SQLite файл

**Локально:**
- Путь: `./dev.db` (корень проекта)
- Файл создается автоматически при первой миграции или `db push`
- Добавлен в `.gitignore`

**На Vercel:**
- Путь: `/tmp/dev.db`
- ⚠️ **Важно:** `/tmp` - ephemeral файловая система
- Данные теряются при каждом деплое
- Для production используйте PostgreSQL

### 3. Build Pipeline

**Все Prisma команды автоматически используют fallback:**

```json
{
  "prisma:generate": "node scripts/run-with-env.js \"npx prisma generate\"",
  "prisma:migrate": "node scripts/run-with-env.js \"npx prisma migrate deploy\" || node scripts/run-with-env.js \"npx prisma db push\"",
  "vercel-build": "node scripts/setup-database.js && npm run build"
}
```

**Процесс:**
1. `ensure-env.js` устанавливает `DATABASE_URL` в `process.env`
2. `run-with-env.js` передает `DATABASE_URL` в Prisma CLI
3. Prisma команды получают `DATABASE_URL` и работают без ошибок

## Использование

### Локальная разработка

```bash
# DATABASE_URL не нужен - будет использован автоматически
npm run dev

# Build работает без DATABASE_URL
npm run build

# Prisma команды работают без DATABASE_URL
npm run prisma:generate
npm run prisma:migrate
```

### Vercel Deploy

**Без DATABASE_URL (SQLite автоматически):**
```
# Environment Variables в Vercel:
BOT_TOKEN=your_token
ADMIN_IDS=123456789
SUPERADMIN_IDS=123456789
# DATABASE_URL не нужен - будет использован file:/tmp/dev.db
```

**С PostgreSQL:**
```
DATABASE_URL=postgresql://user:pass@host:5432/db
BOT_TOKEN=your_token
ADMIN_IDS=123456789
SUPERADMIN_IDS=123456789
```

## Логирование

Скрипты логируют используемый провайдер:

```
⚠️  DATABASE_URL not set, using SQLite fallback: file:./dev.db
✅ Using SQLite: file:./dev.db
💾 Using SQLite database
🐘 Using PostgreSQL database
```

## Troubleshooting

### Ошибка: "Environment variable not found: DATABASE_URL"

**Решение:**
- ✅ **Автоматически исправлено:** Скрипт `ensure-env.js` устанавливает `DATABASE_URL`
- Проверьте, что скрипты существуют:
  - `scripts/ensure-env.js`
  - `scripts/run-with-env.js`
- Проверьте, что в `package.json` скрипты используют `node scripts/run-with-env.js`
- Скрипт должен автоматически установить `DATABASE_URL`

### SQLite файл не создается

**Решение:**
```bash
# Запустите db push (для SQLite)
npm run db:setup

# Или вручную
node scripts/run-with-env.js "npx prisma db push"
```

### На Vercel данные теряются

**Это нормально:** `/tmp` на Vercel - ephemeral. Для production используйте PostgreSQL.

### Build падает на Vercel

**Решение:**
- Убедитесь, что `vercel-build` использует `setup-database.js`
- Проверьте логи деплоя - должен быть виден провайдер БД
- Если ошибка "DATABASE_URL not found" - скрипт `ensure-env.js` не выполняется

---

**Версия:** 1.0.0  
**Последнее обновление:** 2024
