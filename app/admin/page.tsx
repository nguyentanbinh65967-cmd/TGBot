"use client";

import { useTelegram } from "@/hooks/useTelegram";
import { checkAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const { user, isReady, webApp } = useTelegram();
  const [authResult, setAuthResult] = useState<ReturnType<typeof checkAuth> | null>(null);

  useEffect(() => {
    if (isReady) {
      setAuthResult(checkAuth(user));
    }
  }, [isReady, user]);

  if (!isReady || !authResult) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Dashboard
      </h1>

      {/* Информация о пользователе */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Информация о пользователе
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Telegram ID:</span>
              <p className="text-base font-mono text-gray-900 dark:text-white">
                {authResult.user?.id || "—"}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Имя:</span>
              <p className="text-base text-gray-900 dark:text-white">
                {authResult.user?.firstName || "—"}
              </p>
            </div>
            {authResult.user?.username && (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Username:</span>
                <p className="text-base text-gray-900 dark:text-white">
                  @{authResult.user.username}
                </p>
              </div>
            )}
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Роль:</span>
              <p className="text-base">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                  {authResult.user?.role || "—"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Статус WebApp */}
        {webApp && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Статус WebApp
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Версия:</span>
                <p className="text-base text-gray-900 dark:text-white">
                  {webApp.version || "—"}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Платформа:</span>
                <p className="text-base text-gray-900 dark:text-white">
                  {webApp.platform || "—"}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Расширен:</span>
                <p className="text-base">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      webApp.isExpanded
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                    }`}
                  >
                    {webApp.isExpanded ? "Да" : "Нет"}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Цветовая схема:</span>
                <p className="text-base text-gray-900 dark:text-white">
                  {webApp.colorScheme === "dark" ? "🌙 Тёмная" : "☀️ Светлая"}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Высота viewport:</span>
                <p className="text-base text-gray-900 dark:text-white">
                  {webApp.viewportHeight}px
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Статистика (заглушка для будущего) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Всего пользователей</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">—</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Активных сегодня</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">—</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Действий за день</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">—</p>
            </div>
            <div className="text-3xl">⚡</div>
          </div>
        </div>
      </div>
    </div>
  );
}
