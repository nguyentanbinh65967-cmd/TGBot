# Preview Environments Checklist

## Для разработчиков

### ✅ Перед созданием PR

- [ ] Код не содержит hardcoded production значений
- [ ] Нет прямых ссылок на production database
- [ ] Нет production BOT_TOKEN в коде
- [ ] Миграции безопасны для preview БД
- [ ] Изменения не затрагивают критичную production логику

### ✅ При работе с Preview Deployment

- [ ] Preview deployment создан автоматически
- [ ] Используются Preview scope environment variables
- [ ] Подключение к preview database (не production)
- [ ] UI/UX тестирование работает
- [ ] НЕ пытаюсь тестировать Telegram auth в preview

### ✅ Перед мерджем в Production

- [ ] Все тесты пройдены
- [ ] Code review завершен
- [ ] Preview deployment работает корректно
- [ ] Нет production secrets в коде
- [ ] Миграции протестированы на preview БД
- [ ] Production environment variables проверены

---

## Для DevOps / Platform Engineers

### ✅ Настройка Vercel

- [ ] Production scope env vars настроены (только Production)
- [ ] Preview scope env vars настроены (только Preview)
- [ ] Production BOT_TOKEN НЕ в Preview scope
- [ ] Production DATABASE_URL НЕ в Preview scope
- [ ] Preview DATABASE_URL указывает на preview БД

### ✅ Настройка BotFather

- [ ] WebApp URL указывает только на production domain
- [ ] Preview URLs НЕ зарегистрированы
- [ ] Localhost URLs НЕ зарегистрированы

### ✅ Настройка Database

- [ ] Preview database создана
- [ ] Preview database изолирована от production
- [ ] Миграции могут применяться к preview БД
- [ ] Preview БД можно безопасно удалить

### ✅ Мониторинг

- [ ] Регулярно проверяю Environment Variables
- [ ] Мониторю подключения к БД
- [ ] Проверяю, что preview не использует production данные

---

## Быстрая проверка

### Проверка Environment Variables

```bash
# Через Vercel CLI
vercel env ls

# Проверьте, что:
# - BOT_TOKEN в Production scope ≠ BOT_TOKEN в Preview scope
# - DATABASE_URL в Production scope ≠ DATABASE_URL в Preview scope
```

### Проверка Preview Deployment

1. Откройте preview deployment в Vercel
2. Проверьте **Settings** → **Environment Variables**
3. Убедитесь, что используются Preview scope переменные
4. Проверьте логи подключения к БД

### Проверка BotFather

1. Откройте [@BotFather](https://t.me/BotFather)
2. `/mybots` → ваш бот → **Bot Settings** → **Menu Button**
3. Убедитесь, что URL указывает только на production domain

---

## Что делать, если что-то пошло не так

### Обнаружен production secret в preview

1. **Немедленно:** Удалите переменную из Preview scope
2. Проверьте, не был ли использован production secret
3. Если использован — ротируйте production secret
4. Обновите документацию

### Preview использует production БД

1. **Немедленно:** Проверьте Environment Variables
2. Убедитесь, что `DATABASE_URL` имеет правильный scope
3. Пересоздайте preview deployment
4. Проверьте логи подключений

### Preview доступен для реальных пользователей

1. **Невозможно** — Preview URLs не зарегистрированы в BotFather
2. Telegram WebApp не будет работать с preview URL
3. Это защита по дизайну

---

## Контакты

При вопросах или проблемах:
- Проверьте `docs/PREVIEW_ENVIRONMENTS.md`
- Обратитесь к DevOps команде
- НЕ используйте production для экспериментов
