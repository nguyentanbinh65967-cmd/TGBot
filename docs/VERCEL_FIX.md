# Исправление ошибки деплоя на Vercel

## Проблема

При деплое на Vercel возникала ошибка:
```
sh: prisma: команда не найдена
```

## Причина

На Vercel CLI `prisma` может быть не доступен в PATH, даже если пакет `prisma` установлен в `node_modules`. Нужно использовать `npx prisma` для запуска CLI.

## Исправления

### 1. Обновлен `package.json`

**Было:**
```json
{
  "scripts": {
    "postinstall": "prisma generate || true",
    "migrate:deploy": "prisma migrate deploy",
    "migrate:generate": "prisma generate",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

**Стало:**
```json
{
  "scripts": {
    "postinstall": "npx prisma generate || true",
    "prisma:generate": "npx prisma generate",
    "prisma:migrate": "npx prisma migrate deploy",
    "migrate:deploy": "npx prisma migrate deploy",
    "migrate:generate": "npx prisma generate",
    "vercel-build": "npm run prisma:generate && npm run prisma:migrate && npm run build"
  }
}
```

**Изменения:**
- ✅ Все команды `prisma` заменены на `npx prisma`
- ✅ Добавлены отдельные скрипты `prisma:generate` и `prisma:migrate`
- ✅ `vercel-build` использует npm scripts вместо прямых вызовов

### 2. Обновлен `vercel.json`

**Было:**
```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build"
}
```

**Стало:**
```json
{
  "buildCommand": "npm run vercel-build"
}
```

**Изменения:**
- ✅ Используется npm script `vercel-build` вместо прямых команд
- ✅ Это гарантирует, что команды выполняются через npm/npx

### 3. Проверка зависимостей

**Проверено:**
- ✅ `prisma` находится в `dependencies` (не только в `devDependencies`)
- ✅ `@prisma/client` находится в `dependencies`
- ✅ Оба пакета установлены и доступны

### 4. Postinstall скрипт

**Обновлен:**
```json
"postinstall": "npx prisma generate || true"
```

**Зачем:**
- Выполняется автоматически после `npm install`
- Генерирует Prisma Client перед build
- `|| true` гарантирует, что ошибка не остановит установку (если БД недоступна)

## Результат

После этих изменений:

1. ✅ Prisma CLI доступен через `npx prisma`
2. ✅ Build команды используют правильные пути
3. ✅ Миграции выполняются корректно
4. ✅ Prisma Client генерируется автоматически

## Проверка

После деплоя проверьте:

1. **Build Logs в Vercel:**
   - Должны видеть: `Running "npm run vercel-build"`
   - Должны видеть: `npx prisma generate`
   - Должны видеть: `npx prisma migrate deploy`
   - Должны видеть: `next build`

2. **Приложение работает:**
   - Нет ошибок при запуске
   - Подключение к БД работает
   - API routes работают

## Альтернативные варианты

Если проблемы остаются, можно использовать:

### Вариант 1: Прямые команды в vercel.json
```json
{
  "buildCommand": "npx prisma generate && npx prisma migrate deploy && next build"
}
```

### Вариант 2: Через npm scripts
```json
{
  "buildCommand": "npm run vercel-build"
}
```

**Текущий вариант (рекомендуется):** Вариант 2, так как он использует npm scripts и более гибкий.

## Дополнительные проверки

### Если миграции не применяются:

1. Проверьте `DATABASE_URL` в Environment Variables
2. Убедитесь, что БД доступна из Vercel
3. Проверьте логи миграций в Vercel Build Logs

### Если Prisma Client не генерируется:

1. Проверьте, что `prisma` в `dependencies`
2. Проверьте, что `schema.prisma` существует
3. Проверьте логи `postinstall` скрипта

## Готово

После этих исправлений деплой на Vercel должен работать корректно.
