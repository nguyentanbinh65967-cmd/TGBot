# SQLite Fallback - Автоматическая настройка

## Обзор

Проект автоматически использует SQLite, если `DATABASE_URL` не установлен. Это позволяет:
- ✅ Собирать проект без настройки PostgreSQL
- ✅ Запускать локально без дополнительной конфигурации
- ✅ Тестировать на Vercel без подключения БД

## Как это работает

### Автоматическая генерация DATABASE_URL

Скрипт `scripts/ensure-env.js` автоматически:
1. Проверяет наличие `DATABASE_URL`
2. Если отсутствует → устанавливает SQLite fallback:
   - **Локально:** `file:./dev.db`
   - **На Vercel:** `file:/tmp/dev.db`
3. Создает/обновляет `.env.local` с `DATABASE_URL`

### Где хранится SQLite файл

**Локально:**
- Путь: `./dev.db` (корень проекта)
- Файл создается автоматически при первой миграции
- Добавлен в `.gitignore`

**На Vercel:**
- Путь: `/tmp/dev.db`
- ⚠️ **Важно:** `/tmp` - ephemeral файловая система
- Данные теряются при каждом деплое
- Для production используйте PostgreSQL

## Использование

### Локальная разработка

```bash
# DATABASE_URL не нужен - будет использован автоматически
npm run dev

# Или явно установите:
DATABASE_URL="file:./dev.db" npm run dev
```

### Build

```bash
# Build работает без DATABASE_URL
npm run build

# Скрипт ensure-env.js автоматически установит DATABASE_URL
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

## Скрипты

Все Prisma команды автоматически используют `ensure-env.js` и `run-with-env.js`:

- `npm run prisma:generate` → устанавливает DATABASE_URL → генерирует Prisma Client
- `npm run prisma:migrate` → устанавливает DATABASE_URL → применяет миграции (deploy для PostgreSQL, db push для SQLite)
- `npm run vercel-build` → использует `setup-database.js` → полная настройка БД → build
- `npm run db:setup` → полная настройка БД (generate + migrate/push)

**Как это работает:**
1. `ensure-env.js` устанавливает `DATABASE_URL` в `process.env`
2. `run-with-env.js` передает `DATABASE_URL` в дочерние процессы (Prisma CLI)
3. Prisma команды получают `DATABASE_URL` и работают без ошибок

## Логирование

Скрипты логируют используемый провайдер:

```
⚠️  DATABASE_URL not set, using SQLite fallback: file:./dev.db
✅ Using PostgreSQL: postgresql://...
💾 Using SQLite database
```

## Troubleshooting

### Ошибка: "Environment variable not found: DATABASE_URL"

**Решение:**
- Убедитесь, что скрипт `scripts/ensure-env.js` выполняется
- Проверьте, что в `package.json` скрипты используют `node scripts/ensure-env.js`
- Скрипт должен автоматически установить `DATABASE_URL`

### SQLite файл не создается

**Решение:**
```bash
# Запустите миграции вручную
npm run prisma:migrate

# Или через setup
npm run db:setup
```

### На Vercel данные теряются

**Это нормально:** `/tmp` на Vercel - ephemeral. Для production используйте PostgreSQL.

---

**Версия:** 1.0.0  
**Последнее обновление:** 2024
