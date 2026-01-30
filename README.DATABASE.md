# Database Setup Guide

## Быстрый старт

### 1. Выберите ORM

Проект поддерживает два варианта:
- **Prisma** (рекомендуется) - более простой в использовании
- **Drizzle** - более легковесный, больше контроля

### 2. Установите зависимости

**Prisma:**
```bash
npm install prisma @prisma/client
npm install -D prisma
```

**Drizzle:**
```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit @types/pg tsx
```

### 3. Настройте базу данных

Добавьте в `.env.local`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/taekwondo_school?schema=public"
```

### 4. Создайте миграции

**Prisma:**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

**Drizzle:**
```bash
npx drizzle-kit generate:pg
npx drizzle-kit migrate
```

### 5. Запустите seed

**Prisma:**
```bash
npx prisma db seed
```

**Drizzle:**
```bash
tsx db/seed.ts
```

## Структура файлов

```
├── prisma/
│   ├── schema.prisma      # Prisma схема
│   └── seed.ts            # Prisma seed
├── db/
│   ├── schema.ts          # Drizzle схема
│   └── seed.ts            # Drizzle seed
├── lib/
│   ├── db/
│   │   ├── prisma.ts      # Prisma client
│   │   └── drizzle.ts     # Drizzle client
│   ├── logger.db.prisma.ts    # Логирование (Prisma)
│   └── logger.db.drizzle.ts   # Логирование (Drizzle)
├── config/
│   ├── rbac.db.prisma.ts  # RBAC (Prisma)
│   └── rbac.db.drizzle.ts # RBAC (Drizzle)
└── examples/
    └── db-usage.ts        # Примеры использования
```

## Миграция с config на БД

### Шаг 1: Обновите импорты

**В `config/rbac.ts` (или где используется):**

```typescript
// Было:
import { getUserRole } from "@/config/rbac";

// Стало (Prisma):
import { getUserRole } from "@/config/rbac.db.prisma";

// Или (Drizzle):
import { getUserRole } from "@/config/rbac.db.drizzle";
```

**В `lib/logger.ts` (или где используется):**

```typescript
// Было:
import { logAdminAction } from "@/lib/logger";

// Стало (Prisma):
import { logAdminAction } from "@/lib/logger.db.prisma";

// Или (Drizzle):
import { logAdminAction } from "@/lib/logger.db.drizzle";
```

### Шаг 2: Обновите middleware.ts

Middleware нужно обновить для поддержки async:

```typescript
// middleware.ts
import { getUserRole } from "@/config/rbac.db.prisma"; // или .drizzle

export async function middleware(request: NextRequest) {
  // ...
  
  const user = validateInitData(initData);
  const role = await getUserRole(user); // Теперь async!
  
  // ...
}
```

## Примеры использования

См. файл `examples/db-usage.ts` для подробных примеров.

## Документация

Полная документация: `docs/DATABASE.md`

## Troubleshooting

### Ошибка подключения

Проверьте `DATABASE_URL` в `.env.local`.

### Ошибка BigInt

Используйте `BigInt()` для Telegram ID:
```typescript
const userId = BigInt(123456789);
```

### Ошибка enum

Убедитесь, что enum значения совпадают в схеме и коде.
