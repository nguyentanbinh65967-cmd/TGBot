# Исправление ошибки "prisma: command not found" на Vercel

## Проблема

Vercel пытается выполнить команду `prisma generate && prisma migrate deploy && next build` напрямую, но `prisma` не найден в PATH.

**Ошибка:**
```
sh: line 1: prisma: command not found
Error: Command "prisma generate && prisma migrate deploy && next build" exited with 127
```

## Решение

### 1. Переместить `prisma` в `dependencies`

`prisma` должен быть в `dependencies`, а не в `devDependencies`, чтобы быть доступным на Vercel в production.

**package.json:**
```json
{
  "dependencies": {
    "@prisma/client": "^6.0.0",
    "prisma": "^6.0.0",
    ...
  }
}
```

### 2. Обновить Build Command в Vercel Dashboard

**Важно:** Vercel Dashboard может переопределять `vercel.json`. Нужно обновить Build Command вручную:

1. Откройте [Vercel Dashboard](https://vercel.com)
2. Выберите проект
3. Перейдите в **Settings** → **General** → **Build & Development Settings**
4. Установите **Build Command**: `npm run vercel-build`
5. Установите **Install Command**: `npm install`
6. Сохраните изменения

### 3. Проверить `vercel.json`

**vercel.json:**
```json
{
  "buildCommand": "npm run vercel-build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### 4. Проверить `package.json` скрипты

**package.json:**
```json
{
  "scripts": {
    "vercel-build": "node scripts/setup-database.js && npm run build",
    "postinstall": "node scripts/run-with-env.js \"npx prisma generate\" || true"
  }
}
```

## Проверка

После обновления настроек:

1. **Локально:**
   ```bash
   npm run vercel-build
   # Должно работать без ошибок
   ```

2. **На Vercel:**
   - Сделайте новый деплой
   - Проверьте Build Logs
   - Должно быть видно:
     ```
     ✅ Using SQLite: file:/tmp/dev.db
     🔨 Generating Prisma Client...
     ✔ Generated Prisma Client
     📊 Applying database schema...
     ✅ Database schema applied successfully
     ```

## Альтернативное решение (если Dashboard не помогает)

Если Vercel Dashboard все еще использует старый Build Command, можно явно указать его в `package.json`:

```json
{
  "scripts": {
    "build": "node scripts/setup-database.js && next build"
  }
}
```

И в `vercel.json`:
```json
{
  "buildCommand": "npm run build"
}
```

Но лучше использовать `vercel-build` скрипт для явности.

---

**Версия:** 1.0.0  
**Последнее обновление:** 2024
