# Preview Environments - Quick Reference

## 🚨 Критические правила

1. **Preview НЕ использует production данные**
2. **Preview НЕ использует production BOT_TOKEN**
3. **BotFather WebApp URL указывает ТОЛЬКО на production domain**
4. **Preview не может использовать реальную Telegram авторизацию**

---

## Настройка в Vercel

### Environment Variables

**Production Scope:**
```
BOT_TOKEN=real_production_token
DATABASE_URL=postgresql://prod_host/prod_db
```

**Preview Scope:**
```
BOT_TOKEN=test_dummy_token
DATABASE_URL=postgresql://preview_host/preview_db
```

**Важно:** Production secrets НЕ должны быть в Preview scope!

---

## Что можно тестировать в Preview

- ✅ UI/UX компоненты
- ✅ Layout и стили
- ✅ API endpoints (без Telegram auth)
- ✅ Формы и валидация

## Что НЕЛЬЗЯ тестировать в Preview

- ❌ Telegram WebApp авторизация
- ❌ initData валидация
- ❌ Production database

---

## Полная документация

См. `docs/PREVIEW_ENVIRONMENTS.md` для детальной политики.
