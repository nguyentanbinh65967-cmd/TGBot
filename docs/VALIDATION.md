# Серверная валидация initData Telegram WebApp

## Описание

Реализована серверная валидация `initData` согласно официальной документации Telegram.

**Важно**: Эта валидация должна использоваться на сервере для проверки подлинности данных от Telegram WebApp.

## Алгоритм проверки

1. Парсинг `initData` (query string)
2. Извлечение `hash`
3. Удаление `hash` из параметров
4. Сортировка параметров по ключу
5. Создание `data_check_string`: `key=value\nkey=value`
6. Создание `secret_key = HMAC_SHA256(botToken, "WebAppData")`
7. Создание `check_hash = HMAC_SHA256(data_check_string, secret_key)`
8. Сравнение `check_hash` с `hash` из initData

## Использование

### Базовое использование

```typescript
import { validateInitData } from "@/lib/auth";

try {
  const user = validateInitData(initDataString);
  console.log("Валидный пользователь:", user);
} catch (error) {
  console.error("Ошибка валидации:", error.message);
}
```

### В API Route

```typescript
// app/api/auth/check/route.ts
import { validateInitData } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { initData } = await request.json();
    const user = validateInitData(initData);
    
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}
```

### В Middleware

```typescript
// middleware.ts
import { validateInitData } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const initData = request.headers.get("x-telegram-init-data");
  
  if (initData) {
    try {
      const user = validateInitData(initData);
      // Пользователь валиден, продолжаем
    } catch (error) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  }
  
  return NextResponse.next();
}
```

## Настройка

### Переменные окружения

Добавьте в `.env.local`:

```env
BOT_TOKEN=your_bot_token_here
```

**Важно**: `BOT_TOKEN` должен быть секретным и не попадать в клиентский код.

## Обработка ошибок

Функция выбрасывает `Error` в следующих случаях:

- `"Invalid initData: empty string"` - пустая строка
- `"BOT_TOKEN is not configured"` - отсутствует BOT_TOKEN
- `"Invalid initData: hash is missing"` - отсутствует hash
- `"Invalid initData signature"` - подпись не совпадает
- `"Invalid initData: user data is missing"` - отсутствуют данные пользователя
- `"Invalid initData: user data is not valid JSON"` - невалидный JSON
- `"Invalid initData: user.id is missing or invalid"` - невалидный ID
- `"Invalid initData: user.first_name is missing or invalid"` - невалидное имя
- `"Invalid initData: auth_date is too old"` - данные старше 24 часов

## Безопасность

⚠️ **КРИТИЧЕСКИ ВАЖНО**:

1. Функция должна вызываться **только на сервере**
2. `BOT_TOKEN` никогда не должен попадать в клиентский код
3. Всегда проверяйте результат валидации перед использованием данных
4. Данные старше 24 часов автоматически отклоняются

## Пример получения initData на клиенте

```typescript
"use client";

import { useTelegram } from "@/hooks/useTelegram";

export default function MyComponent() {
  const { webApp } = useTelegram();
  
  const sendToServer = async () => {
    if (webApp?.initData) {
      const response = await fetch("/api/auth/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: webApp.initData }),
      });
      
      const result = await response.json();
      if (result.success) {
        console.log("Пользователь валиден:", result.user);
      }
    }
  };
  
  return <button onClick={sendToServer}>Проверить</button>;
}
```

## Тестирование

Для тестирования можно использовать реальный `initData` из Telegram WebApp:

```typescript
// В браузере (DevTools Console)
const initData = window.Telegram.WebApp.initData;
console.log(initData);
```

Затем используйте этот `initData` для тестирования серверной валидации.

## Документация Telegram

- [Validating data received via the Web App](https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app)
