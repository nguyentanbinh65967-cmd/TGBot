"use client";

import { useTelegram } from "@/hooks/useTelegram";
import { checkAuth } from "@/lib/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isReady, webApp } = useTelegram();
  const pathname = usePathname();
  const [authResult, setAuthResult] = useState<ReturnType<typeof checkAuth> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isReady) {
      setAuthResult(checkAuth(user));
    }
  }, [isReady, user]);

  // Применяем Telegram theme colors
  useEffect(() => {
    if (webApp) {
      const theme = webApp.themeParams;
      const root = document.documentElement;

      if (theme.bg_color) {
        root.style.setProperty("--tg-theme-bg-color", theme.bg_color);
      }
      if (theme.text_color) {
        root.style.setProperty("--tg-theme-text-color", theme.text_color);
      }
      if (theme.hint_color) {
        root.style.setProperty("--tg-theme-hint-color", theme.hint_color);
      }
      if (theme.link_color) {
        root.style.setProperty("--tg-theme-link-color", theme.link_color);
      }
      if (theme.button_color) {
        root.style.setProperty("--tg-theme-button-color", theme.button_color);
      }
      if (theme.button_text_color) {
        root.style.setProperty("--tg-theme-button-text-color", theme.button_text_color);
      }
      if (theme.secondary_bg_color) {
        root.style.setProperty("--tg-theme-secondary-bg-color", theme.secondary_bg_color);
      }
    }
  }, [webApp]);

  // Показываем загрузку до гидрации
  if (!mounted || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Проверка доступа
  if (!authResult?.isAuthenticated || !authResult?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Доступ запрещён
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            У вас нет прав для доступа к админ-панели.
          </p>
          {!authResult?.isAuthenticated && (
            <p className="text-sm text-red-500 mb-4">
              Откройте приложение через Telegram
            </p>
          )}
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/users", label: "Пользователи", icon: "👥" },
    { href: "/admin/settings", label: "Настройки", icon: "⚙️" },
    { href: "/admin/logs", label: "Логи", icon: "📝" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Мобильное меню (сверху) */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Админ-панель
          </h1>
          {authResult.user && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {authResult.user.firstName}
            </div>
          )}
        </div>
        <nav className="px-4 pb-3 flex gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex">
        {/* Боковое меню (десктоп) */}
        <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Админ-панель
            </h1>
            {authResult.user && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div className="font-medium">{authResult.user.firstName}</div>
                {authResult.user.username && (
                  <div className="text-xs">@{authResult.user.username}</div>
                )}
                <div className="text-xs mt-1">
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                    {authResult.user.role}
                  </span>
                </div>
              </div>
            )}
          </div>
          <nav className="p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Основной контент */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
