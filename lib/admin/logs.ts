/**
 * Server-side helpers для просмотра логов аудита
 * 
 * ВСЕ функции работают на сервере и используют Prisma
 */

import { db } from "@/lib/db/prisma";
import type { Role } from "@/types/user";

export interface LogsFilters {
  action?: string; // exact или prefix
  entity?: string;
  role?: Role | "all";
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface LogsPagination {
  page: number;
  pageSize: number;
}

export interface LogsResult {
  logs: Array<{
    id: number;
    userId: string | null; // BigInt as string
    role: Role;
    action: string;
    entity: string | null;
    entityId: string | null;
    ip: string;
    userAgent: string;
    meta: any;
    createdAt: Date;
    user: {
      firstName: string;
      username: string | null;
    } | null;
  }>;
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Получить логи с фильтрацией и пагинацией
 */
export async function getLogs(
  filters: LogsFilters = {},
  pagination: LogsPagination = { page: 1, pageSize: 50 }
): Promise<LogsResult> {
  const { action, entity, role, userId, dateFrom, dateTo } = filters;
  const { page, pageSize } = pagination;

  // Строим where условие
  const where: any = {};

  if (action) {
    // Поддержка prefix поиска (с * или без)
    const trimmedAction = action.trim();
    if (trimmedAction.endsWith("*")) {
      const prefix = trimmedAction.slice(0, -1);
      where.action = {
        startsWith: prefix,
      };
    } else if (trimmedAction.endsWith("%")) {
      // Поддержка SQL-подобного wildcard
      const prefix = trimmedAction.slice(0, -1);
      where.action = {
        startsWith: prefix,
      };
    } else {
      where.action = trimmedAction;
    }
  }

  if (entity) {
    where.entity = entity;
  }

  if (role && role !== "all") {
    where.role = role;
  }

  if (userId) {
    where.userId = userId;
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      where.createdAt.gte = dateFrom;
    }
    if (dateTo) {
      where.createdAt.lte = dateTo;
    }
  }

  // Получаем общее количество
  const total = await db.log.count({ where });

  // Получаем логи с пользователями
  // Стабильная сортировка: createdAt DESC, id DESC (для консистентной пагинации)
  const logs = await db.log.findMany({
    where,
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      user: {
        select: {
          firstName: true,
          username: true,
        },
      },
    },
  });

  // Преобразуем meta из String (JSON) в объект, если нужно
  const serializedLogs = logs.map((log) => {
    let parsedMeta = log.meta;
    if (typeof log.meta === "string" && log.meta.trim()) {
      try {
        parsedMeta = JSON.parse(log.meta);
      } catch (e) {
        // Если не удалось распарсить, оставляем как строку
        parsedMeta = log.meta;
      }
    }
    return {
      ...log,
      userId: log.userId ? String(log.userId) : null,
      meta: parsedMeta,
    };
  });

  return {
    logs: serializedLogs,
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
  };
}
