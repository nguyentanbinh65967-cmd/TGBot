# Preview Environments Policy

## Обзор

Эта политика определяет правила использования Preview Environments на Vercel для безопасного тестирования без влияния на production данные и безопасность.

**Три окружения:**
- **Production** — реальное приложение для пользователей
- **Preview** — автоматические деплои для каждого PR/branch
- **Local** — локальная разработка

---

## 🚨 Абсолютные правила (NON-NEGOTIABLE)

### Preview Environments НЕ ДОЛЖНЫ:

1. ❌ Использовать production database
2. ❌ Использовать production BOT_TOKEN
3. ❌ Записывать в production audit logs
4. ❌ Быть доступными для реальных Telegram пользователей
5. ❌ Использовать production secrets

### Preview Environments МОГУТ:

1. ✅ Использовать отдельную preview database
2. ✅ Использовать test/dummy BOT_TOKEN
3. ✅ Записывать в preview audit logs (disposable)
4. ✅ Использоваться для UI/UX тестирования
5. ✅ Использоваться для API тестирования (без Telegram auth)

---

## 1. Environment Separation Strategy

### Production Environment

**Назначение:** Реальное приложение для пользователей Telegram

**Конфигурация:**
- **DATABASE_URL:** Production PostgreSQL (Neon / Supabase / RDS)
- **BOT_TOKEN:** Реальный токен бота от BotFather
- **NODE_ENV:** `production`
- **Domain:** `https://app.example.com` (custom domain)
- **Telegram WebApp URL:** Настроен в BotFather на production domain

**Правила:**
- Только production secrets
- Только production database
- Все audit logs записываются в production
- Единственный домен, зарегистрированный в BotFather

### Preview Environment

**Назначение:** Автоматические деплои для каждого PR/branch для QA и code review

**Конфигурация:**
- **DATABASE_URL:** Preview database (отдельная БД или branch)
- **BOT_TOKEN:** Test/dummy токен (НЕ production)
- **NODE_ENV:** `production` (для production-like поведения)
- **Domain:** `https://your-project-git-branch-username.vercel.app` (автоматический)
- **Telegram WebApp URL:** НЕ настроен в BotFather

**Правила:**
- НЕ использует production secrets
- НЕ использует production database
- Audit logs disposable (можно удалить)
- НЕ доступен для реальных Telegram пользователей
- Используется только для UI/UX/API тестирования

### Local Development

**Назначение:** Локальная разработка

**Конфигурация:**
- **DATABASE_URL:** Local или development database
- **BOT_TOKEN:** Development/test токен
- **NODE_ENV:** `development`
- **Domain:** `http://localhost:3000`

**Правила:**
- Полная изоляция от production
- Можно использовать mock данные
- Можно использовать test токены

---

## 2. Vercel Environment Variables Policy

### Настройка в Vercel Dashboard

**Project** → **Settings** → **Environment Variables**

### Production Scope

Добавьте переменные с scope **Production**:

```
BOT_TOKEN=real_production_bot_token
DATABASE_URL=postgresql://prod_user:prod_pass@prod_host:5432/prod_db?sslmode=require
ADMIN_IDS=123456789,987654321
SUPERADMIN_IDS=987654321
NODE_ENV=production
```

**Важно:**
- ✅ Только Production scope
- ✅ НЕ добавляйте в Preview scope
- ✅ НЕ добавляйте в Development scope

### Preview Scope

Добавьте переменные с scope **Preview**:

```
BOT_TOKEN=test_bot_token_or_dummy_value
DATABASE_URL=postgresql://preview_user:preview_pass@preview_host:5432/preview_db?sslmode=require
ADMIN_IDS=999999999
SUPERADMIN_IDS=999999999
NODE_ENV=production
```

**Важно:**
- ✅ Отдельный preview database
- ✅ Test/dummy BOT_TOKEN (НЕ production)
- ✅ Preview scope только
- ✅ НЕ используйте production secrets

### Development Scope (опционально)

Для локальной разработки:

```
BOT_TOKEN=dev_test_token
DATABASE_URL=postgresql://localhost:5432/dev_db
NODE_ENV=development
```

### Правила безопасности

1. **Никогда не добавляйте production BOT_TOKEN в Preview scope**
2. **Никогда не добавляйте production DATABASE_URL в Preview scope**
3. **Используйте отдельные токены и БД для каждого окружения**
4. **Проверяйте scope перед добавлением переменных**

### Как проверить в Vercel UI

1. **Project** → **Settings** → **Environment Variables**
2. Для каждой переменной проверьте:
   - ✅ Production scope — только для production secrets
   - ✅ Preview scope — только для preview/test данных
   - ❌ НЕ должно быть production secrets в Preview scope

---

## 3. Telegram WebApp Preview Safety

### Критическое правило

**BotFather WebApp URL должен указывать ТОЛЬКО на production domain.**

### Настройка BotFather

1. Откройте [@BotFather](https://t.me/BotFather)
2. `/mybots` → выберите бота
3. **Bot Settings** → **Menu Button**
4. Установите URL: `https://app.example.com` (production domain)

**НЕ добавляйте:**
- ❌ Preview URLs (`*.vercel.app`)
- ❌ Localhost URLs
- ❌ Development URLs

### Почему это безопасно

1. **Telegram проверяет origin:**
   - Telegram WebApp SDK проверяет, что WebApp открыт с зарегистрированного домена
   - Preview URLs не зарегистрированы → `initData` будет невалидным

2. **Результат:**
   - Preview environments не могут использовать реальную Telegram авторизацию
   - Preview доступен только для UI/UX тестирования
   - Production остается единственным доверенным origin

### Что это означает для Preview

**Preview environments:**
- ✅ Можно тестировать UI/UX
- ✅ Можно тестировать API endpoints (без Telegram auth)
- ✅ Можно тестировать компоненты
- ❌ НЕ может использовать реальную Telegram авторизацию
- ❌ НЕ может валидировать реальный initData

**Для тестирования Telegram auth:**
- Используйте только Production environment
- Или используйте локальную разработку с test ботом

---

## 4. Application-Level Safety Guards

### Environment Detection

Приложение может безопасно определять окружение:

```typescript
// lib/env.ts (пример, если нужно)
export function isProduction() {
  return process.env.NODE_ENV === "production" && 
         process.env.VERCEL_ENV === "production";
}

export function isPreview() {
  return process.env.VERCEL_ENV === "preview";
}
```

### Runtime Assertions (опционально)

Можно добавить fail-fast проверки без изменения логики:

```typescript
// В начале validateInitData (опционально)
if (process.env.VERCEL_ENV === "preview" && process.env.BOT_TOKEN === process.env.PRODUCTION_BOT_TOKEN) {
  throw new Error("CRITICAL: Production BOT_TOKEN detected in preview environment");
}
```

**Важно:** Это опционально и не меняет существующую логику валидации.

### Logging Verbosity

Можно настроить уровень логирования:

```typescript
// В lib/logger.db.prisma.ts (опционально)
const isProduction = process.env.VERCEL_ENV === "production";

if (!isProduction) {
  console.log("[PREVIEW] Log action:", action); // Дополнительное логирование в preview
}
```

---

## 5. Database Policy for Preview

### Стратегия 1: Separate Database (рекомендуется)

**Каждый preview использует отдельную БД:**

- Production: `prod_db` на Neon/Supabase
- Preview: `preview_db` на том же или другом провайдере
- Local: `local_db` или `dev_db`

**Преимущества:**
- ✅ Полная изоляция
- ✅ Нет риска влияния на production
- ✅ Можно удалить preview БД без последствий

**Настройка:**
1. Создайте отдельную БД для preview
2. Используйте `DATABASE_URL` с Preview scope в Vercel
3. Примените миграции к preview БД

### Стратегия 2: Branch-based Database (Neon / Supabase)

**Использование branching для БД:**

**Neon:**
```bash
# Создать branch для preview
neon branches create preview-branch --parent main

# Получить connection string для branch
neon connection-string preview-branch
```

**Supabase:**
- Используйте Database Branching (если доступно)
- Или создайте отдельный проект для preview

**Преимущества:**
- ✅ Автоматическое создание branches
- ✅ Легко удалить branch
- ✅ Изоляция данных

### Стратегия 3: Schema Isolation (НЕ рекомендуется)

**Использование разных схем в одной БД:**

```sql
CREATE SCHEMA preview;
```

**Проблемы:**
- ⚠️ Риск ошибок (можно случайно использовать production schema)
- ⚠️ Сложнее управлять
- ⚠️ Менее безопасно

**Используйте только если:**
- Нет возможности создать отдельную БД
- Есть строгие процессы проверки

### Миграции в Preview

**Правила:**
- ✅ Миграции могут выполняться автоматически в preview
- ✅ Preview БД можно пересоздать без потери данных
- ✅ Деструктивные миграции безопасны в preview (но не в production)

**Build Command для Preview:**
```
prisma generate && prisma migrate deploy && next build
```

Это безопасно, так как миграции применяются к preview БД, а не к production.

---

## 6. CI / PR Workflow Integration

### Автоматические Preview Deployments

Vercel автоматически создает preview deployment для каждого:
- Pull Request
- Push в branch (если настроено)

### Кто может получить доступ

**Preview URLs:**
- ✅ Автоматически доступны создателю PR
- ✅ Доступны через Vercel Dashboard
- ✅ Могут быть закомментированы в PR (автоматически)

**Ограничения:**
- Preview URLs не индексируются поисковиками
- Preview URLs не публичны (только для команды)
- Preview URLs автоматически удаляются при закрытии PR

### Lifecycle Preview Environments

1. **Создание:**
   - При открытии PR → автоматический preview deployment
   - Использует Preview scope environment variables
   - Подключается к preview database

2. **Обновление:**
   - При каждом push в PR → автоматическое обновление preview
   - Миграции применяются автоматически (если в Build Command)

3. **Удаление:**
   - При закрытии/мердже PR → preview deployment удаляется
   - Preview database остается (можно удалить вручную)

### Secrets Injection

Vercel автоматически инжектирует:
- Environment variables с Preview scope → в preview deployments
- Environment variables с Production scope → только в production

**Проверка:**
1. Откройте preview deployment в Vercel
2. **Settings** → **Environment Variables**
3. Убедитесь, что используются Preview scope переменные

---

## 7. Documentation Requirements

### Policy Summary

**Preview Environments Policy:**

1. **Изоляция данных:**
   - Preview использует отдельную БД
   - Preview не использует production secrets
   - Preview logs disposable

2. **Telegram WebApp:**
   - Только production domain зарегистрирован в BotFather
   - Preview не может использовать реальную Telegram auth
   - Preview для UI/UX тестирования только

3. **Безопасность:**
   - Production secrets только в Production scope
   - Preview secrets только в Preview scope
   - Никогда не смешивать

### Developer Checklist

**Перед созданием PR:**

- [ ] Убедитесь, что изменения не затрагивают production логику
- [ ] Проверьте, что нет hardcoded production значений
- [ ] Убедитесь, что миграции безопасны для preview

**При работе с Preview:**

- [ ] Используйте preview deployment для UI/UX тестирования
- [ ] НЕ пытайтесь тестировать Telegram auth в preview
- [ ] НЕ используйте production данные в preview
- [ ] Проверьте, что используются Preview scope env vars

**Перед мерджем в Production:**

- [ ] Все тесты пройдены
- [ ] Code review завершен
- [ ] Preview deployment работает корректно
- [ ] Нет production secrets в коде
- [ ] Миграции протестированы на preview БД

### Testing Guidelines

**Что можно тестировать в Preview:**

- ✅ UI компоненты
- ✅ Layout и стили
- ✅ API endpoints (без Telegram auth)
- ✅ Формы и валидация
- ✅ Роутинг и навигация
- ✅ Error handling

**Что НЕЛЬЗЯ тестировать в Preview:**

- ❌ Telegram WebApp авторизация
- ❌ initData валидация с реальным токеном
- ❌ Production database операции
- ❌ Production audit logging

**Для тестирования Telegram auth:**

- Используйте Production environment (осторожно!)
- Или используйте локальную разработку с test ботом

---

## 8. Enforcement & Monitoring

### Как проверить соблюдение политики

1. **Vercel Environment Variables:**
   - Регулярно проверяйте, что production secrets не в Preview scope
   - Используйте Vercel CLI: `vercel env ls`

2. **Database Connections:**
   - Проверяйте, что preview deployments подключаются к preview БД
   - Мониторьте логи подключений

3. **Telegram WebApp:**
   - Убедитесь, что только production domain в BotFather
   - Регулярно проверяйте настройки бота

### Автоматические проверки (опционально)

Можно добавить в CI/CD:

```bash
# Проверка, что production BOT_TOKEN не используется в preview
if [ "$VERCEL_ENV" = "preview" ] && [ "$BOT_TOKEN" = "$PRODUCTION_BOT_TOKEN" ]; then
  echo "ERROR: Production BOT_TOKEN detected in preview!"
  exit 1
fi
```

---

## 9. Troubleshooting

### Проблема: Preview использует production БД

**Решение:**
1. Проверьте Environment Variables в Vercel
2. Убедитесь, что `DATABASE_URL` имеет Preview scope
3. Проверьте, что preview deployment использует Preview scope vars

### Проблема: Preview не может валидировать initData

**Это нормально!** Preview не должен валидировать реальный initData.

**Решение:**
- Используйте preview только для UI/UX тестирования
- Для тестирования Telegram auth используйте production или local

### Проблема: Preview deployment не создается

**Решение:**
1. Проверьте, что branch подключен к Vercel
2. Проверьте, что есть Preview scope env vars
3. Проверьте build logs в Vercel

---

## Готово к использованию

Эта политика обеспечивает безопасное использование Preview Environments без риска для production.

**Ключевые принципы:**
- Изоляция данных
- Разделение секретов
- Защита production
- Безопасное тестирование
