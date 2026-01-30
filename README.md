# Школа Тхэквондо - Telegram WebApp

Telegram WebApp на Next.js 14 с серверной валидацией, RBAC и админ-панелью.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка базы данных

**Вариант A: Prisma (рекомендуется)**

1. Создайте PostgreSQL базу данных (Neon, Supabase, или локальная)

2. Создайте файл `.env.local` в корне проекта:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Telegram Bot
BOT_TOKEN="your_bot_token_from_botfather"

# Admin IDs (через запятую)
ADMIN_IDS=123456789,987654321
SUPERADMIN_IDS=987654321

# Node Environment
NODE_ENV=development
```

3. Примените миграции:

```bash
# Сгенерируйте Prisma Client
npx prisma generate

# Примените миграции
npx prisma migrate dev

# (Опционально) Запустите seed для создания админов
npx prisma db seed
```

**Вариант B: Drizzle**

1. Создайте `.env.local` (аналогично выше)

2. Примените миграции:

```bash
# Сгенерируйте миграции
npx drizzle-kit generate:pg

# Примените миграции
npx drizzle-kit migrate

# (Опционально) Запустите seed
tsx db/seed.ts
```

### 3. Получение Telegram Bot Token

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot` и следуйте инструкциям
3. Скопируйте токен бота
4. Добавьте в `.env.local` как `BOT_TOKEN`

### 4. Получение вашего Telegram ID

1. Откройте [@userinfobot](https://t.me/userinfobot) в Telegram
2. Скопируйте ваш Telegram ID
3. Добавьте в `.env.local` в `ADMIN_IDS` или `SUPERADMIN_IDS`

### 5. Запуск локально

```bash
# Development режим
npm run dev
```

Приложение будет доступно по адресу: `http://localhost:3000`

### 6. Проверка работы

1. Откройте `http://localhost:3000` в браузере
2. Вы увидите главную страницу
3. Для тестирования Telegram WebApp:
   - Настройте бота в BotFather (см. ниже)
   - Откройте бота в Telegram
   - Нажмите на Menu Button

---

## 📱 Настройка Telegram WebApp

### Для локальной разработки

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте `/mybots` → выберите вашего бота
3. **Bot Settings** → **Menu Button**
4. Установите URL: `https://your-tunnel-url.ngrok.io` (или другой tunnel)

**Или используйте Cloudflare Tunnel:**

```bash
# Установите cloudflared
# Затем запустите:
cloudflared tunnel --url http://localhost:3000
```

### Для Production

После деплоя на Vercel:

1. Получите production URL (например, `https://app.example.com`)
2. В BotFather установите этот URL как WebApp URL

---

## 🗄️ База данных

### Создание базы данных

**Neon (рекомендуется):**
1. Зарегистрируйтесь на [neon.tech](https://neon.tech)
2. Создайте новый проект
3. Скопируйте connection string
4. Добавьте в `.env.local` как `DATABASE_URL`

**Supabase:**
1. Зарегистрируйтесь на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Settings → Database → Connection string
4. Добавьте в `.env.local`

**Локальная PostgreSQL:**
```bash
# Установите PostgreSQL
# Создайте базу данных
createdb taekwondo_school

# Connection string:
DATABASE_URL="postgresql://postgres:password@localhost:5432/taekwondo_school"
```

### Миграции

**Prisma:**
```bash
# Создать новую миграцию
npx prisma migrate dev --name migration_name

# Применить миграции в production
npx prisma migrate deploy
```

**Drizzle:**
```bash
# Сгенерировать миграцию
npx drizzle-kit generate:pg

# Применить миграцию
npx drizzle-kit migrate
```

---

## 🌐 Деплой на Vercel

### Шаг 1: Подготовка

```bash
# Убедитесь, что проект собирается
npm run build
```

### Шаг 2: Создание проекта в Vercel

**Через Dashboard:**
1. Откройте [vercel.com](https://vercel.com)
2. **Add New** → **Project**
3. Импортируйте ваш Git репозиторий

**Через CLI:**
```bash
npm i -g vercel
vercel login
vercel
```

### Шаг 3: Environment Variables

В Vercel Dashboard → **Project** → **Settings** → **Environment Variables**:

Добавьте с scope **Production**:
```
BOT_TOKEN=your_production_bot_token
DATABASE_URL=postgresql://...
ADMIN_IDS=123456789
SUPERADMIN_IDS=987654321
NODE_ENV=production
```

### Шаг 4: Build Command

В Vercel Dashboard → **Project** → **Settings** → **General**:

**Build Command:**
```
prisma generate && prisma migrate deploy && next build
```

### Шаг 5: Деплой

Vercel автоматически задеплоит при push в main branch.

Или вручную:
```bash
vercel --prod
```

### Шаг 6: Custom Domain

1. **Project** → **Settings** → **Domains**
2. Добавьте ваш домен
3. Следуйте инструкциям для DNS

### Шаг 7: Настройка Telegram WebApp

В [@BotFather](https://t.me/BotFather):
```
/setmenubutton
@your_bot
https://your-domain.com
```

---

## 📚 Документация

- **Деплой на Vercel:** `docs/VERCEL_DEPLOYMENT.md`
- **База данных:** `docs/DATABASE.md` или `README.DATABASE.md`
- **Админ-панель:** `docs/ADMIN.md`
- **RBAC:** `docs/RBAC.md`
- **Валидация initData:** `docs/VALIDATION.md`
- **Preview Environments:** `docs/PREVIEW_ENVIRONMENTS.md`

---

## 🛠️ Полезные команды

```bash
# Development
npm run dev              # Запуск dev сервера
npm run build            # Сборка проекта
npm run start            # Запуск production build

# Database (Prisma)
npx prisma generate       # Генерация Prisma Client
npx prisma migrate dev    # Создание и применение миграции
npx prisma migrate deploy # Применение миграций (production)
npx prisma studio         # Открыть Prisma Studio

# Database (Drizzle)
npx drizzle-kit generate:pg  # Генерация миграций
npx drizzle-kit migrate     # Применение миграций
npx drizzle-kit studio      # Открыть Drizzle Studio

# Linting
npm run lint              # Проверка кода
```

---

## 🔐 Безопасность

### Важные правила:

1. **НЕ коммитьте `.env.local`** в Git
2. **НЕ используйте production BOT_TOKEN** локально
3. **НЕ используйте production DATABASE_URL** локально
4. **Production secrets** только в Vercel Environment Variables

### Проверка безопасности:

```bash
# Проверка environment variables
./scripts/check-env.sh

# Проверка production deployment
./scripts/check-production.sh https://your-domain.com
```

---

## 🐛 Troubleshooting

### Проблема: "BOT_TOKEN is not configured"

**Решение:**
- Проверьте, что `BOT_TOKEN` добавлен в `.env.local`
- Перезапустите dev сервер после добавления переменных

### Проблема: "DATABASE_URL is not set"

**Решение:**
- Проверьте, что `DATABASE_URL` добавлен в `.env.local`
- Убедитесь, что база данных доступна
- Проверьте connection string

### Проблема: Prisma Client не найден

**Решение:**
```bash
npx prisma generate
```

### Проблема: Миграции не применяются

**Решение:**
```bash
# Prisma
npx prisma migrate deploy

# Drizzle
npx drizzle-kit migrate
```

### Проблема: Telegram WebApp не открывается

**Решение:**
1. Проверьте, что URL настроен в BotFather
2. Убедитесь, что используется HTTPS (не localhost)
3. Для локальной разработки используйте tunnel (ngrok, cloudflared)

---

## 📖 Структура проекта

```
├── app/                    # Next.js App Router
│   ├── admin/             # Админ-панель
│   ├── api/               # API routes
│   └── ...
├── components/            # React компоненты
├── config/                # Конфигурация (RBAC)
├── hooks/                 # React hooks
├── lib/                   # Утилиты и helpers
├── prisma/                # Prisma schema и миграции
├── db/                    # Drizzle schema
├── types/                 # TypeScript типы
└── docs/                  # Документация
```

---

## ✅ Чеклист перед запуском

- [ ] Node.js 18+ установлен
- [ ] PostgreSQL база данных создана
- [ ] `.env.local` создан с правильными значениями
- [ ] `BOT_TOKEN` получен от BotFather
- [ ] Ваш Telegram ID добавлен в `ADMIN_IDS`
- [ ] Миграции применены (`prisma migrate deploy` или `drizzle-kit migrate`)
- [ ] Prisma Client сгенерирован (`prisma generate`)
- [ ] Зависимости установлены (`npm install`)

---

## 🎯 Следующие шаги

1. **Локальная разработка:**
   - Запустите `npm run dev`
   - Откройте `http://localhost:3000`
   - Настройте tunnel для Telegram WebApp

2. **Production деплой:**
   - Следуйте инструкциям в `docs/VERCEL_DEPLOYMENT.md`
   - Настройте Vercel проект
   - Добавьте environment variables
   - Задеплойте

3. **Настройка админки:**
   - См. `docs/ADMIN.md`
   - Убедитесь, что ваш ID в `ADMIN_IDS`
   - Откройте `/admin` в production

---

## 💡 Полезные ссылки

- [Next.js Documentation](https://nextjs.org/docs)
- [Telegram WebApp API](https://core.telegram.org/bots/webapps)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Drizzle Documentation](https://orm.drizzle.team)
- [Vercel Documentation](https://vercel.com/docs)

---

## 🆘 Поддержка

При возникновении проблем:
1. Проверьте документацию в папке `docs/`
2. Проверьте логи в консоли браузера
3. Проверьте логи сервера (Vercel Function Logs для production)
4. Убедитесь, что все environment variables настроены правильно
