# Установка Git на Windows

## Способ 1: Через официальный установщик (рекомендуется)

### Шаг 1: Скачайте Git

1. Откройте [git-scm.com/download/win](https://git-scm.com/download/win)
2. Скачайте установщик (автоматически определит 64-bit или 32-bit)
3. Запустите скачанный файл (например, `Git-2.43.0-64-bit.exe`)

### Шаг 2: Установка

1. **License Information** → Next
2. **Select Components:**
   - ✅ Git Bash Here
   - ✅ Git GUI Here
   - ✅ Associate .git* configuration files with the default text editor
   - ✅ Associate .sh files to be run with Bash
   - Next

3. **Choosing the default editor:**
   - Выберите "Use Visual Studio Code as Git's default editor" (если используете VS Code)
   - Или "Nano editor" (простой вариант)
   - Next

4. **Adjusting your PATH environment:**
   - ✅ **"Git from the command line and also from 3rd-party software"** (рекомендуется)
   - Next

5. **Choosing HTTPS transport backend:**
   - ✅ "Use the OpenSSL library" (рекомендуется)
   - Next

6. **Configuring the line ending conversions:**
   - ✅ "Checkout Windows-style, commit Unix-style line endings" (рекомендуется)
   - Next

7. **Configuring the terminal emulator:**
   - ✅ "Use Windows' default console window"
   - Next

8. **Default behavior of `git pull`:**
   - ✅ "Default (fast-forward or merge)"
   - Next

9. **Choose a credential helper:**
   - ✅ "Git Credential Manager" (рекомендуется)
   - Next

10. **Extra options:**
    - ✅ Enable file system caching
    - ✅ Enable symbolic links
    - Next

11. **Experimental options:**
    - Оставьте по умолчанию
    - Install

12. Дождитесь завершения установки → Finish

### Шаг 3: Проверка установки

Откройте **новый** терминал (PowerShell или Command Prompt) и выполните:

```bash
git --version
```

Должно показать версию, например: `git version 2.43.0`

---

## Способ 2: Через winget (Windows Package Manager)

Если у вас установлен winget:

```powershell
winget install --id Git.Git -e --source winget
```

После установки перезапустите терминал.

---

## Способ 3: Через Chocolatey

Если у вас установлен Chocolatey:

```powershell
choco install git
```

---

## После установки

### 1. Настройте Git (первый раз)

```bash
# Укажите ваше имя
git config --global user.name "Ваше Имя"

# Укажите ваш email (можно использовать GitHub email)
git config --global user.email "your.email@example.com"

# Проверьте настройки
git config --list
```

### 2. Проверьте, что Git работает

```bash
git --version
git config --global --list
```

---

## Теперь можно публиковать в GitHub

После установки Git, вернитесь к инструкциям в `docs/GITHUB_SETUP.md`:

```bash
# Инициализация репозитория
git init

# Добавление файлов
git add .

# Первый коммит
git commit -m "Initial commit: Telegram WebApp with Next.js 14"
```

---

## Troubleshooting

### Git не найден после установки

1. **Закройте и откройте терминал заново**
2. Проверьте PATH:
   - Откройте "Environment Variables" в Windows
   - Убедитесь, что `C:\Program Files\Git\cmd` в PATH
3. Перезагрузите компьютер (если нужно)

### Ошибка "git: command not found"

- Убедитесь, что выбрали "Git from the command line" при установке
- Перезапустите терминал
- Проверьте PATH переменную

### Нужна помощь с установкой?

- Официальная документация: [git-scm.com/book](https://git-scm.com/book)
- GitHub Guides: [guides.github.com](https://guides.github.com)

---

## Альтернатива: GitHub Desktop

Если не хотите использовать командную строку, можете использовать **GitHub Desktop**:

1. Скачайте: [desktop.github.com](https://desktop.github.com)
2. Установите
3. Войдите в GitHub
4. Создайте репозиторий через интерфейс
5. GitHub Desktop автоматически установит Git, если его нет

**GitHub Desktop** — графический интерфейс для Git, проще для начинающих.
