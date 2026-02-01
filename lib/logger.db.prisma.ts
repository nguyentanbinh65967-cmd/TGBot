/**
 * Логирование с использованием Prisma (для замены lib/logger.ts)
 * 
 * После миграции на БД замените импорты:
 * - import { logAdminAction } from "@/lib/logger";
 * - на: import { logAdminAction } from "@/lib/logger.db.prisma";
 */

import { db } from "@/lib/db/prisma";
import type { LogAction } from "./logger";
import type { Role } from "@/types/user";

export interface AdminLog {
  id?: number;
  timestamp: Date;
  adminId: number;
  adminName: string;
  action: LogAction;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Логирование действия администратора
 * 
 * @param log - Данные для логирования
 */
export async function logAdminAction(
  log: Omit<AdminLog, "timestamp" | "id">
): Promise<void> {
  await db.log.create({
    data: {
      userId: String(log.adminId),
      role: log.action.includes("admin") ? "admin" : "user", // Определяем роль по действию
      action: log.action,
      entity: log.details?.entity as string | undefined,
      entityId: log.details?.entityId ? String(log.details.entityId) : undefined,
      ip: log.ipAddress || "unknown",
      userAgent: log.userAgent || "unknown",
      meta: typeof log.details === "object" ? JSON.stringify(log.details || {}) : String(log.details || ""),
    },
  });
}

/**
 * Получить логи администратора
 * 
 * @param adminId - ID администратора (опционально)
 * @param limit - Лимит записей
 * @returns Массив логов
 */
export async function getAdminLogs(
  adminId?: number,
  limit: number = 100
): Promise<AdminLog[]> {
  const logs = await db.log.findMany({
    where: adminId
      ? {
          userId: String(adminId),
        }
      : undefined,
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    include: {
      user: {
        select: {
          firstName: true,
          username: true,
        },
      },
    },
  });

  return logs.map((log) => ({
    id: Number(log.id),
    timestamp: log.createdAt,
    adminId: log.userId ? Number(log.userId) : 0,
    adminName: log.user?.firstName || "System",
    action: log.action as LogAction,
    details: typeof log.meta === "string" 
      ? (log.meta ? JSON.parse(log.meta) : {}) 
      : (log.meta || {}),
    ipAddress: log.ip,
    userAgent: log.userAgent,
  }));
}

/**
 * Логирование любого действия пользователя
 * 
 * @param userId - ID пользователя
 * @param role - Роль пользователя
 * @param action - Действие
 * @param entity - Тип сущности
 * @param entityId - ID сущности
 * @param ip - IP адрес
 * @param userAgent - User Agent
 * @param meta - Дополнительные метаданные
 */
export async function logAction(
  userId: number | string | null,
  role: Role,
  action: string,
  entity?: string,
  entityId?: string | number,
  ip?: string,
  userAgent?: string,
  meta?: Record<string, any>
): Promise<void> {
  await db.log.create({
    data: {
      userId: userId ? String(userId) : null,
      role: role === "guest" ? "user" : (role as "user" | "admin" | "superadmin"), // guest не хранится в БД
      action,
      entity,
      entityId: entityId ? String(entityId) : undefined,
      ip: ip || "unknown",
      userAgent: userAgent || "unknown",
      meta: typeof meta === "object" ? JSON.stringify(meta || {}) : String(meta || ""),
    },
  });
}
