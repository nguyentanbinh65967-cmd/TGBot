/**
 * Server-side helpers для управления пользователями
 * 
 * ВСЕ функции работают на сервере и используют Prisma
 */

import { db } from "@/lib/db/prisma";
import type { Role } from "@/types/user";

export interface UsersFilters {
  role?: Role | "all";
  isBlocked?: boolean | "all";
  lastLoginDays?: number; // Активен в последние N дней
}

export interface UsersSort {
  field: "lastLoginAt" | "createdAt";
  order: "asc" | "desc";
}

export interface UsersPagination {
  page: number;
  pageSize: number;
}

export interface UsersResult {
  users: Array<{
    id: string; // BigInt as string
    username: string | null;
    firstName: string;
    lastName: string | null;
    role: Role;
    isBlocked: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
  }>;
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Получить список пользователей с фильтрацией, сортировкой и пагинацией
 */
export async function getUsers(
  filters: UsersFilters = {},
  sort: UsersSort = { field: "lastLoginAt", order: "desc" },
  pagination: UsersPagination = { page: 1, pageSize: 20 }
): Promise<UsersResult> {
  const { role, isBlocked, lastLoginDays } = filters;
  const { field, order } = sort;
  const { page, pageSize } = pagination;

  // Строим where условие
  const where: any = {};

  if (role && role !== "all") {
    where.role = role;
  }

  if (isBlocked !== undefined && isBlocked !== "all") {
    where.isBlocked = isBlocked;
  }

  if (lastLoginDays !== undefined) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - lastLoginDays);
    where.lastLoginAt = {
      gte: dateThreshold,
    };
  }

  // Получаем общее количество
  const total = await db.user.count({ where });

  // Получаем пользователей
  const users = await db.user.findMany({
    where,
    orderBy: {
      [field]: order,
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      role: true,
      isBlocked: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  // Преобразуем BigInt в string для сериализации
  const serializedUsers = users.map((user) => ({
    ...user,
    id: user.id.toString(),
  }));

  return {
    users: serializedUsers,
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Получить пользователя по ID
 */
export async function getUserById(userId: string) {
  const user = await db.user.findUnique({
    where: { id: BigInt(userId) },
  });

  if (!user) {
    return null;
  }

  return {
    ...user,
    id: user.id.toString(),
  };
}

/**
 * Проверить, является ли пользователь суперадминистратором
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: BigInt(userId) },
    select: { role: true },
  });

  return user?.role === "superadmin";
}
