# Исправление ошибки Prisma 7

## Проблема

При деплое на Vercel возникала ошибка:
```
Ошибка: Свойство `url` источника данных больше не поддерживается в файлах схемы.
Переместите URL-адреса подключения для Migrate в файл `prisma.config.ts`
```

## Причина

Prisma 7.x изменил способ работы с `DATABASE_URL`. Теперь требуется:
- Убрать `url` из `datasource` в `schema.prisma`
- Создать `prisma.config.ts` с конфигурацией
- Обновить `PrismaClient` для использования новой конфигурации

## Решение

Откат на Prisma 6.x для стабильности и совместимости.

### Изменения

**package.json:**
```json
{
  "dependencies": {
    "@prisma/client": "^6.0.0",
    "prisma": "^6.0.0"
  }
}
```

**Почему Prisma 6.x:**
- ✅ Стабильная версия
- ✅ Не требует изменений в коде
- ✅ Совместима с текущей конфигурацией
- ✅ Поддерживает `url` в `schema.prisma`

### После обновления

1. Удалите `node_modules` и `package-lock.json`:
   ```bash
   rm -rf node_modules package-lock.json
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Регенерируйте Prisma Client:
   ```bash
   npx prisma generate
   ```

4. Проверьте миграции:
   ```bash
   npx prisma migrate deploy
   ```

## Альтернативное решение (Prisma 7)

Если нужно использовать Prisma 7, нужно:

1. Создать `prisma.config.ts`:
   ```typescript
   import { defineConfig } from "prisma/config";

   export default defineConfig({
     datasource: {
       url: process.env.DATABASE_URL,
     },
   });
   ```

2. Убрать `url` из `schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     // url удален
   }
   ```

3. Обновить `PrismaClient`:
   ```typescript
   import { PrismaClient } from "@prisma/client";
   import config from "../prisma.config";

   export const db = new PrismaClient({
     datasourceUrl: config.datasource.url,
   });
   ```

**Но рекомендуется использовать Prisma 6.x для стабильности.**
