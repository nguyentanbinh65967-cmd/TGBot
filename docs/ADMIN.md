# Админ-панель Telegram WebApp

## Настройка

### 1. Переменные окружения

Создайте файл `.env.local` в корне проекта:

```env
# Список Telegram ID администраторов через запятую
NEXT_PUBLIC_ADMIN_IDS=123456789,987654321

# Токен бота (для будущей валидации initData на сервере)
BOT_TOKEN=your_bot_token_here
```

### 2. Получение Telegram ID

Чтобы узнать свой Telegram ID:
1. Откройте бота [@userinfobot](https://t.me/userinfobot)
2. Скопируйте ваш ID
3. Добавьте его в `NEXT_PUBLIC_ADMIN_IDS`

## Структура

```
/app/admin/
├── layout.tsx      # Общий layout с навигацией
├── page.tsx        # Dashboard
├── users/          # Управление пользователями
├── settings/       # Настройки
└── logs/           # Логи действий
```

## Безопасность

⚠️ **ВАЖНО**: Текущая реализация использует клиентскую проверку для UX.

Для продакшена необходимо:
1. Реализовать серверную валидацию `initData` через `validateInitData()` в `lib/auth.ts`
2. Создать API роуты для проверки доступа
3. Хранить список админов в БД, а не в env

## Подготовка к БД

### Схема таблиц

```sql
-- Пользователи
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  username VARCHAR(255),
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Логи действий администраторов
CREATE TABLE admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id BIGINT NOT NULL,
  admin_name VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_timestamp ON admin_logs(timestamp DESC);
```

## Использование

### Проверка доступа в компонентах

```tsx
"use client";

import { useTelegram } from "@/hooks/useTelegram";
import { checkAuth } from "@/lib/auth";

export default function MyComponent() {
  const { user, isReady } = useTelegram();
  const authResult = checkAuth(user);

  if (!authResult.isAdmin) {
    return <div>Доступ запрещён</div>;
  }

  return <div>Админ контент</div>;
}
```

### Логирование действий

```tsx
import { logAdminAction } from "@/lib/logger";

await logAdminAction({
  adminId: user.id,
  adminName: user.first_name,
  action: "user.created",
  details: { userId: newUser.id },
});
```

## Telegram Theme Colors

Админка автоматически использует цвета из Telegram WebApp:
- `bg_color` - фон
- `text_color` - текст
- `button_color` - кнопки
- `secondary_bg_color` - вторичный фон

Поддержка dark/light режима включена.
