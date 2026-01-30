/**
 * Server-side helpers для статистики логов
 * 
 * ВСЕ функции работают на сервере и используют Prisma
 */

import { db } from "@/lib/db/prisma";

export interface LogsStats {
  logsToday: number;
  adminActionsToday: number;
  distinctActiveAdmins: number;
  actionsByType: Array<{
    action: string;
    count: number;
  }>;
}

/**
 * Получить статистику логов за последние 24 часа
 */
export async function getLogsStats24h(): Promise<LogsStats> {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Все логи за последние 24 часа
  const logsToday = await db.log.count({
    where: {
      createdAt: {
        gte: yesterday,
      },
    },
  });

  // Действия админов за последние 24 часа
  const adminActionsToday = await db.log.count({
    where: {
      createdAt: {
        gte: yesterday,
      },
      role: {
        in: ["admin", "superadmin"],
      },
    },
  });

  // Уникальные активные админы за последние 24 часа
  const distinctActiveAdminsResult = await db.log.findMany({
    where: {
      createdAt: {
        gte: yesterday,
      },
      role: {
        in: ["admin", "superadmin"],
      },
      userId: {
        not: null,
      },
    },
    select: {
      userId: true,
    },
    distinct: ["userId"],
  });

  const distinctActiveAdmins = distinctActiveAdminsResult.length;

  // Группировка по типам действий за последние 24 часа
  const allLogs24h = await db.log.findMany({
    where: {
      createdAt: {
        gte: yesterday,
      },
    },
    select: {
      action: true,
    },
  });

  // Группируем по действиям
  const actionCounts = new Map<string, number>();
  for (const log of allLogs24h) {
    actionCounts.set(log.action, (actionCounts.get(log.action) || 0) + 1);
  }

  const actionsByType = Array.from(actionCounts.entries())
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Топ 10 действий

  return {
    logsToday,
    adminActionsToday,
    distinctActiveAdmins,
    actionsByType,
  };
}

/**
 * Получить один лог по ID (read-only)
 */
export async function getLogById(logId: number) {
  const log = await db.log.findUnique({
    where: { id: logId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          role: true,
        },
      },
    },
  });

  if (!log) {
    return null;
  }

  return {
    ...log,
    userId: log.userId ? log.userId.toString() : null,
    user: log.user
      ? {
          ...log.user,
          id: log.user.id.toString(),
        }
      : null,
  };
}
