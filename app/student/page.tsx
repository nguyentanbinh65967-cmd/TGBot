"use client";

import { useTelegram } from "@/hooks/useTelegram";

export default function StudentPage() {
  const { user, isReady, isTelegram } = useTelegram();

  if (!isReady) {
    return (
      <main className="p-4">
        <h1 className="text-xl font-bold">Моё обучение</h1>
        <div className="mt-4 rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Загрузка...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold">Моё обучение</h1>

      <div className="mt-4 rounded-xl bg-white p-4 shadow">
        {user ? (
          <>
            <p className="font-medium">
              Привет, {user.first_name}!
            </p>
            <p className="text-sm text-gray-500">
              Telegram ID: {user.id}
            </p>
            {user.username && (
              <p className="text-sm text-gray-500">
                Username: @{user.username}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-red-500">
            {isTelegram
              ? "Данные пользователя Telegram не найдены"
              : "Открыто не через Telegram"}
          </p>
        )}
      </div>
    </main>
  );
}
