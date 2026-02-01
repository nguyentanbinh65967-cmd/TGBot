"use server";

/**
 * Server Actions для управления пользователями
 * 
 * ВСЕ действия проверяют права доступа на сервере
 * и логируют через logger.db.prisma
 */

import { db } from "@/lib/db/prisma";
import { logAction } from "@/lib/logger.db.prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { Role } from "@/types/user";

/**
 * Получить текущего пользователя из headers (установлено middleware)
 */
async function getCurrentUser() {
  const headersList = await headers();
  const userId = headersList.get("x-user-id");
  const userRole = headersList.get("x-user-role");
  const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";

  if (!userId || !userRole) {
    throw new Error("Unauthorized");
  }

  return {
    userId,
    role: userRole as Role,
    ip,
    userAgent,
  };
}

/**
 * Переключить статус блокировки пользователя
 */
export async function toggleUserBlock(userId: string) {
  const currentUser = await getCurrentUser();

  // Только админы могут блокировать пользователей
  if (currentUser.role !== "admin" && currentUser.role !== "superadmin") {
    throw new Error("Forbidden: Only admins can block users");
  }

  // Получаем текущее состояние пользователя
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isBlocked: true, firstName: true, username: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Обновляем статус блокировки
  const updated = await db.user.update({
    where: { id: userId },
    data: {
      isBlocked: !user.isBlocked,
    },
  });

  // Логируем действие
  await logAction(
    Number(currentUser.userId),
    currentUser.role,
    "user.blocked",
    "user",
    userId,
    currentUser.ip,
    currentUser.userAgent,
    {
      targetUserId: userId,
      targetUserName: user.firstName,
      targetUsername: user.username,
      isBlocked: updated.isBlocked,
    }
  );

  revalidatePath("/admin/users");
  return { success: true, isBlocked: updated.isBlocked };
}

/**
 * Изменить роль пользователя (только для суперадминов)
 */
export async function changeUserRole(userId: string, newRole: Role) {
  const currentUser = await getCurrentUser();

  // Только суперадмины могут менять роли
  if (currentUser.role !== "superadmin") {
    throw new Error("Forbidden: Only superadmins can change user roles");
  }

  // Валидация роли
  if (!["user", "admin", "superadmin"].includes(newRole)) {
    throw new Error("Invalid role");
  }

  // Получаем текущего пользователя
  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, firstName: true, username: true },
  });

  if (!targetUser) {
    throw new Error("User not found");
  }

  // Нельзя изменить роль самому себе
  if (currentUser.userId === userId) {
    throw new Error("Cannot change your own role");
  }

  // Обновляем роль (приводим к типу Prisma Role, исключая "guest")
  const updated = await db.user.update({
    where: { id: userId },
    data: {
      role: newRole as "user" | "admin" | "superadmin",
    },
  });

  // Логируем действие
  await logAction(
    Number(currentUser.userId),
    currentUser.role,
    "user.role_changed",
    "user",
    userId,
    currentUser.ip,
    currentUser.userAgent,
    {
      targetUserId: userId,
      targetUserName: targetUser.firstName,
      targetUsername: targetUser.username,
      oldRole: targetUser.role,
      newRole: updated.role,
    }
  );

  revalidatePath("/admin/users");
  return { success: true, role: updated.role };
}
