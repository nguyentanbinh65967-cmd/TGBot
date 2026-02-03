# Шаблон .env.local

Скопируйте это содержимое в файл `.env.local` в корне проекта.

```env
# ============================================
# Environment Variables для локальной разработки
# ============================================

# ============================================
# DATABASE
# ============================================
# Database connection string
# 
# PostgreSQL (production):
# - Neon: postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/db?sslmode=require
# - Supabase: postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres?sslmode=require
# - Локальная: postgresql://postgres:password@localhost:5432/taekwondo_school
#
# SQLite (fallback, автоматически включается если DATABASE_URL не установлен):
# - Локально: file:./dev.db
# - На Vercel: file:/tmp/dev.db (ephemeral - данные теряются между деплоями)
# - Или явно: DATABASE_URL="file:./dev.db"
#
# Если переменная не установлена, автоматически используется SQLite:
# - Локально: file:./dev.db
# - На Vercel: file:/tmp/dev.db
DATABASE_URL="file:./dev.db"
# Или для PostgreSQL:
# DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# ============================================
# TELEGRAM BOT
# ============================================
# Токен бота от @BotFather
# Получить: https://t.me/BotFather → /newbot
BOT_TOKEN="your_bot_token_here"

# DEV: разрешить вход в админку с десктопа (ТОЛЬКО ДЛЯ ЛОКАЛЬНОЙ РАЗРАБОТКИ)
# ВНИМАНИЕ: Никогда не включайте это в production окружении.
# DEV_DESKTOP_ADMIN управляет серверной мидлварью (/admin)
# NEXT_PUBLIC_DEV_DESKTOP_ADMIN управляет клиентской проверкой в админке
DEV_DESKTOP_ADMIN="false"
NEXT_PUBLIC_DEV_DESKTOP_ADMIN="false"

# ============================================
# ADMIN USERS
# ============================================
# Telegram ID администраторов (через запятую)
# Получить ваш ID: https://t.me/userinfobot
ADMIN_IDS=123456789,987654321

# Telegram ID суперадминистраторов (через запятую)
# Суперадмины имеют полный доступ, включая изменение ролей
SUPERADMIN_IDS=987654321

# ============================================
# NODE ENVIRONMENT
# ============================================
# development - для локальной разработки
# production - для production деплоя
NODE_ENV=development

# ============================================
# OPTIONAL: PUBLIC VARIABLES
# ============================================
# Эти переменные доступны на клиенте (NEXT_PUBLIC_*)
# ВАЖНО: НЕ добавляйте секреты в NEXT_PUBLIC_*

# URL приложения (для production)
# NEXT_PUBLIC_APP_URL=https://app.example.com

# Admin IDs для клиента (опционально, если нужно на клиенте)
# NEXT_PUBLIC_ADMIN_IDS=123456789,987654321
```

## Инструкция

1. Создайте файл `.env.local` в корне проекта
2. Скопируйте содержимое выше
3. Замените значения на реальные:
   - `DATABASE_URL` — connection string вашей БД
   - `BOT_TOKEN` — токен от @BotFather
   - `ADMIN_IDS` — ваш Telegram ID (получить: @userinfobot)
   - `SUPERADMIN_IDS` — ваш Telegram ID (если хотите быть суперадмином)

## Проверка

После создания `.env.local`:

```bash
# Проверьте, что файл существует
dir .env.local  # Windows
# или
ls -la .env.local  # Linux/Mac

# Запустите приложение
npm run dev
```

Если возникают ошибки "variable is not set", проверьте:
- ✅ Файл `.env.local` существует
- ✅ Файл в корне проекта (не в подпапке)
- ✅ Нет синтаксических ошибок
- ✅ Перезапустили dev сервер
