# Настройка Environment Variables

## Проверка .env.local

### Текущий статус

Файл `.env.local` не найден в проекте. Это нормально, так как он:
- ✅ В `.gitignore` (не попадает в Git)
- ✅ Создается локально каждым разработчиком
- ✅ Содержит секреты, которые не должны быть в репозитории

### Создание .env.local

1. **Скопируйте пример:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Или создайте вручную:**
   ```bash
   # Создайте файл .env.local в корне проекта
   touch .env.local
   ```

3. **Заполните переменные:**
   См. `.env.local.example` для примера

## Требуемые переменные

### Обязательные

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Telegram Bot
BOT_TOKEN="your_bot_token_from_botfather"

# Admin IDs (хотя бы один)
ADMIN_IDS=123456789
SUPERADMIN_IDS=987654321

# Node Environment
NODE_ENV=development
```

### Опциональные

```env
# Public App URL (для production)
NEXT_PUBLIC_APP_URL=https://app.example.com

# Public Admin IDs (если нужно на клиенте)
NEXT_PUBLIC_ADMIN_IDS=123456789,987654321
```

## Как получить значения

### 1. DATABASE_URL

**Neon (рекомендуется):**
1. Зарегистрируйтесь на [neon.tech](https://neon.tech)
2. Создайте новый проект
3. Скопируйте connection string
4. Добавьте `?sslmode=require` в конец

**Supabase:**
1. Зарегистрируйтесь на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Settings → Database → Connection string
4. Используйте connection pooling string

**Локальная PostgreSQL:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/taekwondo_school"
```

### 2. BOT_TOKEN

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Скопируйте токен бота
5. Добавьте в `.env.local`:
   ```env
   BOT_TOKEN="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
   ```

### 3. ADMIN_IDS и SUPERADMIN_IDS

1. Откройте [@userinfobot](https://t.me/userinfobot) в Telegram
2. Скопируйте ваш Telegram ID
3. Добавьте в `.env.local`:
   ```env
   ADMIN_IDS=123456789
   SUPERADMIN_IDS=123456789
   ```

**Важно:**
- `ADMIN_IDS` — список через запятую: `123456789,987654321`
- `SUPERADMIN_IDS` — список через запятую
- Суперадмины автоматически имеют права админов

## Проверка настроек

### 1. Проверьте, что файл существует

```bash
# Windows
dir .env.local

# Linux/Mac
ls -la .env.local
```

### 2. Проверьте содержимое (без секретов)

```bash
# Покажите только имена переменных
grep -E "^[A-Z_]+=" .env.local | cut -d= -f1
```

### 3. Проверьте, что переменные загружаются

```bash
# В Node.js (создайте test.js)
require('dotenv').config({ path: '.env.local' });
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
console.log('BOT_TOKEN:', process.env.BOT_TOKEN ? '✅ Set' : '❌ Missing');
```

### 4. Запустите приложение

```bash
npm run dev
```

Если переменные не загружаются, проверьте:
- ✅ Файл `.env.local` существует
- ✅ Файл в корне проекта (не в подпапке)
- ✅ Нет синтаксических ошибок (кавычки, пробелы)
- ✅ Перезапустили dev сервер после изменения

## Типичные ошибки

### Ошибка: "DATABASE_URL is not set"

**Решение:**
1. Проверьте, что `.env.local` существует
2. Проверьте, что `DATABASE_URL` указан правильно
3. Перезапустите dev сервер

### Ошибка: "BOT_TOKEN is not configured"

**Решение:**
1. Проверьте, что `BOT_TOKEN` указан в `.env.local`
2. Убедитесь, что токен правильный (без лишних пробелов)
3. Перезапустите dev сервер

### Ошибка: "Cannot connect to database"

**Решение:**
1. Проверьте `DATABASE_URL`
2. Убедитесь, что БД доступна
3. Проверьте firewall правила
4. Для облачных БД: убедитесь, что IP разрешен

## Безопасность

### ✅ Правильно

- `.env.local` в `.gitignore`
- Используйте `.env.local.example` как шаблон
- Не коммитьте `.env.local` в Git
- Используйте разные токены для dev/production

### ❌ Неправильно

- Коммитить `.env.local` в Git
- Использовать production токены локально
- Делиться `.env.local` через незащищенные каналы
- Хранить секреты в коде

## Для Production (Vercel)

В Vercel используйте Environment Variables:

1. **Project** → **Settings** → **Environment Variables**
2. Добавьте переменные с scope **Production**
3. НЕ добавляйте в Preview scope (используйте отдельные значения)

См. `docs/VERCEL_DEPLOYMENT.md` для деталей.

## Готово

После настройки `.env.local`:

1. ✅ Все переменные заполнены
2. ✅ Файл в корне проекта
3. ✅ Dev сервер перезапущен
4. ✅ Приложение запускается без ошибок
