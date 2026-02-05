# 🚀 Деплой на Vercel - Полная инструкция

## 📋 Подготовка проекта

### 1. Проверка файлов

Убедитесь, что все необходимые файлы присутствуют:
- ✅ `package.json` - с правильными скриптами
- ✅ `vercel.json` - конфигурация Vercel
- ✅ `next.config.js` - конфигурация Next.js
- ✅ `prisma/schema.prisma` - схема базы данных
- ✅ `scripts/setup-database.js` - скрипт настройки БД
- ✅ `scripts/ensure-env.js` - скрипт установки DATABASE_URL
- ✅ `scripts/run-with-env.js` - скрипт запуска с env

### 2. Проверка .gitignore

Убедитесь, что `.gitignore` содержит:
```
.env*.local
.env
*.db
*.db-journal
dev.db
node_modules
.next
```

## 🔧 Настройка на Vercel

### Шаг 1: Подключение репозитория

1. Зайдите на [vercel.com](https://vercel.com)
2. Нажмите **"Add New Project"**
3. Подключите ваш Git репозиторий (GitHub, GitLab, Bitbucket)
4. Выберите проект

### Шаг 2: Настройка проекта

Vercel автоматически определит Next.js проект. Проверьте настройки:

- **Framework Preset:** Next.js
- **Root Directory:** `./` (корень проекта)
- **Build Command:** `npm run vercel-build` (уже настроено в `vercel.json`)
- **Output Directory:** `.next` (по умолчанию для Next.js)
- **Install Command:** `npm install` (по умолчанию)

### Шаг 3: Environment Variables

Перейдите в **Settings → Environment Variables** и добавьте:

#### Обязательные переменные:

```env
# Telegram Bot Token (обязательно)
BOT_TOKEN=your_bot_token_from_botfather

# Database (выберите один вариант)
# Вариант 1: PostgreSQL (рекомендуется для production)
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Вариант 2: SQLite (для тестирования, данные теряются между деплоями)
# Не устанавливайте DATABASE_URL - будет использован SQLite в /tmp/dev.db
```

#### Опциональные переменные:

```env
# Admin IDs (если не используется БД для ролей)
ADMIN_IDS=123456789,987654321
SUPERADMIN_IDS=987654321

# Node Environment (автоматически устанавливается Vercel)
NODE_ENV=production
```

#### Настройка Environment Variables:

1. Для каждой переменной выберите **Environment:**
   - ✅ **Production** - для production деплоя
   - ✅ **Preview** - для preview деплоев (pull requests)
   - ❌ **Development** - не нужно (используется локально)

2. **ВАЖНО:** Не добавляйте `DATABASE_URL` если хотите использовать SQLite fallback

### Шаг 4: Настройка базы данных

#### Вариант A: PostgreSQL (рекомендуется)

1. **Создайте PostgreSQL базу данных:**
   - [Neon](https://neon.tech) - бесплатный tier
   - [Supabase](https://supabase.com) - бесплатный tier
   - Или любой другой managed PostgreSQL

2. **Получите connection string:**
   ```
   postgresql://user:password@host:5432/database?sslmode=require
   ```

3. **Добавьте в Vercel Environment Variables:**
   - Key: `DATABASE_URL`
   - Value: ваш connection string
   - Environment: Production, Preview

#### Вариант B: SQLite (для тестирования)

1. **Не устанавливайте `DATABASE_URL`** в Vercel
2. База данных будет автоматически создана в `/tmp/dev.db`
3. ⚠️ **Внимание:** Данные в `/tmp` теряются между деплоями
4. Для production используйте PostgreSQL

### Шаг 5: Деплой

1. Нажмите **"Deploy"**
2. Дождитесь завершения build
3. Проверьте логи build на наличие ошибок

## 🔍 Проверка деплоя

### Проверка build логов

После деплоя проверьте логи:

1. Перейдите в **Deployments**
2. Откройте последний деплой
3. Проверьте **Build Logs**

**Ожидаемые сообщения:**
```
✅ Using SQLite: file:/tmp/dev.db
🔨 Generating Prisma Client...
✅ Prisma Client generated successfully
📊 Applying database schema...
✅ Database schema applied successfully
```

### Проверка работы приложения

1. Откройте URL деплоя
2. Проверьте главную страницу
3. Проверьте админ-панель: `/admin/login`
   - Логин: `Admin`
   - Пароль: `Thekvando900`

## 🐛 Решение проблем

### Ошибка: "Unable to open the database file"

**Причина:** База данных не создана во время build

**Решение:**
1. Проверьте, что `scripts/setup-database.js` выполняется
2. Проверьте логи build - должна быть строка "Database schema applied successfully"
3. Убедитесь, что `scripts/` не в `.vercelignore`

### Ошибка: "BOT_TOKEN is not configured"

**Причина:** `BOT_TOKEN` не установлен в Environment Variables

**Решение:**
1. Перейдите в Settings → Environment Variables
2. Добавьте `BOT_TOKEN` с вашим токеном от @BotFather
3. Передеплойте проект

### Ошибка: "Prisma Client not generated"

**Причина:** Prisma Client не сгенерирован

**Решение:**
1. Проверьте, что `postinstall` скрипт выполняется
2. Проверьте логи build
3. Убедитесь, что `prisma` в `dependencies`, а не в `devDependencies`

### Ошибка: "Module not found: scripts/setup-database.js"

**Причина:** Скрипты не задеплоены на Vercel

**Решение:**
1. Проверьте `.vercelignore` - `scripts/` не должен быть там
2. Убедитесь, что файлы закоммичены в Git

## 📝 Чек-лист перед деплоем

- [ ] Все изменения закоммичены в Git
- [ ] `BOT_TOKEN` добавлен в Vercel Environment Variables
- [ ] `DATABASE_URL` добавлен (если используется PostgreSQL)
- [ ] `vercel.json` настроен правильно
- [ ] `package.json` содержит правильные скрипты
- [ ] `.vercelignore` не исключает `scripts/`
- [ ] Prisma схема актуальна
- [ ] Локально все работает (`npm run build` успешен)

## 🔄 Обновление после изменений

После изменений в коде:

1. Закоммитьте изменения в Git
2. Запушьте в репозиторий
3. Vercel автоматически задеплоит новую версию

После изменений в Prisma схеме:

1. Обновите `prisma/schema.prisma`
2. Закоммитьте изменения
3. Запушьте в репозиторий
4. Vercel автоматически применит изменения через `vercel-build`

## 📚 Дополнительные ресурсы

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

## 🆘 Поддержка

Если возникли проблемы:

1. Проверьте логи build в Vercel
2. Проверьте логи runtime в Vercel
3. Убедитесь, что все Environment Variables установлены
4. Проверьте, что база данных доступна (для PostgreSQL)
