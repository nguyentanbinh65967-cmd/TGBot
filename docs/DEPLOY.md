# Деплой проекта на Vercel

## Database Fallback Strategy (PostgreSQL → SQLite)

Проект поддерживает автоматический fallback на SQLite, если PostgreSQL не подключен.

### Как это работает

1. **Автоматическое определение провайдера:**
   - Если `DATABASE_URL` начинается с `postgresql://` или `postgres://` → используется PostgreSQL
   - Если `DATABASE_URL` начинается с `file:` → используется SQLite
   - Если `DATABASE_URL` не установлен → автоматически используется SQLite (`file:./dev.db`)

2. **Схема базы данных:**
   - Основная схема (`prisma/schema.prisma`) настроена на SQLite по умолчанию
   - Для PostgreSQL используется альтернативная схема (`prisma/schema.postgres.prisma`)
   - Типы данных адаптированы для совместимости:
     - `User.id`: `String` (вместо `BigInt`) для совместимости с SQLite
     - `Log.meta`: `String` (JSON string) вместо `Json` для SQLite

3. **Build Pipeline:**
   - `npm run prisma:generate` → генерирует Prisma Client
   - `npm run prisma:migrate` → применяет миграции (deploy для PostgreSQL, dev для SQLite)

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

### Вариант 2: С SQLite (fallback, для тестирования)

⚠️ **Внимание:** SQLite на Vercel работает только в read-only режиме из-за ограничений файловой системы. Для production используйте PostgreSQL.

1. **Настройте Environment Variables в Vercel:**
   ```
   DATABASE_URL=file:./dev.db
   BOT_TOKEN=your_bot_token
   ADMIN_IDS=123456789,987654321
   SUPERADMIN_IDS=987654321
   NODE_ENV=production
   ```

2. **Деплой:**
   - Vercel выполнит миграции и создаст SQLite файл
   - ⚠️ Данные будут теряться при каждом деплое (файловая система Vercel не персистентна)

---

## Локальная разработка

### С SQLite (по умолчанию)

1. **Создайте `.env.local`:**
   ```env
   DATABASE_URL="file:./dev.db"
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
   npx prisma migrate dev --name init
   ```

3. **Запустите seed (опционально):**
   ```bash
   npx prisma db seed
   ```

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

### Ошибка: "DATABASE_URL is not set"

**Решение:**
- Убедитесь, что `DATABASE_URL` установлен в Environment Variables (Vercel) или `.env.local` (локально)
- Или используйте SQLite fallback (не устанавливайте `DATABASE_URL`)

### Ошибка: "Migration failed"

**Решение:**
- Для SQLite: используйте `npx prisma migrate dev`
- Для PostgreSQL: используйте `npx prisma migrate deploy`
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
