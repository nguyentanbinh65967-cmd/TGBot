"use client";

import { useEffect, useState } from "react";
import type { TelegramWebApp, TelegramUser } from "@/types/telegram";

interface UseTelegramReturn {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  isReady: boolean;
  isTelegram: boolean;
}

/**
 * Хук для работы с Telegram WebApp API
 * 
 * @returns {UseTelegramReturn} Объект с webApp, user, isReady, isTelegram
 * 
 * @example
 * ```tsx
 * "use client";
 * 
 * import { useTelegram } from "@/hooks/useTelegram";
 * 
 * export default function Page() {
 *   const { webApp, user, isReady, isTelegram } = useTelegram();
 * 
 *   if (!isReady) {
 *     return <div>Загрузка...</div>;
 *   }
 * 
 *   return (
 *     <div>
 *       {user ? (
 *         <p>Привет, {user.first_name}!</p>
 *       ) : (
 *         <p>Открыто не через Telegram</p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTelegram(): UseTelegramReturn {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    // Проверяем, что код выполняется на клиенте
    if (typeof window === "undefined") {
      return;
    }

    // Ждем загрузки Telegram WebApp SDK
    const checkTelegram = () => {
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;

        // Инициализация WebApp
        tg.ready();
        tg.expand();

        setWebApp(tg);
        setIsTelegram(true);

        // Получаем данные пользователя
        if (tg.initDataUnsafe?.user) {
          setUser(tg.initDataUnsafe.user);
        }

        setIsReady(true);

        // Логирование для отладки (можно убрать в продакшене)
        console.log("Telegram WebApp initialized:", {
          version: tg.version,
          platform: tg.platform,
          user: tg.initDataUnsafe?.user,
        });
      } else {
        // Если Telegram WebApp не найден, значит открыто не в Telegram
        setIsReady(true);
        setIsTelegram(false);
      }
    };

    // Проверяем сразу (если скрипт уже загружен)
    checkTelegram();

    // Если скрипт еще не загружен, ждем его загрузки
    if (!window.Telegram?.WebApp) {
      // Создаем интервал для проверки загрузки скрипта
      const interval = setInterval(() => {
        if (window.Telegram?.WebApp) {
          clearInterval(interval);
          checkTelegram();
        }
      }, 100);

      // Очищаем интервал через 5 секунд (если скрипт так и не загрузился)
      const timeout = setTimeout(() => {
        clearInterval(interval);
        if (!window.Telegram?.WebApp) {
          setIsReady(true);
          setIsTelegram(false);
        }
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, []);

  return {
    webApp,
    user,
    isReady,
    isTelegram,
  };
}
