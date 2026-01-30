# Database Schema & Migration Guide

## Обзор

Проект поддерживает два варианта ORM:
- **Prisma** (рекомендуется для начинающих)
- **Drizzle** (более легковесный, больше контроля)

## Структура базы данных

### Таблица `users`

Хранит данные пользователей Telegram WebApp.

**Поля:**
- `id` (BigInt, PK) - Telegram User ID
- `username` (String, nullable) - Telegram username
- `first_name` (String) - Имя пользователя
- `last_name` (String, nullable) - Фамилия
- `photo_url` (String, nullable) - URL фото профиля
- `role` (Enum: user | admin | superadmin) - Роль пользователя
- `is_blocked` (Boolean) - Заблокирован ли пользователь
- `created_at` (Timestamp) - Дата создания
- `updated_at` (Timestamp) - Дата обновления
- `last_login_at` (Timestamp, nullable) - Дата последнего входа

**Индексы:**
- `idx_users_role` - для фильтрации по ролям
- `idx_users_is_blocked` - для фильтрации заблокированных
- `idx_users_last_login_at` - для сортировки по активности

### Таблица `logs`

Хранит логи действий пользователей (Audit Trail).

**Поля:**
- `id` (Int, PK, autoincrement) - ID лога
- `user_id` (BigInt, FK → users.id, nullable) - ID пользователя
- `role` (Enum) - Роль на момент действия
- `action` (String) - Тип действия
- `entity` (String, nullable) - Тип сущности
- `entity_id` (String, nullable) - ID сущности
- `ip` (String) - IP адрес
- `user_agent` (Text) - User Agent
- `meta` (JSON) - Дополнительные метаданные
- `created_at` (Timestamp) - Дата создания

**Индексы:**
- `idx_logs_user_id` - для фильтрации по пользователю
- `idx_logs_action` - для фильтрации по действиям
- `idx_logs_entity` - для фильтрации по сущностям
- `idx_logs_created_at` - для сортировки по дате
- `idx_logs_role` - для фильтрации по ролям

## Установка и настройка

### Prisma

1. Установите зависимости:

```bash
npm install prisma @prisma/client
npm install -D prisma
```

2. Настройте `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/taekwondo_school?schema=public"
```

3. Создайте миграцию:

```bash
npx prisma migrate dev --name init
```

4. Сгенерируйте Prisma Client:

```bash
npx prisma generate
```

5. Запустите seed:

```bash
npx prisma db seed
```

### Drizzle

1. Установите зависимости:

```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit @types/pg
```

2. Настройте `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/taekwondo_school?schema=public"
```

3. Создайте `drizzle.config.ts`:

```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

4. Создайте миграцию:

```bash
npx drizzle-kit generate:pg
npx drizzle-kit migrate
```

5. Запустите seed:

```bash
tsx db/seed.ts
```

## Миграция с config на БД

### Шаг 1: Выберите ORM

Выберите Prisma или Drizzle в зависимости от ваших предпочтений.

### Шаг 2: Обновите импорты

#### Для RBAC (config/rbac.ts):

**Prisma:**
```typescript
// Было:
import { getUserRole } from "@/config/rbac";

// Стало:
import { getUserRole } from "@/config/rbac.db.prisma";
```

**Drizzle:**
```typescript
// Было:
import { getUserRole } from "@/config/rbac";

// Стало:
import { getUserRole } from "@/config/rbac.db.drizzle";
```

#### Для Logger (lib/logger.ts):

**Prisma:**
```typescript
// Было:
import { logAdminAction } from "@/lib/logger";

// Стало:
import { logAdminAction } from "@/lib/logger.db.prisma";
```

**Drizzle:**
```typescript
// Было:
import { logAdminAction } from "@/lib/logger";

// Стало:
import { logAdminAction } from "@/lib/logger.db.drizzle";
```

### Шаг 3: Обновите middleware.ts

Middleware нужно обновить для поддержки async функций:

```typescript
// middleware.ts
import { getUserRole } from "@/config/rbac.db.prisma"; // или .drizzle

export async function middleware(request: NextRequest) {
  // ...
  
  // Валидируем initData
  const user = validateInitData(initData);
  
  // Определяем роль из БД (теперь async)
  const role = await getUserRole(user);
  
  // ...
}
```

### Шаг 4: Обновите package.json

Добавьте скрипты:

**Prisma:**
```json
{
  "scripts": {
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

**Drizzle:**
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate:pg",
    "db:migrate": "drizzle-kit migrate",
    "db:seed": "tsx db/seed.ts"
  }
}
```

## Примеры использования

### Получить пользователя

**Prisma:**
```typescript
import { db } from "@/lib/db/prisma";

const user = await db.user.findUnique({
  where: { id: BigInt(123456789) },
});
```

**Drizzle:**
```typescript
import { db } from "@/lib/db/drizzle";

const user = await db.query.users.findFirst({
  where: (users, { eq }) => eq(users.id, BigInt(123456789)),
});
```

### Создать или обновить пользователя

**Prisma:**
```typescript
const user = await db.user.upsert({
  where: { id: BigInt(123456789) },
  update: {
    firstName: "John",
    lastLoginAt: new Date(),
  },
  create: {
    id: BigInt(123456789),
    firstName: "John",
    role: "user",
  },
});
```

**Drizzle:**
```typescript
import { upsertUser } from "@/config/rbac.db.drizzle";

const user = await upsertUser(telegramUser);
```

### Записать лог

**Prisma:**
```typescript
import { logAction } from "@/lib/logger.db.prisma";

await logAction(
  userId,
  "admin",
  "user.created",
  "user",
  "123456789",
  request.headers.get("x-forwarded-for") || "unknown",
  request.headers.get("user-agent") || "unknown",
  { additional: "data" }
);
```

**Drizzle:**
```typescript
import { logAction } from "@/lib/logger.db.drizzle";

await logAction(
  userId,
  "admin",
  "user.created",
  "user",
  "123456789",
  request.headers.get("x-forwarded-for") || "unknown",
  request.headers.get("user-agent") || "unknown",
  { additional: "data" }
);
```

### Получить логи

**Prisma:**
```typescript
import { getAdminLogs } from "@/lib/logger.db.prisma";

const logs = await getAdminLogs(123456789, 50);
```

**Drizzle:**
```typescript
import { getAdminLogs } from "@/lib/logger.db.drizzle";

const logs = await getAdminLogs(123456789, 50);
```

## Автоматическое создание пользователей

При первом входе пользователя можно автоматически создавать запись в БД:

```typescript
// В middleware или API route
const user = validateInitData(initData);

// Создаем или обновляем пользователя
await upsertUser(user);

// Получаем роль из БД
const role = await getUserRole(user);
```

## Seed данные

Seed файлы автоматически создают суперадминов и админов на основе переменных окружения:

```env
SUPERADMIN_IDS=987654321
ADMIN_IDS=123456789,987654321
```

Запуск seed:
- Prisma: `npx prisma db seed`
- Drizzle: `tsx db/seed.ts`

## Миграции

### Prisma

```bash
# Создать новую миграцию
npx prisma migrate dev --name add_new_field

# Применить миграции в продакшене
npx prisma migrate deploy
```

### Drizzle

```bash
# Сгенерировать миграцию
npx drizzle-kit generate:pg

# Применить миграцию
npx drizzle-kit migrate
```

## Рекомендации

1. **Всегда используйте транзакции** для критических операций
2. **Индексируйте часто используемые поля** для производительности
3. **Используйте connection pooling** в продакшене
4. **Регулярно делайте бэкапы** базы данных
5. **Мониторьте производительность** запросов

## Troubleshooting

### Ошибка подключения к БД

Проверьте `DATABASE_URL` в `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

### Ошибка BigInt

В JavaScript BigInt нужно преобразовывать:
```typescript
const userId = BigInt(123456789);
```

### Ошибка enum

Убедитесь, что enum значения совпадают в схеме и коде.
