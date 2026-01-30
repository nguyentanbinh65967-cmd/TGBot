# RBAC Middleware (Role-Based Access Control)

## Описание

Реализован RBAC middleware для защиты API routes и страниц на основе ролей пользователей Telegram WebApp.

## Роли

Система поддерживает 4 роли:

- **guest** - неавторизованный пользователь
- **user** - обычный пользователь
- **admin** - администратор
- **superadmin** - суперадминистратор

## Конфигурация

### Переменные окружения

Добавьте в `.env.local`:

```env
# Список ID администраторов (через запятую)
ADMIN_IDS=123456789,987654321

# Список ID суперадминистраторов (через запятую)
SUPERADMIN_IDS=987654321
```

### Файл конфигурации

Роли настраиваются в `config/rbac.ts`:

```typescript
export const SUPERADMIN_IDS: number[] = [987654321];
export const ADMIN_IDS: number[] = [123456789, 987654321];
```

## Защищенные роуты

### API Routes

- `/api/admin/*` - требует роль `admin` или `superadmin`

### Pages

- `/admin/*` - требует роль `admin` или `superadmin`

## Использование

### В API Routes

Middleware автоматически проверяет доступ. Информация о пользователе доступна через headers:

```typescript
// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Информация о пользователе из middleware
  const userId = request.headers.get("x-user-id");
  const userRole = request.headers.get("x-user-role");
  const username = request.headers.get("x-user-username");

  return NextResponse.json({
    message: "Access granted",
    user: {
      id: userId,
      role: userRole,
      username,
    },
  });
}
```

### Отправка initData с клиента

```typescript
"use client";

import { useTelegram } from "@/hooks/useTelegram";

export default function MyComponent() {
  const { webApp } = useTelegram();

  const callAdminAPI = async () => {
    if (!webApp?.initData) {
      console.error("initData not available");
      return;
    }

    const response = await fetch("/api/admin/users", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${webApp.initData}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Success:", data);
    } else {
      const error = await response.json();
      console.error("Error:", error);
    }
  };

  return <button onClick={callAdminAPI}>Call Admin API</button>;
}
```

### Отправка initData в POST запросах

```typescript
const response = await fetch("/api/admin/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    initData: webApp.initData,
    // другие данные
  }),
});
```

## Проверка ролей

### В коде

```typescript
import { getUserRole, hasAdminAccess, isSuperAdmin } from "@/config/rbac";
import { validateInitData } from "@/lib/auth";

// Валидируем initData
const user = validateInitData(initData);

// Получаем роль
const role = getUserRole(user);
// role === "admin" | "superadmin" | "user"

// Проверяем доступ
if (hasAdminAccess(user)) {
  // Пользователь админ или суперадмин
}

if (isSuperAdmin(user)) {
  // Пользователь суперадмин
}
```

## Обработка ошибок

### API Routes

При отказе в доступе API возвращает JSON:

```json
{
  "success": false,
  "error": "Forbidden: Access denied. Required role: admin or superadmin, your role: user"
}
```

Статус коды:
- `401` - неавторизован (нет initData или невалидный initData)
- `403` - доступ запрещен (недостаточно прав)

### Pages

При отказе в доступе происходит redirect на `/unauthorized` с параметром `from`:

```
/unauthorized?from=/admin/users
```

## Архитектура

### Текущая реализация (без БД)

Роли определяются на основе списков ID в `config/rbac.ts`:

```typescript
export function getUserRole(user: TelegramUser): Role {
  if (SUPERADMIN_IDS.includes(user.id)) return "superadmin";
  if (ADMIN_IDS.includes(user.id)) return "admin";
  return "user";
}
```

### Будущая реализация (с БД)

Функция `getUserRole` может быть легко заменена на запрос к БД:

```typescript
// config/rbac.ts (будущая версия)
export async function getUserRole(user: TelegramUser): Promise<Role> {
  const dbUser = await db.users.findByTelegramId(user.id);
  return dbUser?.role || "user";
}
```

Middleware автоматически поддержит async версию.

## Безопасность

✅ **Реализовано**:
- Серверная валидация initData
- Проверка ролей на сервере
- Нет хранения ролей на клиенте
- Нет использования window, localStorage
- Типобезопасность

❌ **Не используется**:
- Клиентская проверка ролей (только для UX)
- Хранение ролей в cookies/localStorage
- Доверие клиентским данным

## Примеры защищенных роутов

### API Route

```typescript
// app/api/admin/logs/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Middleware уже проверил доступ
  // Можно использовать информацию из headers
  const userId = request.headers.get("x-user-id");
  
  return NextResponse.json({
    logs: [],
    // ...
  });
}
```

### Page

```typescript
// app/admin/users/page.tsx
"use client";

// Middleware уже проверил доступ
// Если пользователь не админ, он будет перенаправлен на /unauthorized

export default function AdminUsersPage() {
  return <div>Users management</div>;
}
```

## Миграция на БД

При переходе на БД нужно:

1. Обновить `getUserRole` в `config/rbac.ts`:

```typescript
export async function getUserRole(user: TelegramUser): Promise<Role> {
  const dbUser = await db.users.findByTelegramId(user.id);
  return dbUser?.role || "user";
}
```

2. Обновить middleware для поддержки async:

```typescript
// middleware.ts
const role = await getUserRole(user);
```

3. Создать таблицу users с полем role:

```sql
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
UPDATE users SET role = 'admin' WHERE telegram_id IN (123456789, 987654321);
```

## Тестирование

### Проверка доступа

1. Откройте WebApp через Telegram
2. Получите initData: `window.Telegram.WebApp.initData`
3. Отправьте запрос с initData:

```bash
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YOUR_INIT_DATA"
```

### Проверка отказа в доступе

1. Используйте initData от пользователя без прав админа
2. Попробуйте получить доступ к `/api/admin/*` или `/admin/*`
3. Должен вернуться 401/403 или redirect на `/unauthorized`
