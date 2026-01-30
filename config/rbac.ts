/**
 * RBAC (Role-Based Access Control) конфигурация
 * 
 * ВАЖНО: Это временная конфигурация без БД.
 * В будущем getUserRole будет получать данные из БД.
 */

import type { TelegramUser } from "@/types/telegram";
import type { Role } from "@/types/user";

/**
 * Список ID суперадминистраторов
 * 
 * Суперадминистраторы имеют полный доступ ко всем функциям системы.
 */
export const SUPERADMIN_IDS: number[] = (() => {
  const envValue = process.env.SUPERADMIN_IDS || process.env.NEXT_PUBLIC_SUPERADMIN_IDS;
  if (!envValue) return [];
  
  try {
    return envValue
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id) && id > 0);
  } catch {
    return [];
  }
})();

/**
 * Список ID администраторов
 * 
 * Администраторы имеют доступ к админ-панели и API.
 */
export const ADMIN_IDS: number[] = (() => {
  const envValue = process.env.ADMIN_IDS || process.env.NEXT_PUBLIC_ADMIN_IDS;
  if (!envValue) return [];
  
  try {
    return envValue
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id) && id > 0);
  } catch {
    return [];
  }
})();

/**
 * Определить роль пользователя на основе его Telegram ID
 * 
 * Логика:
 * - Если user.id в SUPERADMIN_IDS → superadmin
 * - Если user.id в ADMIN_IDS → admin
 * - Иначе → user
 * 
 * @param user - Пользователь Telegram (валидированный через validateInitData)
 * @returns Роль пользователя
 * 
 * @example
 * ```typescript
 * const user = validateInitData(initData);
 * const role = getUserRole(user);
 * // role === "admin" | "superadmin" | "user"
 * ```
 * 
 * @future
 * В будущем эта функция будет получать роль из БД:
 * ```typescript
 * async function getUserRole(user: TelegramUser): Promise<Role> {
 *   const dbUser = await db.users.findByTelegramId(user.id);
 *   return dbUser?.role || "user";
 * }
 * ```
 */
export function getUserRole(user: TelegramUser): Role {
  // Проверяем суперадминистратора
  if (SUPERADMIN_IDS.includes(user.id)) {
    return "superadmin";
  }

  // Проверяем администратора
  if (ADMIN_IDS.includes(user.id)) {
    return "admin";
  }

  // По умолчанию обычный пользователь
  return "user";
}

/**
 * Проверить, имеет ли пользователь доступ к админ-функциям
 * 
 * @param user - Пользователь Telegram
 * @returns true если пользователь admin или superadmin
 */
export function hasAdminAccess(user: TelegramUser): boolean {
  const role = getUserRole(user);
  return role === "admin" || role === "superadmin";
}

/**
 * Проверить, является ли пользователь суперадминистратором
 * 
 * @param user - Пользователь Telegram
 * @returns true если пользователь superadmin
 */
export function isSuperAdmin(user: TelegramUser): boolean {
  return getUserRole(user) === "superadmin";
}

/**
 * Проверить доступ к роуту на основе роли
 * 
 * @param role - Роль пользователя
 * @param requiredRoles - Массив разрешенных ролей
 * @returns true если доступ разрешен
 */
export function hasRoleAccess(role: Role, requiredRoles: Role[]): boolean {
  return requiredRoles.includes(role);
}

/**
 * Маппинг ролей для проверки доступа
 */
export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  guest: ["guest"],
  user: ["guest", "user"],
  admin: ["guest", "user", "admin"],
  superadmin: ["guest", "user", "admin", "superadmin"],
};

/**
 * Проверить доступ на основе иерархии ролей
 * 
 * @param userRole - Роль пользователя
 * @param requiredRole - Минимальная требуемая роль
 * @returns true если доступ разрешен
 */
export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  const userHierarchy = ROLE_HIERARCHY[userRole] || [];
  return userHierarchy.includes(requiredRole);
}
