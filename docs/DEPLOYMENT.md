# Production Deployment Guide

## Обзор

Это руководство по развертыванию Telegram WebApp на production с использованием:
- **Cloudflare** для DNS и SSL
- **Vercel** или **Cloudflare Pages** для хостинга Next.js
- **Managed PostgreSQL** (Neon / Supabase / RDS)
- **Custom domain** (app.example.com)

---

## 1. Domain & DNS Setup (Cloudflare)

### Шаг 1: Добавить домен в Cloudflare

1. Войдите в Cloudflare Dashboard
2. Добавьте ваш домен (Add a Site)
3. Следуйте инструкциям для изменения nameservers

### Шаг 2: Настроить DNS записи

В Cloudflare DNS создайте запись для вашего приложения:

**Вариант A: Vercel (рекомендуется)**
```
Type: CNAME
Name: app (или @ для корневого домена)
Target: cname.vercel-dns.com
Proxy: ✅ Proxied (оранжевое облако)
TTL: Auto
```

**Вариант B: Cloudflare Pages**
```
Type: CNAME
Name: app
Target: your-project.pages.dev
Proxy: ✅ Proxied
TTL: Auto
```

**Вариант C: Собственный сервер**
```
Type: A
Name: app
IPv4: YOUR_SERVER_IP
Proxy: ✅ Proxied (рекомендуется)
TTL: Auto
```

### Шаг 3: Настроить SSL/TLS

1. Перейдите в **SSL/TLS** → **Overview**
2. Выберите режим: **Full (strict)**
   - Это обеспечивает шифрование между Cloudflare и вашим сервером
   - Требует валидный SSL сертификат на сервере

3. Включите **Always Use HTTPS**:
   - **SSL/TLS** → **Edge Certificates** → **Always Use HTTPS**: ON

4. Включите **Automatic HTTPS Rewrites**: ON

### Шаг 4: Настроить HSTS

1. **SSL/TLS** → **Edge Certificates**
2. Включите **HTTP Strict Transport Security (HSTS)**
3. Настройки:
   - Max Age: 31536000 (1 год)
   - Include Subdomains: ✅
   - Preload: ✅ (опционально)

---

## 2. Environment Variables (Production)

### Требуемые переменные окружения

Создайте файл `.env.production` (НЕ коммитьте в репозиторий):

```env
# Node Environment
NODE_ENV=production

# Telegram Bot Configuration
BOT_TOKEN=your_production_bot_token_here

# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Admin IDs (опционально, если не используется БД для ролей)
ADMIN_IDS=123456789,987654321
SUPERADMIN_IDS=987654321

# Next.js
NEXT_PUBLIC_APP_URL=https://app.example.com
```

### Правила безопасности

❌ **НЕ используйте NEXT_PUBLIC_* для секретов:**
- `BOT_TOKEN` - НЕ NEXT_PUBLIC
- `DATABASE_URL` - НЕ NEXT_PUBLIC
- `ADMIN_IDS` - можно NEXT_PUBLIC (не секрет)

✅ **Безопасные NEXT_PUBLIC_*:**
- `NEXT_PUBLIC_APP_URL` - публичный URL приложения
- `NEXT_PUBLIC_ADMIN_IDS` - список ID (не секрет)

### Настройка на платформе

**Vercel:**
1. Project → Settings → Environment Variables
2. Добавьте все переменные
3. Выберите Environment: Production
4. НЕ добавляйте в Preview/Development

**Cloudflare Pages:**
1. Pages → Your Project → Settings → Environment Variables
2. Добавьте переменные для Production

**Собственный сервер:**
- Используйте `.env.production` файл
- Или переменные окружения системы
- НЕ коммитьте `.env` файлы

---

## 3. Database Migrations (Production)

### Prisma

#### Первоначальная миграция

```bash
# 1. Установите зависимости
npm install

# 2. Сгенерируйте Prisma Client
npx prisma generate

# 3. Примените миграции
npx prisma migrate deploy

# 4. (Опционально) Запустите seed
npx prisma db seed
```

#### Автоматизация на Vercel

Создайте `vercel.json`:

```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build",
  "installCommand": "npm install"
}
```

Или используйте Build Command в настройках проекта:
```
prisma generate && prisma migrate deploy && next build
```

#### Автоматизация на Cloudflare Pages

Создайте `package.json` script:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

### Drizzle

#### Первоначальная миграция

```bash
# 1. Сгенерируйте миграции
npx drizzle-kit generate:pg

# 2. Примените миграции
npx drizzle-kit migrate

# 3. (Опционально) Запустите seed
npm run db:seed
```

#### Автоматизация

Добавьте в build command:
```
drizzle-kit migrate && next build
```

### Правила безопасности миграций

1. **Всегда делайте backup перед миграциями**
2. **Тестируйте миграции на staging**
3. **Не удаляйте таблицу logs** (immutable audit trail)
4. **Используйте транзакции** для критических изменений
5. **Проверяйте миграции** перед применением в production

---

## 4. Next.js Build & Runtime Configuration

### next.config.js

Обновите `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  output: 'standalone', // Для Docker или собственного сервера
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },
  
  // Disable directory listing
  poweredByHeader: false,
  
  // Production optimizations
  compress: true,
  reactStrictMode: true,
};

module.exports = nextConfig;
```

### Проверка Node Runtime

Убедитесь, что используется Node.js runtime (не Edge):

- `node:crypto` требует Node.js runtime
- В Vercel: по умолчанию используется Node.js
- В Cloudflare Pages: используйте Node.js 18+ runtime

---

## 5. Telegram WebApp Production Configuration

### Шаг 1: Настроить WebApp URL в BotFather

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/mybots`
3. Выберите вашего бота
4. Выберите **Bot Settings** → **Menu Button**
5. Установите URL: `https://app.example.com`

Или используйте команду:
```
/setmenubutton
@your_bot
https://app.example.com
```

### Шаг 2: Проверить настройки WebApp

В коде убедитесь, что используется правильный URL:

```typescript
// app/layout.tsx
<Script
  src="https://telegram.org/js/telegram-web-app.js"
  strategy="beforeInteractive"
/>
```

### Шаг 3: Валидация в production

Проверьте:
1. WebApp открывается через Telegram
2. `initData` приходит корректно
3. Валидация `initData` проходит успешно
4. `auth_date` проверка работает (24 часа)

### Шаг 4: Тестирование

1. Откройте бота в Telegram
2. Нажмите на Menu Button
3. Проверьте, что WebApp открывается
4. Проверьте авторизацию
5. Проверьте доступ к админке (если вы админ)

---

## 6. Security Hardening (Production)

### Cloudflare WAF Rules

1. Перейдите в **Security** → **WAF**
2. Создайте правила:

**Rate Limiting для API:**
```
Rule: Rate Limit API
Expression: (http.request.uri.path contains "/api/")
Action: Challenge
Rate: 100 requests per minute
```

**Rate Limiting для Admin:**
```
Rule: Rate Limit Admin
Expression: (http.request.uri.path contains "/admin/")
Action: Challenge
Rate: 50 requests per minute
```

### Cloudflare Firewall Rules

1. **Security** → **WAF** → **Custom Rules**

**Block Suspicious Requests:**
```
(http.request.uri.path contains "wp-admin") or
(http.request.uri.path contains ".env") or
(http.request.uri.path contains "phpmyadmin")
Action: Block
```

### Next.js Security Headers

Уже настроены в `next.config.js` (см. раздел 4).

### Disable Directory Listing

В `next.config.js`:
```javascript
poweredByHeader: false,
```

### Environment Variables Security

- ✅ Используйте секреты платформы
- ✅ НЕ коммитьте `.env` файлы
- ✅ Ротация токенов регулярно
- ✅ Минимальные права доступа

---

## 7. Deployment Checklist

### Pre-Deployment

- [ ] DNS записи настроены в Cloudflare
- [ ] SSL/TLS режим: Full (strict)
- [ ] Always Use HTTPS включен
- [ ] HSTS настроен
- [ ] Environment variables настроены
- [ ] Database создана и доступна
- [ ] DATABASE_URL настроен
- [ ] BOT_TOKEN настроен
- [ ] ADMIN_IDS настроены

### Database

- [ ] Backup базы данных создан
- [ ] Миграции протестированы на staging
- [ ] Prisma Client сгенерирован
- [ ] Миграции применены
- [ ] Seed выполнен (если нужно)

### Build & Deploy

- [ ] `next build` выполняется успешно
- [ ] Нет ошибок компиляции
- [ ] Все зависимости установлены
- [ ] Production build создан
- [ ] Деплой выполнен

### Post-Deployment

- [ ] Приложение доступно по HTTPS
- [ ] SSL сертификат валиден
- [ ] Telegram WebApp открывается
- [ ] `initData` валидируется корректно
- [ ] Авторизация работает
- [ ] RBAC middleware работает
- [ ] Админка доступна (для админов)
- [ ] Audit logs записываются
- [ ] Нет ошибок в консоли браузера
- [ ] Нет ошибок в логах сервера

### Security Verification

- [ ] WAF правила активны
- [ ] Rate limiting работает
- [ ] Security headers присутствуют
- [ ] HSTS включен
- [ ] Нет утечек секретов
- [ ] Directory listing отключен

---

## 8. Troubleshooting

### Проблема: WebApp не открывается

**Решение:**
1. Проверьте URL в BotFather
2. Убедитесь, что используется HTTPS
3. Проверьте, что домен доступен
4. Проверьте CORS настройки (если есть)

### Проблема: initData validation fails

**Решение:**
1. Проверьте `BOT_TOKEN` в environment variables
2. Убедитесь, что токен правильный
3. Проверьте, что используется `node:crypto` (не browser crypto)
4. Проверьте логи сервера для деталей ошибки

### Проблема: Database connection fails

**Решение:**
1. Проверьте `DATABASE_URL`
2. Убедитесь, что БД доступна из сети
3. Проверьте firewall правила
4. Проверьте SSL режим в connection string

### Проблема: RBAC не работает

**Решение:**
1. Проверьте, что middleware выполняется
2. Проверьте headers (`x-user-id`, `x-user-role`)
3. Проверьте, что `getUserRole()` работает с БД
4. Проверьте логи middleware

---

## 9. Monitoring & Maintenance

### Логирование

Настройте мониторинг:
- Application logs (Vercel / Cloudflare Pages)
- Database logs
- Error tracking (Sentry, LogRocket)

### Регулярные задачи

- [ ] Ротация `BOT_TOKEN` (если скомпрометирован)
- [ ] Обновление зависимостей
- [ ] Backup базы данных
- [ ] Проверка SSL сертификатов
- [ ] Мониторинг audit logs

---

## 10. Rollback Strategy

### Vercel

1. Перейдите в Deployments
2. Найдите предыдущий успешный деплой
3. Нажмите "..." → "Promote to Production"

### Cloudflare Pages

1. Перейдите в Deployments
2. Найдите предыдущий успешный деплой
3. Нажмите "..." → "Retry deployment"

### Database Rollback

⚠️ **Осторожно:** Откат миграций может быть опасным

1. Создайте backup перед откатом
2. Используйте `prisma migrate resolve --rolled-back <migration_name>`
3. Или восстановите из backup

---

## Готово к Production

После выполнения всех шагов ваше приложение готово к production использованию.

**Важные напоминания:**
- Всегда тестируйте на staging перед production
- Делайте backup перед миграциями
- Мониторьте логи и ошибки
- Регулярно обновляйте зависимости
- Следите за безопасностью
