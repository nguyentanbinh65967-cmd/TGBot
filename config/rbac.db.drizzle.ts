/**
 * RBAC с использованием Drizzle (для замены config/rbac.ts)
 * 
 * После миграции на БД замените импорты:
 * - import { getUserRole } from "@/config/rbac";
 * - на: import { getUserRole } from "@/config/rbac.db.drizzle";
 */

import { db } from "@/lib/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { TelegramUser } from "@/types/telegram";
import type { Role } from "@/types/user";

/**
 * Определить роль пользователя на основе БД
 * 
 * @param user - Пользователь Telegram (валидированный через validateInitData)
 * @returns Роль пользователя
 */
export async function getUserRole(user: TelegramUser): Promise<Role> {
  const dbUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, BigInt(user.id)),
    columns: { role: true },
  });

  // Если пользователь не найден в БД, возвращаем "user" по умолчанию
  // В будущем можно автоматически создавать пользователя при первом входе
  if (!dbUser) {
    return "user";
  }

  // Преобразуем enum в наш тип Role
  return dbUser.role as Role;
}

/**
 * Проверить, имеет ли пользователь доступ к админ-функциям
 * 
 * @param user - Пользователь Telegram
 * @returns true если пользователь admin или superadmin
 */
export async function hasAdminAccess(user: TelegramUser): Promise<boolean> {
  const role = await getUserRole(user);
  return role === "admin" || role === "superadmin";
}

/**
 * Проверить, является ли пользователь суперадминистратором
 * 
 * @param user - Пользователь Telegram
 * @returns true если пользователь superadmin
 */
export async function isSuperAdmin(user: TelegramUser): Promise<boolean> {
  const role = await getUserRole(user);
  return role === "superadmin";
}

/**
 * Создать или обновить пользователя в БД
 * 
 * @param user - Пользователь Telegram
 * @returns Созданный или обновленный пользователь
 */
export async function upsertUser(user: TelegramUser) {
  const userId = BigInt(user.id);
  
  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
  });

  if (existingUser) {
    // Обновляем существующего пользователя
    await db
      .update(users)
      .set({
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        photoUrl: user.photo_url,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
    
    return existingUser;
  } else {
    // Создаем нового пользователя
    const [newUser] = await db
      .insert(users)
      .values({
        id: userId,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        photoUrl: user.photo_url,
        role: "user", // По умолчанию обычный пользователь
        lastLoginAt: new Date(),
      })
      .returning();
    
    return newUser;
  }
}
