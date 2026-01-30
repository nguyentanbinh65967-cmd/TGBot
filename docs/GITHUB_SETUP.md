# Публикация проекта в GitHub

## Пошаговая инструкция

### 1. Проверка перед публикацией

**Убедитесь, что секреты не попадут в репозиторий:**

- ✅ `.env.local` — в `.gitignore`
- ✅ `.env.production` — в `.gitignore`
- ✅ `.env` — в `.gitignore`
- ✅ `node_modules/` — в `.gitignore`
- ✅ `.vercel/` — в `.gitignore`

**Проверьте, что в коде нет hardcoded секретов:**
```bash
# Поиск возможных секретов
grep -r "BOT_TOKEN" --exclude-dir=node_modules --exclude="*.md"
grep -r "DATABASE_URL" --exclude-dir=node_modules --exclude="*.md"
```

### 2. Инициализация Git репозитория

Если Git еще не инициализирован:

```bash
# Инициализация репозитория
git init

# Добавление всех файлов
git add .

# Первый коммит
git commit -m "Initial commit: Telegram WebApp with Next.js 14"
```

### 3. Создание репозитория на GitHub

**Вариант A: Через GitHub веб-интерфейс (рекомендуется)**

1. Откройте [github.com](https://github.com)
2. Нажмите **"+"** → **"New repository"**
3. Заполните:
   - **Repository name:** `taekwondo-school` (или другое имя)
   - **Description:** "Telegram WebApp for Taekwondo School - Next.js 14"
   - **Visibility:** Public или Private (на ваше усмотрение)
   - **НЕ** добавляйте README, .gitignore, license (они уже есть)
4. Нажмите **"Create repository"**

**Вариант B: Через GitHub CLI**

```bash
# Установите GitHub CLI (если не установлен)
# Windows: winget install GitHub.cli
# Mac: brew install gh
# Linux: apt install gh

# Войдите в GitHub
gh auth login

# Создайте репозиторий
gh repo create taekwondo-school --public --source=. --remote=origin --push
```

### 4. Подключение к GitHub

После создания репозитория на GitHub, выполните:

```bash
# Добавьте remote (замените YOUR_USERNAME на ваш GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/taekwondo-school.git

# Или через SSH (если настроен):
# git remote add origin git@github.com:YOUR_USERNAME/taekwondo-school.git

# Проверьте remote
git remote -v
```

### 5. Загрузка кода в GitHub

```bash
# Переименуйте ветку в main (если нужно)
git branch -M main

# Загрузите код
git push -u origin main
```

### 6. Проверка

1. Откройте ваш репозиторий на GitHub
2. Убедитесь, что все файлы загружены
3. Проверьте, что `.env.local` и другие секреты **НЕ** видны в репозитории

---

## Настройка для Vercel

После публикации в GitHub, Vercel может автоматически подключаться:

1. В Vercel Dashboard → **Add New** → **Project**
2. Выберите **Import Git Repository**
3. Выберите ваш GitHub репозиторий
4. Vercel автоматически определит Next.js
5. Добавьте Environment Variables (см. `docs/VERCEL_DEPLOYMENT.md`)

---

## Что НЕ должно попасть в GitHub

**Проверьте перед коммитом:**

```bash
# Проверьте, что эти файлы игнорируются
git status

# Должны быть в "Untracked files" или не показываться:
# - .env.local
# - .env.production
# - node_modules/
# - .vercel/
# - .next/
```

**Если случайно добавили секреты:**

```bash
# Удалите из индекса (но оставьте локально)
git rm --cached .env.local

# Добавьте в .gitignore (если еще нет)
echo ".env.local" >> .gitignore

# Закоммитьте изменения
git add .gitignore
git commit -m "Remove secrets from repository"
```

---

## Структура репозитория

После публикации в GitHub, структура должна быть:

```
taekwondo-school/
├── .gitignore              ✅ (игнорирует секреты)
├── README.md               ✅ (инструкции)
├── package.json            ✅
├── next.config.js          ✅
├── vercel.json             ✅
├── app/                    ✅
├── components/             ✅
├── lib/                    ✅
├── docs/                   ✅
├── prisma/                 ✅
├── .env.local              ❌ (НЕ должно быть в репозитории)
├── node_modules/          ❌ (НЕ должно быть в репозитории)
└── .vercel/                ❌ (НЕ должно быть в репозитории)
```

---

## Дополнительные настройки

### GitHub Actions (опционально)

Можно добавить CI/CD через GitHub Actions:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run lint
```

### GitHub Secrets (для CI/CD)

Если используете GitHub Actions, добавьте секреты:

1. Repository → **Settings** → **Secrets and variables** → **Actions**
2. Добавьте:
   - `BOT_TOKEN`
   - `DATABASE_URL`
   - И другие секреты

**Важно:** GitHub Secrets используются только для CI/CD, не для production деплоя.

---

## Публичный vs Приватный репозиторий

### Публичный репозиторий

**Плюсы:**
- ✅ Легко поделиться кодом
- ✅ Можно получать contributions
- ✅ Портфолио для разработчиков

**Минусы:**
- ⚠️ Код виден всем
- ⚠️ Нужно быть осторожным с секретами

**Рекомендации:**
- Используйте публичный репозиторий, если:
  - Это учебный проект
  - Хотите поделиться кодом
  - Нет критичных секретов в коде

### Приватный репозиторий

**Плюсы:**
- ✅ Код скрыт от публики
- ✅ Больше контроля

**Минусы:**
- ⚠️ Нужна платная подписка для приватных репозиториев (если больше 1)

**Рекомендации:**
- Используйте приватный репозиторий, если:
  - Это коммерческий проект
  - Есть критичные секреты
  - Нужна приватность

---

## Готово!

После выполнения всех шагов:

1. ✅ Код опубликован в GitHub
2. ✅ Секреты защищены
3. ✅ Репозиторий готов для Vercel
4. ✅ Можно работать в команде

---

## Полезные команды

```bash
# Проверка статуса
git status

# Добавление изменений
git add .

# Коммит
git commit -m "Описание изменений"

# Загрузка в GitHub
git push

# Создание новой ветки
git checkout -b feature/new-feature

# Просмотр истории
git log --oneline
```

---

## Troubleshooting

### Ошибка: "remote origin already exists"

```bash
# Удалите существующий remote
git remote remove origin

# Добавьте заново
git remote add origin https://github.com/YOUR_USERNAME/taekwondo-school.git
```

### Ошибка: "failed to push some refs"

```bash
# Сначала получите изменения
git pull origin main --allow-unrelated-histories

# Затем загрузите
git push -u origin main
```

### Секреты попали в историю Git

Если секреты уже закоммичены:

1. Используйте `git-filter-repo` или `BFG Repo-Cleaner`
2. Или создайте новый репозиторий
3. **Важно:** Ротируйте все секреты, которые попали в историю

---

## Следующие шаги

После публикации:

1. Подключите к Vercel (см. `docs/VERCEL_DEPLOYMENT.md`)
2. Настройте Environment Variables в Vercel
3. Задеплойте приложение
4. Настройте Telegram WebApp URL
