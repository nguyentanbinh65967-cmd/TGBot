"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <svg
            className="w-20 h-20 mx-auto text-red-500"
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

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Доступ запрещён
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-2">
          У вас нет прав для доступа к этому разделу.
        </p>

        {from && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            Попытка доступа: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{from}</code>
          </p>
        )}

        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Для доступа к админ-панели необходимо:
          </p>
          <ul className="text-sm text-left text-gray-600 dark:text-gray-400 space-y-2 mb-6">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Открыть приложение через Telegram</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Иметь роль администратора или суперадминистратора</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Войти через десктоп (логин/пароль)</span>
            </li>
          </ul>

          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/admin/login"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Войти как админ (Desktop)
            </Link>
            <Link
              href="/"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Вернуться на главную
            </Link>
            {from && (
              <button
                onClick={() => window.history.back()}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Назад
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <UnauthorizedContent />
    </Suspense>
  );
}
