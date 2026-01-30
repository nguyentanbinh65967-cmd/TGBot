"use client";

export default function AdminSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Настройки
      </h1>

      <div className="space-y-6">
        {/* Настройки бота */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Настройки бота
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Токен бота
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="••••••••••••"
                disabled
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Настройка через переменные окружения
              </p>
            </div>
          </div>
        </div>

        {/* Список администраторов */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Администраторы
          </h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Список администраторов настраивается через переменную окружения:
            </p>
            <code className="block px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-900 dark:text-white">
              NEXT_PUBLIC_ADMIN_IDS=123456789,987654321
            </code>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              В будущем будет возможность управления через БД
            </p>
          </div>
        </div>

        {/* Другие настройки */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Другие настройки
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            Дополнительные настройки будут здесь
          </p>
        </div>
      </div>
    </div>
  );
}
