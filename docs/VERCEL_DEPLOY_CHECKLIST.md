# Vercel Deploy Checklist

## ✅ Pre-Deployment Checks

### 1. Prisma CLI установлен

```bash
# Проверка
npm list prisma
# Должно показать: prisma@6.x.x в devDependencies

# Проверка работы
npx prisma generate
# Должно выполниться без ошибок
```

### 2. Package.json скрипты

**Проверьте, что скрипты правильные:**

```json
{
  "scripts": {
    "postinstall": "node scripts/run-with-env.js \"npx prisma generate\" || true",
    "vercel-build": "node scripts/setup-database.js && npm run build"
  }
}
```

### 3. Скрипты существуют

- ✅ `scripts/ensure-env.js` - устанавливает DATABASE_URL
- ✅ `scripts/run-with-env.js` - передает DATABASE_URL в Prisma CLI
- ✅ `scripts/setup-database.js` - полная настройка БД

### 4. Локальная проверка build

```bash
# Проверка vercel-build
npm run vercel-build

# Должно:
# 1. Установить DATABASE_URL (SQLite fallback)
# 2. Сгенерировать Prisma Client
# 3. Применить схему БД
# 4. Собрать Next.js
```

### 5. Environment Variables в Vercel

**Обязательные:**
- `BOT_TOKEN` (Production scope)
- `ADMIN_IDS` (Production scope)
- `SUPERADMIN_IDS` (Production scope)

**Опциональные:**
- `DATABASE_URL` (Production scope)
  - Если не установлен → используется SQLite (`file:/tmp/dev.db`)
  - Если установлен PostgreSQL → используется PostgreSQL

### 6. Git статус

```bash
# Проверка, что все закоммичено
git status
# Должно быть: "nothing to commit, working tree clean"

# Проверка последнего коммита
git log --oneline -1
```

---

## 🚀 Deployment Steps

### 1. Локальная проверка

```bash
# Убедитесь, что build работает
npm run vercel-build
```

### 2. Commit изменений (если есть)

```bash
git add package.json package-lock.json scripts/
git commit -m "Fix Prisma CLI path for Vercel deployment"
git push origin main
```

### 3. Deploy на Vercel

**Через Vercel Dashboard:**
1. Откройте [Vercel Dashboard](https://vercel.com)
2. Выберите проект
3. Нажмите **Deploy** или дождитесь автоматического деплоя

**Через Vercel CLI:**
```bash
# Production deploy
vercel --prod

# Или preview deploy
vercel
```

---

## 🔍 Post-Deployment Checks

### 1. Проверка логов деплоя

В Vercel Dashboard → Deployments → выберите deployment → Build Logs

**Должно быть видно:**
```
✅ Using SQLite: file:/tmp/dev.db
💾 Using SQLite database
🔧 Database Provider: sqlite
📝 DATABASE_URL: file:/tmp/dev.db
🔨 Generating Prisma Client...
✔ Generated Prisma Client
📊 Applying database schema...
✅ Database schema applied successfully
```

### 2. Проверка работы приложения

- Откройте деплой URL
- Проверьте, что приложение загружается
- Проверьте админ-панель (если есть доступ)

### 3. Проверка ошибок

В Vercel Dashboard → Deployments → Functions Logs

**Не должно быть:**
- ❌ "Environment variable not found: DATABASE_URL"
- ❌ "prisma: command not found"
- ❌ "Failed to generate Prisma Client"

---

## 🐛 Troubleshooting

### Ошибка: "prisma: command not found"

**Решение:**
- Убедитесь, что `prisma` в `devDependencies`
- Проверьте, что `npx prisma` используется в скриптах
- Скрипты должны использовать `node scripts/run-with-env.js "npx prisma ..."`

### Ошибка: "Environment variable not found: DATABASE_URL"

**Решение:**
- Скрипт `ensure-env.js` должен автоматически установить `DATABASE_URL`
- Проверьте, что скрипт выполняется в `vercel-build`
- В логах должно быть видно: `✅ Using SQLite: file:/tmp/dev.db`

### Ошибка: "Migration failed"

**Решение:**
- Для SQLite используется `db push` (не требует shadow database)
- Для PostgreSQL используется `migrate deploy`
- Скрипт `setup-database.js` автоматически выбирает правильный метод

---

## ✅ Success Criteria

После успешного деплоя:
- ✅ Build проходит без ошибок
- ✅ Prisma Client генерируется
- ✅ Схема БД применяется
- ✅ Приложение работает
- ✅ Нет ошибок в логах

---

**Версия:** 1.0.0  
**Последнее обновление:** 2024
