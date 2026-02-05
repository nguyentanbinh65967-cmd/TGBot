# ⚡ Быстрый старт - Деплой на Vercel

## 🎯 Минимальные шаги для деплоя

### 1. Подготовка репозитория

```bash
# Убедитесь, что все закоммичено
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

### 2. Создание проекта на Vercel

1. Зайдите на [vercel.com](https://vercel.com)
2. **Add New Project** → выберите репозиторий
3. Нажмите **Deploy** (пока без переменных окружения)

### 3. Настройка Environment Variables

После первого деплоя перейдите в **Settings → Environment Variables**:

#### Обязательно:
```
BOT_TOKEN=your_bot_token_here
```

#### Опционально (для PostgreSQL):
```
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

**Если `DATABASE_URL` не установлен** → автоматически используется SQLite в `/tmp/dev.db`

### 4. Передеплой

После добавления переменных:
1. Перейдите в **Deployments**
2. Нажмите **Redeploy** на последнем деплое
3. Выберите **Use existing Build Cache** = ❌ (чтобы пересобрать)

### 5. Проверка

- ✅ Главная страница: `https://your-app.vercel.app`
- ✅ Админ-панель: `https://your-app.vercel.app/admin/login`
  - Логин: `Admin`
  - Пароль: `Thekvando900`

## 🔍 Проверка логов

**Build должен показать:**
```
✅ Using SQLite: file:/tmp/dev.db
✅ Prisma Client generated successfully
✅ Database schema applied successfully
```

## ⚠️ Важные моменты

1. **SQLite на Vercel** - данные теряются между деплоями (используйте PostgreSQL для production)
2. **BOT_TOKEN обязателен** - без него не будет работать Telegram авторизация
3. **Передеплой после изменения env** - обязательно после добавления переменных

## 📚 Полная инструкция

См. [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) для детальной информации.
