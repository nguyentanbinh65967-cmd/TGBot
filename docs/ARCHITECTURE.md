# Архитектура проекта "Школа Тхэквондо - Telegram WebApp"

## 📋 Обзор

Проект представляет собой **production-ready Telegram WebApp** на базе **Next.js 14 App Router** с полной серверной валидацией, **Role-Based Access Control (RBAC)**, админ-панелью и аудит-логированием.

---

## 🏗️ Общая архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                    Telegram WebApp Client                     │
│  (window.Telegram.WebApp.initData, window.Telegram.WebApp)   │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 14 App Router                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Middleware  │→ │ Server Comps │→ │ Client Comps │      │
│  │  (RBAC)      │  │  (Data Fetch)│  │  (UI/UX)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘             │
│                            │                                  │
│                            ▼                                  │
│              ┌─────────────────────────┐                      │
│              │   API Routes            │                      │
│              │   (Server Actions)      │                      │
│              └─────────────────────────┘                      │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Authentication & Authorization Layer            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ validateInit │  │   RBAC       │  │   Logger     │      │
│  │ Data (crypto)│  │   (Roles)    │  │   (Audit)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                        │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │    Users     │  │     Logs      │                        │
│  │  (Prisma)    │  │  (Audit Trail)│                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Слои безопасности

### 1. **Telegram WebApp Authentication**

**Клиентская инициализация:**
- `app/layout.tsx` → загружает `telegram-web-app.js` через `next/script` с `strategy="beforeInteractive"`
- `hooks/useTelegram.ts` → клиентский хук для безопасной работы с Telegram API
- Проверка наличия `window.Telegram.WebApp` перед использованием
- Извлечение `initData` и данных пользователя

**Серверная валидация:**
- `lib/auth/server.ts` → `validateInitData(initData: string)`
  - Использует `crypto` (Node.js) для HMAC-SHA256
  - Проверяет подпись согласно [официальной документации Telegram](https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app)
  - Валидирует `auth_date` (не старше 24 часов)
  - Возвращает типизированный `TelegramUser`

**Разделение клиент/сервер:**
- `lib/auth/client.ts` → клиентские функции (UX проверки, без `crypto`)
- `lib/auth/server.ts` → серверные функции (валидация, с `crypto`)
- `lib/auth.ts` → реэкспорт только клиентских функций для обратной совместимости

### 2. **Role-Based Access Control (RBAC)**

**Роли:**
- `guest` → неавторизованный пользователь (не хранится в БД)
- `user` → обычный пользователь
- `admin` → администратор
- `superadmin` → суперадминистратор

**Конфигурация:**
- `config/rbac.ts` → in-memory конфигурация (временная)
  - `SUPERADMIN_IDS` и `ADMIN_IDS` из `process.env`
  - Функции: `getUserRole()`, `hasAdminAccess()`, `isSuperAdmin()`
- `config/rbac.db.prisma.ts` → готово для миграции на БД

**Middleware защита:**
- `middleware.ts` → защищает `/api/admin/*` и `/admin/*`
  - Извлекает `initData` из `Authorization` header или body
  - Валидирует через `validateInitData()`
  - Определяет роль через `getUserRole()`
  - Возвращает `401/403 JSON` для API или редирект для страниц
  - Использует `runtime = "nodejs"` для доступа к `crypto`

### 3. **Database Layer**

**ORM: Prisma 6.x**
- `prisma/schema.prisma` → схема БД
  - `User` модель: `id` (BigInt, Telegram ID), `username`, `firstName`, `role`, `isBlocked`, timestamps
  - `Log` модель: `id`, `userId`, `role`, `action`, `entity`, `entityId`, `ip`, `userAgent`, `meta` (JSON), `createdAt`
  - Relations: `User` → `Log` (1-to-many, `onDelete: SetNull`)
  - Indexes: на `userId`, `role`, `action`, `entity`, `createdAt`

**Database Client:**
- `lib/db/prisma.ts` → singleton Prisma Client
  - Глобальный экземпляр для development
  - Переиспользование в production

**Seed:**
- `prisma/seed.ts` → создает/обновляет админов из `ADMIN_IDS` и `SUPERADMIN_IDS`

---

## 📁 Структура проекта

### **App Router (Next.js 14)**

```
app/
├── layout.tsx              # Root layout с Telegram script
├── page.tsx                # Главная страница
├── student/
│   └── page.tsx            # Страница студента
├── unauthorized/
│   └── page.tsx            # Страница "Доступ запрещен"
├── admin/
│   ├── layout.tsx           # Layout админ-панели (Client Component)
│   ├── page.tsx             # Dashboard (Client Component)
│   ├── users/
│   │   ├── page.tsx         # Список пользователей (Server Component)
│   │   ├── actions.ts       # Server Actions (toggleBlock, changeRole)
│   │   ├── UserActions.tsx  # Client Component для действий
│   │   └── UsersFiltersClient.tsx  # Client Component для фильтров
│   ├── logs/
│   │   ├── page.tsx         # Список логов (Server Component)
│   │   ├── [id]/page.tsx    # Детали лога (Server Component)
│   │   ├── LogMeta.tsx      # Client Component для JSON метаданных
│   │   └── LogsFiltersClient.tsx  # Client Component для фильтров
│   └── settings/
│       └── page.tsx         # Настройки (заглушка)
└── api/
    └── auth/
        └── check/
            └── route.ts     # API endpoint для проверки initData
```

### **Library Layer**

```
lib/
├── auth/
│   ├── client.ts           # Клиентские функции (checkAuth, isAdmin)
│   └── server.ts           # Серверные функции (validateInitData)
├── auth.ts                 # Реэкспорт клиентских функций
├── admin/
│   ├── users.ts            # Server-side helpers для пользователей
│   ├── logs.ts             # Server-side helpers для логов
│   └── logs-stats.ts       # Статистика логов (24h)
├── db/
│   └── prisma.ts           # Prisma Client singleton
├── logger.ts               # Интерфейс логирования
└── logger.db.prisma.ts     # Реализация логирования через Prisma
```

### **Configuration**

```
config/
├── rbac.ts                 # In-memory RBAC (временная)
└── rbac.db.prisma.ts       # RBAC через БД (готово для миграции)
```

### **Components**

```
components/
└── admin/
    ├── Badge.tsx           # Компонент для ролей/статусов
    └── Table.tsx           # Табличные компоненты (Table, TableCell, etc.)
```

### **Hooks**

```
hooks/
└── useTelegram.ts          # Хук для работы с Telegram WebApp SDK
```

### **Types**

```
types/
├── telegram.d.ts           # TypeScript типы для Telegram WebApp
└── user.ts                 # Типы пользователей и ролей
```

---

## 🔄 Потоки данных

### **1. Аутентификация пользователя**

```
1. Telegram WebApp → initData (query string)
   ↓
2. Client Component → useTelegram() → извлекает user из window.Telegram.WebApp
   ↓
3. Middleware → validateInitData(initData) → проверяет подпись
   ↓
4. Middleware → getUserRole(user) → определяет роль
   ↓
5. Middleware → проверяет доступ → разрешает/запрещает
```

### **2. Админ-панель: Управление пользователями**

```
1. Server Component (app/admin/users/page.tsx)
   ↓
2. getUsers(filters, pagination) → lib/admin/users.ts
   ↓
3. db.user.findMany() → Prisma → Database (PostgreSQL или SQLite)
   ↓
4. Рендер таблицы с данными
   ↓
5. Client Component (UserActions) → Server Action (toggleUserBlock/changeUserRole)
   ↓
6. Server Action → проверка прав → обновление БД → logAction()
   ↓
7. revalidatePath() → обновление UI
```

### **3. Аудит-логирование**

```
1. Любое действие админа (toggleBlock, changeRole, etc.)
   ↓
2. logAction(userId, role, action, entity, ...) → lib/logger.db.prisma.ts
   ↓
3. db.log.create() → Prisma → Database (PostgreSQL или SQLite)
   ↓
4. Логи доступны в /admin/logs (Server Component)
```

---

## 🛡️ Безопасность

### **Серверная валидация initData**

- ✅ Использует `crypto` (Node.js) для HMAC-SHA256
- ✅ Проверяет подпись согласно документации Telegram
- ✅ Валидирует `auth_date` (не старше 24 часов)
- ✅ Вызывается только на сервере (проверка `typeof window === "undefined"`)

### **RBAC Middleware**

- ✅ Защищает `/api/admin/*` и `/admin/*`
- ✅ Валидирует `initData` на каждом запросе
- ✅ Определяет роль пользователя
- ✅ Возвращает `401/403` для неавторизованных
- ✅ Использует `runtime = "nodejs"` для доступа к `crypto`

### **Server Actions**

- ✅ Все мутации через Server Actions (`"use server"`)
- ✅ Проверка прав на сервере перед выполнением
- ✅ Аудит-логирование всех действий
- ✅ Валидация входных данных

### **Разделение клиент/сервер**

- ✅ Клиентские функции не используют `node:crypto`
- ✅ Серверные функции изолированы в `lib/auth/server.ts`
- ✅ Webpack конфигурация исключает серверные модули из клиентского бандла

---

## 📊 База данных

### **Database Fallback Strategy (PostgreSQL → SQLite)**

Проект поддерживает автоматический fallback на SQLite, если PostgreSQL не подключен.

**Автоматическое определение провайдера:**
- Если `DATABASE_URL` начинается с `postgresql://` или `postgres://` → используется PostgreSQL
- Если `DATABASE_URL` начинается с `file:` → используется SQLite
- Если `DATABASE_URL` не установлен → автоматически используется SQLite (`file:./dev.db`)

**Совместимость типов:**
- `User.id`: `String` (вместо `BigInt`) для совместимости с SQLite и PostgreSQL
- `Log.userId`: `String?` (вместо `BigInt?`)
- `Log.meta`: `String?` (JSON string) вместо `Json?` для SQLite совместимости

**Преимущества:**
- ✅ Работает без настройки PostgreSQL (для разработки)
- ✅ Легко переключиться на PostgreSQL для production
- ✅ Одинаковая схема для обоих провайдеров
- ✅ Автоматический fallback на SQLite

**Ограничения SQLite:**
- ⚠️ На Vercel SQLite работает только в read-only режиме (данные теряются при каждом деплое)
- ⚠️ Для production рекомендуется использовать PostgreSQL

### **Схема (Prisma)**

**User:**
- `id` (String, PK) → Telegram User ID (String для совместимости с SQLite)
- `username`, `firstName`, `lastName`, `photoUrl`
- `role` (enum: `user`, `admin`, `superadmin`)
- `isBlocked` (boolean)
- `createdAt`, `updatedAt`, `lastLoginAt`

**Log:**
- `id` (Int, PK, auto-increment)
- `userId` (String?, FK → User.id, nullable)
- `role` (enum)
- `action` (string) → `"user.blocked"`, `"user.role.changed"`, etc.
- `entity` (string) → `"user"`, `"log"`, etc.
- `entityId` (string, nullable)
- `ip`, `userAgent`
- `meta` (String?, JSON string) → дополнительные данные (JSON string для SQLite совместимости)
- `createdAt` (timestamp)

**Indexes:**
- `User`: `id` (PK), `role`, `isBlocked`
- `Log`: `userId`, `role`, `action`, `entity`, `createdAt`

---

## 🎨 UI/UX

### **Telegram Theme Integration**

- `app/admin/layout.tsx` → применяет Telegram theme colors через CSS variables
- Адаптивный дизайн (mobile-first)
- Tailwind CSS для стилизации

### **Компоненты**

- **Server Components** → для данных (users, logs)
- **Client Components** → для интерактивности (фильтры, действия)
- **Suspense Boundaries** → для `useSearchParams()`

---

## 🚀 Деплой

### **Vercel Configuration**

- `vercel.json` → Build Command: `npm run vercel-build`
- `package.json` → `vercel-build`: `prisma:generate && prisma:migrate && build`
- Environment Variables:
  - `DATABASE_URL` (Production scope)
  - `BOT_TOKEN` (Production scope)
  - `ADMIN_IDS` (Production scope)
  - `SUPERADMIN_IDS` (Production scope)

### **Build Pipeline**

1. `npm install` → установка зависимостей
2. `npx prisma generate` → генерация Prisma Client
3. `npx prisma migrate deploy` → применение миграций
4. `next build` → сборка Next.js

### **Runtime**

- **Middleware:** `runtime = "nodejs"` (для `crypto`)
- **API Routes:** Node.js runtime (по умолчанию)
- **Server Components:** Node.js runtime (по умолчанию)

---

## 🔧 Исправления и оптимизации

### **Проблема: `node:crypto` в клиентском бандле**

**Решение:**
1. Разделение `lib/auth.ts` на `client.ts` и `server.ts`
2. Клиентские компоненты импортируют из `@/lib/auth/client`
3. Серверные компоненты/API импортируют из `@/lib/auth/server`
4. Webpack конфигурация исключает серверные модули из клиентского бандла

### **Проблема: Prisma CLI не найден на Vercel**

**Решение:**
1. Использование `npx prisma` вместо `prisma`
2. `vercel-build` скрипт в `package.json`
3. `postinstall` скрипт для генерации Prisma Client

### **Проблема: TypeScript ошибки**

**Решение:**
1. Добавлены `colSpan` и `title` в `TableCell`
2. Исправлен тип `Role` для Prisma (исключен `guest`)
3. Добавлен `Suspense` для `useSearchParams()`
4. Удалены неиспользуемые файлы Drizzle

---

## 📈 Масштабируемость

### **Готово к миграции:**

1. **RBAC из env в БД:**
   - `config/rbac.db.prisma.ts` готов
   - Заменить `getUserRole()` на БД lookup

2. **Расширение ролей:**
   - Enum `Role` в Prisma schema
   - Легко добавить новые роли

3. **Аудит-логирование:**
   - Централизованное через `lib/logger.db.prisma.ts`
   - Все действия логируются автоматически

4. **Производительность:**
   - Индексы на часто используемых полях
   - Пагинация для больших списков
   - Server-side фильтрация и сортировка

---

## 📚 Документация

- `README.md` → общая документация
- `docs/ARCHITECTURE.md` → этот файл
- `docs/VERCEL_DEPLOYMENT.md` → деплой на Vercel
- `docs/ENV_SETUP.md` → настройка переменных окружения
- `docs/RBAC.md` → RBAC система
- `docs/VALIDATION.md` → валидация initData
- `docs/ADMIN.md` → админ-панель
- `docs/DATABASE.md` → работа с БД

---

## ✅ Production-Ready Features

- ✅ Серверная валидация Telegram initData
- ✅ RBAC с middleware защитой
- ✅ Аудит-логирование всех действий
- ✅ Админ-панель с управлением пользователями
- ✅ Server Components для производительности
- ✅ TypeScript для типобезопасности
- ✅ Prisma для работы с БД
- ✅ Vercel-ready деплой конфигурация
- ✅ Безопасное разделение клиент/сервер
- ✅ Адаптивный UI с Telegram theme

---

## 🔮 Будущие улучшения

1. **Миграция RBAC в БД** → заменить `config/rbac.ts` на `config/rbac.db.prisma.ts`
2. **Расширение админ-панели** → больше статистики, экспорт данных
3. **Кэширование** → Redis для сессий и часто запрашиваемых данных
4. **Rate Limiting** → защита от злоупотреблений
5. **WebSocket** → real-time обновления в админ-панели

---

**Версия:** 1.0.0  
**Последнее обновление:** 2024  
**Статус:** ✅ Production Ready
