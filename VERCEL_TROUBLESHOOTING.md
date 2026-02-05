# 🔧 Решение проблемы "Сайт не позволяет установить соединение" на Vercel

## Возможные причины

### 1. Ошибка сборки (Build Error)

**Симптомы:**
- Сайт не открывается
- В Vercel Dashboard видна ошибка сборки

**Решение:**
1. Откройте **Vercel Dashboard** → ваш проект → **Deployments**
2. Откройте последний деплой
3. Проверьте **Build Logs** на наличие ошибок
4. Частые ошибки:
   - `prisma: command not found` → проверьте, что `prisma` в `dependencies`
   - `DATABASE_URL not found` → проверьте Environment Variables
   - `Module not found` → проверьте импорты

### 2. Ошибка Runtime (Runtime Error)

**Симптомы:**
- Сборка успешна, но сайт не открывается
- В Runtime Logs видны ошибки

**Решение:**
1. Откройте **Vercel Dashboard** → ваш проект → **Deployments**
2. Откройте последний деплой → **Runtime Logs**
3. Проверьте ошибки:
   - `Cannot find module` → проверьте импорты
   - `Edge runtime does not support` → добавьте `export const runtime = "nodejs"`
   - `Database connection error` → проверьте `DATABASE_URL`

### 3. Проблемы с Environment Variables

**Симптомы:**
- Сборка успешна, но приложение падает при запуске
- Ошибки типа "BOT_TOKEN is not configured"

**Решение:**
1. Откройте **Vercel Dashboard** → ваш проект → **Settings** → **Environment Variables**
2. Убедитесь, что установлены:
   - `BOT_TOKEN` (обязательно)
   - `DATABASE_URL` (опционально, если используется PostgreSQL)
3. Проверьте **Environment** scope:
   - `Production` - для production деплоев
   - `Preview` - для preview деплоев
4. После добавления переменных → **Redeploy** (без кеша)

### 4. Проблемы с Middleware

**Симптомы:**
- Ошибки типа "crypto is not defined" или "Edge runtime"

**Решение:**
Middleware в Next.js по умолчанию использует Edge runtime, где нет `node:crypto`.
Если middleware использует `validateInitData`, нужно:

1. **Вариант A:** Убрать валидацию из middleware, делать её в API routes
2. **Вариант B:** Использовать только для защищенных роутов (уже настроено)

Текущая конфигурация middleware защищает только `/api/admin/*` и `/admin/*`, что правильно.

### 5. Проблемы с Prisma

**Симптомы:**
- Ошибки типа "Prisma Client not generated" или "Schema validation error"

**Решение:**
1. Проверьте, что `prisma` в `dependencies` (не в `devDependencies`)
2. Проверьте, что `postinstall` скрипт выполняется:
   ```json
   "postinstall": "node scripts/run-with-env.js \"npx prisma generate\" || true"
   ```
3. Проверьте логи build - должна быть строка "Prisma Client generated successfully"

## 🔍 Диагностика

### Шаг 1: Проверьте Build Logs

1. Откройте Vercel Dashboard
2. Выберите проект
3. Перейдите в **Deployments**
4. Откройте последний деплой
5. Проверьте **Build Logs**

**Ожидаемые сообщения:**
```
✅ Using SQLite: file:/tmp/dev.db
🔨 Generating Prisma Client...
✅ Prisma Client generated successfully
📊 Applying database schema...
✅ Database schema applied successfully
```

### Шаг 2: Проверьте Runtime Logs

1. Откройте последний деплой
2. Перейдите в **Runtime Logs**
3. Попробуйте открыть сайт
4. Проверьте логи на ошибки

### Шаг 3: Проверьте Environment Variables

1. **Settings** → **Environment Variables**
2. Убедитесь, что установлены:
   - `BOT_TOKEN` ✅
   - `DATABASE_URL` (если используется PostgreSQL) ✅
3. Проверьте scope: **Production** ✅

### Шаг 4: Проверьте конфигурацию

1. **Settings** → **General** → **Build & Development Settings**
2. Проверьте:
   - **Build Command:** `npm run vercel-build` ✅
   - **Install Command:** `npm install` ✅
   - **Output Directory:** `.next` (по умолчанию) ✅

## 🛠️ Быстрое исправление

### Если сборка падает:

1. **Проверьте `package.json`:**
   ```json
   {
     "dependencies": {
       "prisma": "^6.0.0"  // Должно быть здесь, не в devDependencies
     }
   }
   ```

2. **Проверьте `vercel.json`:**
   ```json
   {
     "buildCommand": "npm run vercel-build"
   }
   ```

3. **Передеплойте без кеша:**
   - В Vercel Dashboard → **Deployments** → **Redeploy**
   - Выберите **Use existing Build Cache** = ❌

### Если runtime падает:

1. **Проверьте API routes:**
   - Все routes, использующие `validateInitData`, должны иметь:
   ```typescript
   export const runtime = "nodejs";
   ```

2. **Проверьте импорты:**
   - Нет ли циклических зависимостей
   - Все импорты корректны

3. **Проверьте базу данных:**
   - Если используется SQLite, убедитесь, что `/tmp` доступен
   - Если PostgreSQL, проверьте connection string

## 📋 Чек-лист

- [ ] `BOT_TOKEN` установлен в Environment Variables
- [ ] `DATABASE_URL` установлен (если используется PostgreSQL)
- [ ] `prisma` в `dependencies` (не в `devDependencies`)
- [ ] `vercel-build` скрипт настроен правильно
- [ ] Все API routes с `validateInitData` имеют `export const runtime = "nodejs"`
- [ ] Build успешен (проверьте Build Logs)
- [ ] Нет ошибок в Runtime Logs

## 🆘 Если ничего не помогает

1. **Проверьте полные логи:**
   - Build Logs
   - Runtime Logs
   - Function Logs

2. **Попробуйте локальный build:**
   ```bash
   npm run vercel-build
   ```
   Если локально работает, проблема в конфигурации Vercel.

3. **Создайте минимальный тест:**
   - Создайте простой API route без зависимостей
   - Проверьте, работает ли он

4. **Обратитесь в поддержку Vercel:**
   - Приложите логи сборки и runtime
   - Опишите проблему
