# Vercel Production Deployment Guide

## Обзор

Это руководство по развертыванию Telegram WebApp на **Vercel** с production-grade конфигурацией.

**Архитектура:**
- **Hosting:** Vercel (Next.js 14 App Router)
- **Runtime:** Node.js (serverless functions)
- **Database:** Managed PostgreSQL (Neon / Supabase / RDS)
- **SSL:** Vercel-managed HTTPS
- **DNS:** Custom domain через Vercel

---

## 1. Vercel Project Setup

### Шаг 1: Создать проект в Vercel

**Через Vercel Dashboard:**

1. Войдите в [Vercel Dashboard](https://vercel.com)
2. Нажмите **Add New** → **Project**
3. Импортируйте ваш Git репозиторий (GitHub / GitLab / Bitbucket)
4. Настройки проекта:
   - **Framework Preset:** Next.js (автоопределяется)
   - **Root Directory:** `./` (или ваш корневой каталог)
   - **Build Command:** `npm run build` (или с миграциями, см. ниже)
   - **Output Directory:** `.next` (по умолчанию)
   - **Install Command:** `npm install`

**Через Vercel CLI:**

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите
vercel login

# Создайте проект
vercel

# Следуйте инструкциям:
# - Link to existing project? No
# - Project name: taekwondo-school
# - Directory: ./
```

### Шаг 2: Настроить Runtime

**Важно:** Убедитесь, что используется Node.js runtime (не Edge).

Vercel автоматически использует Node.js для:
- API Routes (`app/api/**/route.ts`)
- Server Components

**⚠️ ВАЖНО: Middleware и Node.js Runtime**

Next.js middleware по умолчанию использует Edge runtime, где нет `node:crypto`.
Если ваш middleware использует `validateInitData()` (который требует `node:crypto`),
убедитесь, что:

1. В `vercel.json` указан Node.js runtime для middleware (уже настроено)
2. Или валидация происходит в API routes / Server Components, а не в middleware

Текущая реализация middleware использует `validateInitData()`, поэтому требуется Node.js runtime.

**Проверка в коде:**

Убедитесь, что в файлах с `node:crypto` НЕТ:
```typescript
export const runtime = "edge"; // ❌ НЕ ДОЛЖНО БЫТЬ
```

Если нужно явно указать Node.js:
```typescript
export const runtime = "nodejs"; // ✅ Явное указание
```

**Файлы, которые должны использовать Node.js:**
- `lib/auth.ts` (validateInitData использует `node:crypto`)
- `middleware.ts` (если использует validateInitData)
- Все API routes, которые валидируют initData

---

## 2. Environment Variables (Production)

### Требуемые переменные окружения

В Vercel Dashboard → Project → Settings → Environment Variables добавьте:

**Production Environment:**

```env
NODE_ENV=production
BOT_TOKEN=your_production_bot_token_here
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
ADMIN_IDS=123456789,987654321
SUPERADMIN_IDS=987654321
```

**Опционально (если используется):**
```env
NEXT_PUBLIC_APP_URL=https://app.example.com
NEXT_PUBLIC_ADMIN_IDS=123456789,987654321
```

### Правила безопасности

✅ **Безопасно:**
- `BOT_TOKEN` - только Production scope
- `DATABASE_URL` - только Production scope
- `ADMIN_IDS` - можно Production + Preview (для тестирования)

❌ **НЕ используйте NEXT_PUBLIC_* для:**
- `BOT_TOKEN` - секрет, не должен быть в клиенте
- `DATABASE_URL` - секрет, не должен быть в клиенте

✅ **Можно NEXT_PUBLIC_*:**
- `NEXT_PUBLIC_APP_URL` - публичный URL
- `NEXT_PUBLIC_ADMIN_IDS` - не секрет (но лучше через БД)

### Настройка в Vercel

1. **Project** → **Settings** → **Environment Variables**
2. Добавьте каждую переменную:
   - **Key:** `BOT_TOKEN`
   - **Value:** ваш токен
   - **Environment:** выберите `Production` (и `Preview` если нужно)
3. Повторите для всех переменных

**Важно:**
- Production scope = только production deployments
- Preview scope = для preview deployments (тестирование)
- Development scope = для локальной разработки (vercel dev)

---

## 3. Next.js Runtime Configuration

### Проверка Runtime

Убедитесь, что все файлы с `node:crypto` используют Node.js:

**lib/auth.ts:**
```typescript
import { createHmac } from "node:crypto"; // ✅ Node.js только

// НЕТ export const runtime = "edge"
```

**middleware.ts:**
```typescript
// Если middleware использует validateInitData, убедитесь что нет Edge runtime
// Next.js middleware по умолчанию использует Edge, но мы не используем crypto там
// Вместо этого валидация происходит в API routes или Server Components
```

**API Routes:**
```typescript
// app/api/**/route.ts
// По умолчанию Node.js, но можно явно указать:
export const runtime = "nodejs"; // ✅ Явное указание
```

### next.config.js

Обновите `next.config.js` (уже обновлен в проекте):

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  output: "standalone", // Для Vercel не обязательно, но безопасно
  
  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
  
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  
  // Ensure Node.js runtime for Prisma
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
};

module.exports = nextConfig;
```

---

## 4. Database Migrations (Vercel Safe)

### Prisma

#### Вариант A: Миграции в Build Command (рекомендуется)

В Vercel Dashboard → Project → Settings → General → Build & Development Settings:

**Build Command:**
```bash
prisma generate && prisma migrate deploy && next build
```

Это гарантирует:
1. Prisma Client генерируется перед build
2. Миграции применяются один раз при деплое
3. Build выполняется с актуальной схемой

#### Вариант B: Отдельный шаг миграций

Если миграции должны выполняться отдельно:

1. Создайте отдельный Vercel deployment для миграций (опционально)
2. Или выполните вручную перед деплоем:
```bash
npx prisma migrate deploy
```

#### package.json Scripts

Добавьте в `package.json`:

```json
{
  "scripts": {
    "build": "next build",
    "postinstall": "prisma generate",
    "migrate:deploy": "prisma migrate deploy",
    "migrate:generate": "prisma generate"
  }
}
```

**Важно:**
- `prisma generate` должен выполняться на Vercel перед build
- `prisma migrate deploy` должен выполняться один раз, не на каждый запрос
- НЕ используйте `prisma migrate dev` в production

### Drizzle

#### Build Command для Drizzle:

```bash
drizzle-kit generate:pg && drizzle-kit migrate && next build
```

Или через package.json:

```json
{
  "scripts": {
    "build": "next build",
    "db:migrate": "drizzle-kit migrate",
    "db:generate": "drizzle-kit generate:pg",
    "vercel-build": "npm run db:migrate && npm run build"
  }
}
```

В Vercel используйте `vercel-build` как Build Command.

---

## 5. Build & Deploy Pipeline

### Автоматический деплой

Vercel автоматически:
1. **Detects** Next.js проект
2. **Installs** зависимости (`npm install`)
3. **Runs** Build Command
4. **Builds** Next.js приложение
5. **Deploys** на edge network

### Build Process

1. **Install:** `npm install`
2. **Generate Prisma Client:** `prisma generate` (если в Build Command)
3. **Run Migrations:** `prisma migrate deploy` (если в Build Command)
4. **Build:** `next build`
5. **Deploy:** автоматически на Vercel

### Build Output

Vercel создает:
- `.next/` - build output
- Serverless functions для API routes
- Static assets для статических страниц

### Postinstall Scripts

Если используете `postinstall` в `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

Это выполнится автоматически после `npm install`.

---

## 6. Telegram WebApp Production Setup

### Шаг 1: Получить Production URL

После деплоя на Vercel:

1. Перейдите в **Project** → **Settings** → **Domains**
2. Добавьте ваш кастомный домен (например, `app.example.com`)
3. Следуйте инструкциям для настройки DNS
4. Дождитесь активации SSL (обычно несколько минут)

**Production URL будет:**
- `https://your-project.vercel.app` (Vercel domain)
- Или `https://app.example.com` (custom domain)

### Шаг 2: Настроить BotFather

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте `/mybots`
3. Выберите вашего бота
4. Выберите **Bot Settings** → **Menu Button**
5. Установите URL: `https://app.example.com` (или ваш Vercel domain)

**Команда:**
```
/setmenubutton
@your_bot
https://app.example.com
```

### Шаг 3: Проверить настройки

В коде убедитесь, что используется правильный URL:

```typescript
// app/layout.tsx
<Script
  src="https://telegram.org/js/telegram-web-app.js"
  strategy="beforeInteractive"
/>
```

### Шаг 4: Валидация

Проверьте в production:
1. WebApp открывается через Telegram
2. `initData` приходит корректно
3. Валидация `initData` проходит (проверьте логи Vercel)
4. `auth_date` проверка работает (24 часа)

---

## 7. Security Hardening (Vercel)

### HTTPS Enforcement

Vercel автоматически:
- ✅ Выдает SSL сертификаты (Let's Encrypt)
- ✅ Принудительно использует HTTPS
- ✅ Поддерживает HSTS

### Security Headers

Уже настроены в `next.config.js`:
- `Strict-Transport-Security`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `X-XSS-Protection`

### Environment Variables Security

✅ **Проверьте:**
- Секреты только в Production scope
- Нет секретов в `NEXT_PUBLIC_*`
- Нет секретов в Git репозитории

### Middleware Protection

Убедитесь, что middleware защищает:
- `/admin/*` - требует admin/superadmin
- `/api/admin/*` - требует admin/superadmin

Проверьте логи Vercel для ошибок middleware.

### Rate Limiting

Vercel автоматически ограничивает:
- Serverless function execution time
- Request rate per IP

Для дополнительного rate limiting используйте Vercel Edge Config или внешний сервис.

---

## 8. Deployment Checklist

### Pre-Deployment

- [ ] Vercel проект создан
- [ ] Git репозиторий подключен
- [ ] Environment variables настроены (Production scope)
- [ ] `BOT_TOKEN` добавлен
- [ ] `DATABASE_URL` добавлен
- [ ] `ADMIN_IDS` добавлены (если используются)
- [ ] Database создана и доступна
- [ ] Database migrations протестированы локально

### Build Configuration

- [ ] Build Command включает `prisma generate` (или `drizzle-kit generate`)
- [ ] Build Command включает миграции (или миграции выполнены отдельно)
- [ ] `next.config.js` настроен правильно
- [ ] Node.js runtime подтвержден (нет Edge runtime для crypto)

### Database

- [ ] Backup базы данных создан
- [ ] Миграции применены (или в Build Command)
- [ ] Prisma Client сгенерирован
- [ ] Seed выполнен (если нужно)

### Deploy

- [ ] Первый деплой выполнен
- [ ] Build успешен (проверьте Vercel Dashboard → Deployments)
- [ ] Нет ошибок в build logs
- [ ] Приложение доступно по HTTPS

### Post-Deployment

- [ ] Custom domain настроен (если используется)
- [ ] SSL сертификат активен
- [ ] Telegram WebApp URL настроен в BotFather
- [ ] WebApp открывается через Telegram
- [ ] `initData` валидируется корректно
- [ ] Авторизация работает
- [ ] RBAC middleware работает
- [ ] Админка доступна (для админов)
- [ ] Audit logs записываются
- [ ] Нет ошибок в Vercel Function Logs

### Security Verification

- [ ] HTTPS принудительно включен
- [ ] Security headers присутствуют (проверьте через curl)
- [ ] Нет утечек секретов в клиентском коде
- [ ] Middleware защищает админ-роуты
- [ ] Нет debug логов в production

---

## 9. Troubleshooting

### Проблема: Build fails с Prisma

**Решение:**
1. Убедитесь, что `prisma generate` в Build Command
2. Проверьте, что `DATABASE_URL` доступен на этапе build
3. Проверьте логи в Vercel Dashboard

### Проблема: initData validation fails

**Решение:**
1. Проверьте `BOT_TOKEN` в Environment Variables
2. Убедитесь, что используется Node.js runtime (не Edge)
3. Проверьте Vercel Function Logs для ошибок
4. Убедитесь, что `node:crypto` доступен

### Проблема: Database connection fails

**Решение:**
1. Проверьте `DATABASE_URL` в Environment Variables
2. Убедитесь, что БД доступна из интернета
3. Проверьте firewall правила БД
4. Проверьте SSL режим в connection string (`?sslmode=require`)

### Проблема: Middleware не работает

**Решение:**
1. Проверьте, что middleware.ts в корне проекта
2. Проверьте логи Vercel для ошибок middleware
3. Убедитесь, что `validateInitData` использует Node.js runtime
4. Проверьте headers в запросах

---

## 10. Monitoring & Maintenance

### Vercel Analytics

Включите Vercel Analytics для мониторинга:
1. **Project** → **Analytics**
2. Включите Web Analytics (опционально)

### Function Logs

Мониторьте логи:
1. **Project** → **Deployments** → выберите deployment
2. **Functions** → выберите функцию
3. Просмотрите Runtime Logs

### Error Tracking

Настройте внешний error tracking (опционально):
- Sentry
- LogRocket
- Vercel Log Drain

### Регулярные задачи

- [ ] Мониторинг Function Logs
- [ ] Проверка ошибок в production
- [ ] Обновление зависимостей
- [ ] Backup базы данных
- [ ] Ротация `BOT_TOKEN` (если нужно)

---

## 11. Rollback Strategy

### Vercel Rollback

1. Перейдите в **Project** → **Deployments**
2. Найдите предыдущий успешный deployment
3. Нажмите **"..."** → **"Promote to Production"**

Это мгновенно откатит приложение к предыдущей версии.

### Database Rollback

⚠️ **Осторожно:** Откат миграций может быть опасным

1. Создайте backup перед откатом
2. Используйте `prisma migrate resolve --rolled-back <migration_name>`
3. Или восстановите из backup

---

## Preview Environments

⚠️ **ВАЖНО:** Настройте Preview Environments согласно политике в `docs/PREVIEW_ENVIRONMENTS.md`.

**Кратко:**
- Preview использует отдельную БД (НЕ production)
- Preview использует test BOT_TOKEN (НЕ production)
- BotFather WebApp URL указывает ТОЛЬКО на production domain
- Preview не может использовать реальную Telegram авторизацию

См. `docs/PREVIEW_ENVIRONMENTS.md` для полной политики.

---

## Готово к Production

После выполнения всех шагов ваше приложение готово к production использованию на Vercel.

**Важные напоминания:**
- Всегда тестируйте на Preview deployments перед Production
- Мониторьте Function Logs после деплоя
- Проверяйте Telegram WebApp в production
- Регулярно обновляйте зависимости
- Следите за безопасностью
