# Настройка Telegram бота для WebApp

## 📋 Пошаговая инструкция

### Шаг 1: Создать бота через BotFather

1. **Откройте Telegram** и найдите [@BotFather](https://t.me/BotFather)
2. **Отправьте команду:** `/start` или `/newbot`
3. **Следуйте инструкциям:**
   - Введите имя бота (например: "Школа Тхэквондо")
   - Введите username бота (должен заканчиваться на `bot`, например: `taekwondo_school_bot`)

4. **BotFather выдаст токен:**
   ```
   Use this token to access the HTTP API:
   1234567890:ABCdefGHIjklMNOpqrsTUVwxyz-1234567890
   ```

5. **Сохраните токен** — он понадобится для настройки проекта

---

### Шаг 2: Получить ваш Telegram ID

1. **Откройте** [@userinfobot](https://t.me/userinfobot) в Telegram
2. **Отправьте** `/start`
3. **Скопируйте ваш ID** (например: `123456789`)

---

### Шаг 3: Настроить переменные окружения

1. **Создайте файл `.env.local`** в корне проекта (если его еще нет)

2. **Добавьте токен бота:**
   ```env
   BOT_TOKEN="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz-1234567890"
   ```

3. **Добавьте ваш Telegram ID:**
   ```env
   ADMIN_IDS=123456789
   SUPERADMIN_IDS=123456789
   ```

4. **Добавьте DATABASE_URL** (или оставьте пустым для SQLite):
   ```env
   DATABASE_URL="file:./dev.db"
   # Или для PostgreSQL:
   # DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
   ```

---

### Шаг 4: Настроить WebApp URL в BotFather

#### Для локальной разработки (с туннелем)

1. **Установите туннель** (например, Cloudflare Tunnel):
   ```bash
   # Установите cloudflared
   # Затем запустите:
   cloudflared tunnel --url http://localhost:3000
   ```

2. **Скопируйте URL** (например: `https://xxxxx.trycloudflare.com`)

3. **В BotFather:**
   - Отправьте `/mybots`
   - Выберите вашего бота
   - Выберите **Bot Settings** → **Menu Button**
   - Отправьте команду:
     ```
     /setmenubutton
     @your_bot_username
     https://xxxxx.trycloudflare.com
     ```

#### Для Production (после деплоя на Vercel)

1. **Получите production URL:**
   - После деплоя на Vercel получите URL (например: `https://your-project.vercel.app`)
   - Или настройте кастомный домен (например: `https://app.example.com`)

2. **В BotFather:**
   - Отправьте `/mybots`
   - Выберите вашего бота
   - Выберите **Bot Settings** → **Menu Button**
   - Отправьте команду:
     ```
     /setmenubutton
     @your_bot_username
     https://your-project.vercel.app
     ```

---

### Шаг 5: Запустить проект локально

```bash
# Установите зависимости (если еще не установлены)
npm install

# Запустите dev сервер
npm run dev
```

Приложение будет доступно по адресу: `http://localhost:3000`

---

### Шаг 6: Протестировать бота

1. **Откройте вашего бота** в Telegram
2. **Нажмите на кнопку Menu** (обычно внизу экрана)
3. **WebApp должен открыться** в Telegram
4. **Проверьте:**
   - ✅ WebApp открывается
   - ✅ Видны ваши данные (имя, username)
   - ✅ Кнопка "Войти" не показывается (если вы авторизованы)

---

## 🔧 Дополнительные команды BotFather

### Просмотр информации о боте

```
/mybots
→ Выберите бота
→ Bot Settings
```

### Изменить описание бота

```
/setdescription
@your_bot_username
Описание вашего бота
```

### Изменить команды бота

```
/setcommands
@your_bot_username
start - Начать работу с ботом
help - Помощь
```

### Удалить Menu Button

```
/deletebot
@your_bot_username
```

---

## ⚠️ Важные замечания

### Безопасность

1. **НЕ делитесь токеном бота** — это секретная информация
2. **НЕ коммитьте `.env.local`** в Git (он уже в `.gitignore`)
3. **Используйте разные токены** для development и production

### WebApp URL

1. **URL должен быть HTTPS** — Telegram требует безопасное соединение
2. **URL должен быть доступен** — проверьте, что сайт работает
3. **Для локальной разработки** используйте туннель (Cloudflare Tunnel, ngrok и т.д.)

### Проверка работы

Если WebApp не открывается:

1. **Проверьте URL** в BotFather — должен быть правильный HTTPS URL
2. **Проверьте, что сайт доступен** — откройте URL в браузере
3. **Проверьте консоль** — откройте DevTools в браузере (F12)
4. **Проверьте токен** — убедитесь, что `BOT_TOKEN` правильный в `.env.local`

---

## 📱 Примеры использования

### Локальная разработка с Cloudflare Tunnel

```bash
# Терминал 1: Запустите туннель
cloudflared tunnel --url http://localhost:3000

# Терминал 2: Запустите dev сервер
npm run dev

# В BotFather установите URL из туннеля
```

### Production на Vercel

1. Деплой на Vercel
2. Получите URL: `https://your-project.vercel.app`
3. В BotFather установите этот URL
4. Протестируйте в Telegram

---

## 🐛 Troubleshooting

### Проблема: "WebApp не открывается"

**Решение:**
1. Проверьте URL в BotFather — должен быть HTTPS
2. Проверьте, что сайт доступен — откройте URL в браузере
3. Проверьте консоль браузера на ошибки

### Проблема: "BOT_TOKEN is not configured"

**Решение:**
1. Проверьте `.env.local` — должен быть `BOT_TOKEN`
2. Перезапустите dev сервер после изменения `.env.local`
3. Проверьте формат токена — должен быть строкой в кавычках

### Проблема: "Пользователь не авторизован"

**Решение:**
1. Убедитесь, что открыли WebApp через Telegram (не в браузере)
2. Проверьте, что URL в BotFather правильный
3. Проверьте консоль браузера на ошибки

---

## ✅ Чеклист настройки

- [ ] Бот создан через BotFather
- [ ] Токен бота получен и сохранен
- [ ] Telegram ID получен через @userinfobot
- [ ] `.env.local` создан с `BOT_TOKEN`, `ADMIN_IDS`, `SUPERADMIN_IDS`
- [ ] WebApp URL настроен в BotFather
- [ ] Проект запущен локально (`npm run dev`)
- [ ] WebApp открывается через Telegram
- [ ] Авторизация работает (видны данные пользователя)

---

**Версия:** 1.0.0  
**Последнее обновление:** 2024
