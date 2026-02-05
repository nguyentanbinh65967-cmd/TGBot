import { getUsers, isSuperAdmin } from "@/lib/admin/users";
import { toggleUserBlock, changeUserRole } from "./actions";
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from "@/components/admin/Table";
import { Badge } from "@/components/admin/Badge";
import { UsersFilters, UsersSort } from "@/lib/admin/users";
import { headers } from "next/headers";
import { UserActions } from "./UserActions";
import { UsersFiltersClient } from "./UsersFiltersClient";
import type { Role } from "@/types/user";

interface PageProps {
  searchParams: {
    page?: string;
    role?: string;
    isBlocked?: string;
    lastLoginDays?: string;
    sort?: string;
  };
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  try {
    // Инициализируем базу данных, если она не существует
    const { ensureDatabaseInitialized } = await import("@/lib/db/init-db");
    await ensureDatabaseInitialized().catch((err) => {
      console.warn("Database initialization warning:", err);
    });

    // Получаем текущего пользователя из headers
    const headersList = await headers();
    const currentUserId = headersList.get("x-user-id");
    const currentUserRole = headersList.get("x-user-role");

    if (!currentUserId) {
      return <div>Unauthorized</div>;
    }

    // Для десктоп-админа или dev-админа считаем суперадмином
    const isDesktopAdmin = currentUserId === "desktop-admin" || currentUserId === "0";
    const isCurrentUserSuperAdmin = isDesktopAdmin 
      ? true 
      : await isSuperAdmin(currentUserId).catch(() => false);

  // Парсим параметры
  const page = parseInt(searchParams.page || "1", 10);
  const role = (searchParams.role as any) || "all";
  const isBlocked = searchParams.isBlocked === "true" ? true : searchParams.isBlocked === "false" ? false : "all";
  const lastLoginDays = searchParams.lastLoginDays ? parseInt(searchParams.lastLoginDays, 10) : undefined;

  // Парсим сортировку
  const sortParam = searchParams.sort || "lastLoginAt-desc";
  const [sortField, sortOrder] = sortParam.split("-");
  const sort: UsersSort = {
    field: (sortField === "createdAt" ? "createdAt" : "lastLoginAt") as "lastLoginAt" | "createdAt",
    order: (sortOrder === "asc" ? "asc" : "desc") as "asc" | "desc",
  };

  // Фильтры
  const filters: UsersFilters = {
    role: role !== "all" ? role : undefined,
    isBlocked: isBlocked !== "all" ? isBlocked : undefined,
    lastLoginDays,
  };

    // Получаем пользователей
    const result = await getUsers(filters, sort, { page, pageSize: 20 });

    return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Пользователи</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Всего: {result.total} | Страница {result.page} из {result.totalPages}
        </div>
      </div>

      {/* Фильтры */}
      <div className="mb-6">
        <UsersFiltersClient
          currentRole={role}
          currentIsBlocked={isBlocked}
          currentLastLoginDays={lastLoginDays?.toString()}
        />
      </div>

      {/* Таблица */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <Table>
          <TableHead>
            <TableHeader>Telegram ID</TableHeader>
            <TableHeader>Username</TableHeader>
            <TableHeader>Имя</TableHeader>
            <TableHeader>
              <a
                href={`?${new URLSearchParams({
                  ...searchParams,
                  sort: sort.field === "lastLoginAt" && sort.order === "desc" ? "lastLoginAt-asc" : "lastLoginAt-desc",
                }).toString()}`}
                className="hover:underline"
              >
                Роль {sort.field === "lastLoginAt" && (sort.order === "desc" ? "↓" : "↑")}
              </a>
            </TableHeader>
            <TableHeader>Статус</TableHeader>
            <TableHeader>
              <a
                href={`?${new URLSearchParams({
                  ...searchParams,
                  sort: sort.field === "createdAt" && sort.order === "desc" ? "createdAt-asc" : "createdAt-desc",
                }).toString()}`}
                className="hover:underline"
              >
                Последний вход {sort.field === "createdAt" && (sort.order === "desc" ? "↓" : "↑")}
              </a>
            </TableHeader>
            <TableHeader>Создан</TableHeader>
            <TableHeader>Действия</TableHeader>
          </TableHead>
          <TableBody>
            {result.users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-gray-500 dark:text-gray-400">
                  Пользователи не найдены
                </TableCell>
              </TableRow>
            ) : (
              result.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs">{user.id}</TableCell>
                  <TableCell>{user.username ? `@${user.username}` : "—"}</TableCell>
                  <TableCell>
                    {user.firstName} {user.lastName || ""}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === "superadmin"
                          ? "danger"
                          : user.role === "admin"
                          ? "warning"
                          : "default"
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isBlocked ? "danger" : "success"}>
                      {user.isBlocked ? "Заблокирован" : "Активен"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString("ru-RU", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Никогда"}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                  </TableCell>
                  <TableCell>
                    <UserActions
                      userId={user.id}
                      currentRole={user.role}
                      isBlocked={user.isBlocked}
                      canChangeRole={isCurrentUserSuperAdmin && currentUserId !== user.id}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Пагинация */}
      {result.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {result.page > 1 && (
            <a
              href={`?${new URLSearchParams({
                ...searchParams,
                page: (result.page - 1).toString(),
              }).toString()}`}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Назад
            </a>
          )}
          <span className="px-4 py-2">
            Страница {result.page} из {result.totalPages}
          </span>
          {result.page < result.totalPages && (
            <a
              href={`?${new URLSearchParams({
                ...searchParams,
                page: (result.page + 1).toString(),
              }).toString()}`}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Вперед
            </a>
          )}
        </div>
      )}
    </div>
    );
  } catch (error: any) {
    console.error("Error loading users page:", error);
    const errorMessage = error?.message || "Не удалось загрузить список пользователей";
    const isDatabaseError = errorMessage.includes("Unable to open the database file") || 
                           errorMessage.includes("database file") ||
                           errorMessage.includes("DATABASE_URL");
    
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Ошибка загрузки пользователей
          </h2>
          <p className="text-red-700 dark:text-red-300 mb-4">
            {errorMessage}
          </p>
          {isDatabaseError && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                <strong>Проблема с базой данных:</strong>
              </p>
              <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>База данных не была создана во время build</li>
                <li>Проверьте логи Vercel build для ошибок в <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">vercel-build</code></li>
                <li>Убедитесь, что <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">DATABASE_URL</code> установлен в Vercel Environment Variables</li>
                <li>Для production рекомендуется использовать PostgreSQL вместо SQLite</li>
              </ul>
            </div>
          )}
          {process.env.NODE_ENV === "development" && error?.stack && (
            <div className="bg-white dark:bg-gray-800 rounded p-4 mt-4">
              <p className="text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {error.stack}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
}
