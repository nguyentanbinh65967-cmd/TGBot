/**
 * Клиентские функции авторизации (для использования в Client Components)
 * 
 * ВАЖНО: Клиентская проверка только для UX.
 * Реальная проверка должна быть на сервере через валидацию initData.
 */

import type { TelegramUser } from "@/types/telegram";
import type { UserRole, AuthResult } from "@/types/user";

/**
 * Получить список админ ID из переменных окружения
 */
function getAdminIds(): number[] {
  if (typeof process === "undefined" || !process.env) {
    return [];
  }

  const adminIdsEnv = process.env.NEXT_PUBLIC_ADMIN_IDS || process.env.ADMIN_IDS;
  
  if (!adminIdsEnv) {
    return [];
  }

  try {
    return adminIdsEnv
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id) && id > 0);
  } catch {
    return [];
  }
}

/**
 * Проверить, является ли пользователь администратором
 * 
 * @param telegramId - Telegram ID пользователя
 * @returns true если пользователь админ
 */
export function isAdmin(telegramId: number): boolean {
  const adminIds = getAdminIds();
  return adminIds.includes(telegramId);
}

/**
 * Определить роль пользователя (legacy, использует старую логику)
 * 
 * @deprecated Используйте getUserRole из @/config/rbac для получения Role
 * @param telegramId - Telegram ID пользователя
 * @returns роль пользователя (admin | user)
 */
export function getUserRole(telegramId: number): UserRole {
  return isAdmin(telegramId) ? "admin" : "user";
}

/**
 * Проверить авторизацию пользователя
 * 
 * @param user - Данные пользователя из Telegram WebApp
 * @returns результат проверки авторизации
 */
export function checkAuth(user: TelegramUser | null | undefined): AuthResult {
  // 🔧 DEV-режим: если нет Telegram-пользователя, но мы в development, считаем себя dev-админом
  // Это нужно, чтобы открывать /admin из обычного браузера локально.
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development" && (!user || !user.id)) {
    return {
      isAuthenticated: true,
      isAdmin: true,
      user: {
        id: 0,
        firstName: "Dev Desktop Admin",
        username: "dev_desktop_admin",
        role: "admin",
      },
    };
  }

  // Если пользователь не передан
  if (!user || !user.id) {
    return {
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      error: "Пользователь не авторизован",
    };
  }

  const role = getUserRole(user.id);
  const isAdminUser = role === "admin";

  return {
    isAuthenticated: true,
    isAdmin: isAdminUser,
    user: {
      id: user.id,
      firstName: user.first_name,
      username: user.username,
      role,
    },
  };
}

/**
 * Проверить доступ к админке
 * 
 * @param user - Данные пользователя из Telegram WebApp
 * @returns true если доступ разрешен
 */
export function hasAdminAccess(user: TelegramUser | null | undefined): boolean {
  const authResult = checkAuth(user);
  return authResult.isAuthenticated && authResult.isAdmin;
}
