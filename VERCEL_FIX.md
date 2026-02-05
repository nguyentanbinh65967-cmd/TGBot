# 🔧 Быстрое исправление проблемы "Сайт не позволяет установить соединение"

## 🎯 Первые шаги диагностики

### 1. Проверьте Health Check

Откройте в браузере:
```
https://tg-bot-eta-gray.vercel.app/api/health
```

**Если видите JSON с `"status": "ok"`** → приложение работает, проблема в другом месте.

**Если не открывается** → проблема в сборке или запуске приложения.

### 2. Проверьте Build Logs в Vercel

1. Зайдите на [vercel.com](https://vercel.com)
2. Откройте ваш проект
3. Перейдите в **Deployments**
4. Откройте последний деплой
5. Проверьте **Build Logs**

**Ищите ошибки:**
- ❌ `prisma: command not found` → `prisma` должен быть в `dependencies`
- ❌ `DATABASE_URL not found` → установите в Environment Variables
- ❌ `Module not found` → проверьте импорты
- ❌ `Build failed` → проверьте синтаксис кода

### 3. Проверьте Runtime Logs

1. В том же деплое откройте **Runtime Logs**
2. Попробуйте открыть сайт
3. Проверьте логи на ошибки

**Частые ошибки:**
- `Cannot find module` → проблема с импортами
- `Edge runtime does not support` → добавьте `export const runtime = "nodejs"`
- `Database connection error` → проверьте `DATABASE_URL`

## ✅ Что уже исправлено

1. ✅ Добавлен `export const runtime = "nodejs"` для всех API routes, использующих `validateInitData`
2. ✅ Улучшена обработка ошибок в Prisma Client
3. ✅ Создан health check endpoint: `/api/health`
4. ✅ Исправлена установка cookies в API routes

## 🔍 Что проверить в Vercel Dashboard

### Environment Variables

**Settings** → **Environment Variables** → проверьте:

- ✅ `BOT_TOKEN` - должен быть установлен
- ✅ `DATABASE_URL` - опционально (если не установлен, используется SQLite)

**Важно:** После добавления переменных → **Redeploy** (без кеша)

### Build Settings

**Settings** → **General** → **Build & Development Settings**:

- ✅ **Build Command:** `npm run vercel-build`
- ✅ **Install Command:** `npm install`
- ✅ **Output Directory:** `.next` (по умолчанию)

### Node.js Version

**Settings** → **General** → проверьте Node.js version:
- Должна быть **18.x** или **20.x**

## 🚀 Быстрое решение

Если ничего не помогает, попробуйте:

1. **Передеплойте без кеша:**
   - **Deployments** → **Redeploy**
   - Выберите **Use existing Build Cache** = ❌

2. **Проверьте локально:**
   ```bash
   npm run vercel-build
   ```
   Если локально работает, проблема в конфигурации Vercel.

3. **Проверьте health endpoint:**
   ```
   https://tg-bot-eta-gray.vercel.app/api/health
   ```

## 📋 Чек-лист

- [ ] Health check работает: `/api/health`
- [ ] Build успешен (проверьте Build Logs)
- [ ] Нет ошибок в Runtime Logs
- [ ] `BOT_TOKEN` установлен в Environment Variables
- [ ] `prisma` в `dependencies` (не в `devDependencies`)
- [ ] `vercel-build` скрипт настроен правильно

## 🆘 Если проблема сохраняется

1. **Скопируйте логи:**
   - Build Logs (последние 50 строк)
   - Runtime Logs (последние 50 строк)

2. **Проверьте health endpoint:**
   - Откройте `https://tg-bot-eta-gray.vercel.app/api/health`
   - Скопируйте ответ

3. **Пришлите:**
   - Логи сборки
   - Логи runtime
   - Ответ от `/api/health`
