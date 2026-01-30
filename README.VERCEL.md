# Quick Start: Vercel Deployment

## Быстрый деплой на Vercel

### 1. Подготовка

```bash
# Убедитесь, что все зависимости установлены
npm install

# Проверьте, что проект собирается локально
npm run build
```

### 2. Создание проекта в Vercel

**Через CLI:**
```bash
npm i -g vercel
vercel login
vercel
```

**Через Dashboard:**
1. Откройте [vercel.com](https://vercel.com)
2. **Add New** → **Project**
3. Импортируйте Git репозиторий

### 3. Настройка Environment Variables

В Vercel Dashboard → **Project** → **Settings** → **Environment Variables**:

```
NODE_ENV=production
BOT_TOKEN=your_bot_token
DATABASE_URL=postgresql://...
ADMIN_IDS=123456789
SUPERADMIN_IDS=987654321
```

**Важно:** Выберите **Production** scope для секретов.

### 4. Настройка Build Command

В Vercel Dashboard → **Project** → **Settings** → **General**:

**Build Command:**
```
prisma generate && prisma migrate deploy && next build
```

Или используйте `vercel-build` script из `package.json`.

### 5. Деплой

Vercel автоматически задеплоит при push в main branch.

Или вручную:
```bash
vercel --prod
```

### 6. Настройка Custom Domain

1. **Project** → **Settings** → **Domains**
2. Добавьте ваш домен
3. Следуйте инструкциям для DNS

### 7. Настройка Telegram WebApp

В [@BotFather](https://t.me/BotFather):
```
/setmenubutton
@your_bot
https://your-domain.com
```

### 8. Проверка

- [ ] Приложение доступно по HTTPS
- [ ] Telegram WebApp открывается
- [ ] Авторизация работает
- [ ] Админка доступна

---

## Полная документация

См. `docs/VERCEL_DEPLOYMENT.md` для детальных инструкций.
