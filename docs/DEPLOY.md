# Деплой проекта на Vercel

## Database Fallback Strategy (PostgreSQL → SQLite)

Проект поддерживает автоматический fallback на SQLite, если PostgreSQL не подключен.

### Как это работает

1. **Автоматическое определение провайдера:**
   - Если `DATABASE_URL` начинается с `postgresql://` или `postgres://` → используется PostgreSQL
   - Если `DATABASE_URL` начинается с `file:` → используется SQLite
   - Если `DATABASE_URL` не установлен → автоматически используется SQLite

2. **Автоматическая генерация DATABASE_URL:**
   - Скрипт `scripts/ensure-env.js` автоматически устанавливает `DATABASE_URL` перед запуском Prisma команд
   - Скрипт `scripts/run-with-env.js` передает `DATABASE_URL` в дочерние процессы (Prisma CLI)
   - Локально: `file:./dev.db` (в корне проекта)
   - На Vercel: `file:/tmp/dev.db` (ephemeral - данные теряются между деплоями)
   - Файл `.env.local` создается автоматически, если его нет и `DATABASE_URL` отсутствует

3. **Логирование провайдера:**
   - Все скрипты логируют используемый провайдер БД
   - Пример: `✅ Using SQLite: file:./dev.db` или `🐘 Using PostgreSQL database`

3. **Где хранится SQLite файл:**
   - **Локально:** `./dev.db` (в корне проекта)
   - **На Vercel:** `/tmp/dev.db` (ephemeral файловая система)
     - ⚠️ **Важно:** На Vercel `/tmp` очищается при каждом деплое
     - Данные в SQLite на Vercel не сохраняются между деплоями
     - Для production используйте PostgreSQL

2. **Схема базы данных:**
   - Основная схема (`prisma/schema.prisma`) настроена на SQLite по умолчанию
   - Для PostgreSQL используется альтернативная схема (`prisma/schema.postgres.prisma`)
   - Типы данных адаптированы для совместимости:
     - `User.id`: `String` (вместо `BigInt`) для совместимости с SQLite
     - `Log.meta`: `String` (JSON string) вместо `Json` для SQLite

3. **Build Pipeline:**
   - `npm run prisma:generate` → устанавливает DATABASE_URL → генерирует Prisma Client
   - `npm run prisma:migrate` → устанавливает DATABASE_URL → применяет миграции (deploy для PostgreSQL, db push для SQLite)
   - `npm run vercel-build` → использует `setup-database.js` → полная настройка БД → build
   - Все команды работают даже если `DATABASE_URL` не установлен (используется SQLite fallback)

---

## Деплой на Vercel

### Вариант 1: С PostgreSQL (рекомендуется для production)

1. **Создайте PostgreSQL базу данных:**
   - [Neon](https://neon.tech) (бесплатный tier)
   - [Supabase](https://supabase.com) (бесплатный tier)
   - Или любой другой managed PostgreSQL

2. **Настройте Environment Variables в Vercel:**
   ```
   DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
   BOT_TOKEN=your_bot_token
   ADMIN_IDS=123456789,987654321
   SUPERADMIN_IDS=987654321
   NODE_ENV=production
   ```

3. **Деплой:**
   - Vercel автоматически выполнит `npm run vercel-build`
   - Это запустит: `prisma generate` → `prisma migrate deploy` → `next build`

### Вариант 2: С SQLite (fallback, автоматически)

⚠️ **Внимание:** SQLite на Vercel использует `/tmp/dev.db` (ephemeral). Данные теряются при каждом деплое. Для production используйте PostgreSQL.

1. **Не устанавливайте DATABASE_URL** (или установите `DATABASE_URL=file:/tmp/dev.db`):
   ```
   # DATABASE_URL не нужен - будет использован SQLite автоматически
   BOT_TOKEN=your_bot_token
   ADMIN_IDS=123456789,987654321
   SUPERADMIN_IDS=987654321
   NODE_ENV=production
   ```

2. **Деплой:**
   - Скрипт `ensure-env.js` автоматически установит `DATABASE_URL=file:/tmp/dev.db`
   - Vercel выполнит миграции и создаст SQLite файл в `/tmp`
   - ⚠️ Данные будут теряться при каждом деплое (ephemeral файловая система)

---

## Локальная разработка

### С SQLite (по умолчанию, автоматически)

1. **Создайте `.env.local` (или оставьте пустым - DATABASE_URL сгенерируется автоматически):**
   ```env
   # DATABASE_URL не обязателен - будет использован file:./dev.db автоматически
   # DATABASE_URL="file:./dev.db"  # Опционально, если хотите указать явно
   BOT_TOKEN="your_bot_token"
   ADMIN_IDS=123456789
   SUPERADMIN_IDS=123456789
   NODE_ENV=development
   ```

2. **Настройте БД:**
   ```bash
   npm run db:setup
   # Или вручную (DATABASE_URL будет установлен автоматически):
   npm run prisma:generate
   npm run prisma:migrate
   ```

3. **Запустите seed (опционально):**
   ```bash
   npx prisma db seed
   ```
   
4. **SQLite файл:**
   - Создается автоматически в `./dev.db` (корень проекта)
   - Добавьте `dev.db` в `.gitignore` (если еще не добавлен)

### С PostgreSQL

1. **Создайте `.env.local`:**
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/taekwondo_school"
   BOT_TOKEN="your_bot_token"
   ADMIN_IDS=123456789
   SUPERADMIN_IDS=123456789
   NODE_ENV=development
   ```

2. **Настройте БД:**
   ```bash
   npm run db:setup
   # Или вручную:
   npx prisma generate
   npx prisma migrate deploy
   ```

---

## Миграции

### Создание новой миграции

```bash
# Для SQLite (по умолчанию)
npx prisma migrate dev --name migration_name

# Для PostgreSQL (если DATABASE_URL указывает на PostgreSQL)
npx prisma migrate dev --name migration_name
```

### Применение миграций

```bash
# Production (PostgreSQL)
npx prisma migrate deploy

# Development (SQLite или PostgreSQL)
npx prisma migrate dev
```

---

## Проверка работы БД

### Локально

```bash
# Откройте Prisma Studio
npx prisma studio

# Или проверьте через скрипт
node scripts/setup-database.js
```

### На Vercel

1. Проверьте логи деплоя:
   - `prisma generate` должен выполниться успешно
   - `prisma migrate deploy` должен применить миграции

2. Проверьте работу приложения:
   - Откройте админ-панель
   - Проверьте, что пользователи загружаются
   - Проверьте, что логи создаются

---

## Troubleshooting

### Ошибка: "Environment variable not found: DATABASE_URL"

**Решение:**
- ✅ **Автоматически исправлено:** Скрипт `ensure-env.js` автоматически устанавливает `DATABASE_URL` перед Prisma командами
- Скрипт `run-with-env.js` передает `DATABASE_URL` в дочерние процессы (Prisma CLI)
- SQLite fallback включается автоматически:
  - **Локально:** `file:./dev.db` (в корне проекта)
  - **На Vercel:** `file:/tmp/dev.db` (ephemeral - данные теряются между деплоями)
- Если ошибка все еще возникает:
  - Проверьте, что скрипты `scripts/ensure-env.js` и `scripts/run-with-env.js` существуют
  - В `package.json` скрипты используют `node scripts/run-with-env.js`
  - Убедитесь, что `.env.local` не блокирует установку `DATABASE_URL`

### Ошибка: "Migration failed"

**Решение:**
- Для SQLite: используйте `npx prisma db push` (не требует shadow database)
- Для PostgreSQL: используйте `npx prisma migrate deploy`
- Скрипт `setup-database.js` автоматически выбирает правильный метод
- Проверьте, что БД доступна и credentials правильные

### Ошибка: "Prisma Client not generated"

**Решение:**
```bash
npx prisma generate
```

### SQLite на Vercel не сохраняет данные

**Это нормально:** Vercel использует read-only файловую систему. Для production используйте PostgreSQL.

---

## Рекомендации

1. **Production:** Всегда используйте PostgreSQL (Neon, Supabase, или другой managed service)
2. **Development:** SQLite удобен для локальной разработки
3. **Testing:** SQLite можно использовать для тестов, но лучше использовать отдельную PostgreSQL БД

---

## Миграция с SQLite на PostgreSQL

Если вы начали с SQLite и хотите перейти на PostgreSQL:

1. **Экспортируйте данные из SQLite:**
   ```bash
   npx prisma db pull
   ```

2. **Настройте PostgreSQL:**
   - Создайте БД на Neon/Supabase
   - Обновите `DATABASE_URL` в `.env.local`

3. **Примените миграции:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Импортируйте данные (если нужно):**
   - Используйте Prisma Studio или скрипт для миграции данных

---

**Версия:** 1.0.0  
**Последнее обновление:** 2024
