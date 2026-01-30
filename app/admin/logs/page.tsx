import { getLogs } from "@/lib/admin/logs";
import { getLogsStats24h } from "@/lib/admin/logs-stats";
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from "@/components/admin/Table";
import { Badge } from "@/components/admin/Badge";
import { LogsFilters } from "@/lib/admin/logs";
import { LogsFiltersClient } from "./LogsFiltersClient";
import { LogMeta } from "./LogMeta";
import type { Role } from "@/types/user";

interface PageProps {
  searchParams: {
    page?: string;
    action?: string;
    entity?: string;
    role?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

export default async function AdminLogsPage({ searchParams }: PageProps) {
  // Парсим параметры
  const page = parseInt(searchParams.page || "1", 10);
  const action = searchParams.action;
  const entity = searchParams.entity;
  const role = (searchParams.role as Role | "all") || "all";
  const userId = searchParams.userId;
  const dateFrom = searchParams.dateFrom ? new Date(searchParams.dateFrom) : undefined;
  const dateTo = searchParams.dateTo ? new Date(searchParams.dateTo) : undefined;

  // Фильтры
  const filters: LogsFilters = {
    action,
    entity,
    role: role !== "all" ? role : undefined,
    userId,
    dateFrom,
    dateTo,
  };

  // Получаем логи и статистику параллельно
  const [result, stats] = await Promise.all([
    getLogs(filters, { page, pageSize: 50 }),
    getLogsStats24h(),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Логи действий</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Всего: {result.total} | Страница {result.page} из {result.totalPages}
        </div>
      </div>

      {/* Dashboard метрики */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Логов за 24ч</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.logsToday}</p>
            </div>
            <div className="text-2xl">📊</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Действий админов</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.adminActionsToday}
              </p>
            </div>
            <div className="text-2xl">👑</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Активных админов</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.distinctActiveAdmins}
              </p>
            </div>
            <div className="text-2xl">👥</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Топ действий (24ч)</p>
            <div className="space-y-1">
              {stats.actionsByType.slice(0, 3).map((item) => (
                <div key={item.action} className="flex justify-between text-xs">
                  <span className="text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                    {item.action}
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="mb-6">
        <LogsFiltersClient
          currentAction={action}
          currentEntity={entity}
          currentRole={role}
          currentUserId={userId}
          currentDateFrom={searchParams.dateFrom}
          currentDateTo={searchParams.dateTo}
        />
      </div>

      {/* Таблица */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <Table>
          <TableHead>
            <TableHeader>Дата</TableHeader>
            <TableHeader>Пользователь</TableHeader>
            <TableHeader>Роль</TableHeader>
            <TableHeader>Действие</TableHeader>
            <TableHeader>Сущность</TableHeader>
            <TableHeader>IP</TableHeader>
            <TableHeader>User Agent</TableHeader>
            <TableHeader>Метаданные</TableHeader>
          </TableHead>
          <TableBody>
            {result.logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-gray-500 dark:text-gray-400">
                  Логи не найдены
                </TableCell>
              </TableRow>
            ) : (
              result.logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs">
                    {new Date(log.createdAt).toLocaleString("ru-RU", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    {log.user ? (
                      <div>
                        <div className="font-medium">{log.user.firstName}</div>
                        {log.user.username && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">@{log.user.username}</div>
                        )}
                        {log.userId && (
                          <div className="text-xs font-mono text-gray-400 dark:text-gray-500">{log.userId}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">System</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.role === "superadmin"
                          ? "danger"
                          : log.role === "admin"
                          ? "warning"
                          : "default"
                      }
                    >
                      {log.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {log.action}
                    </code>
                  </TableCell>
                  <TableCell>
                    {log.entity ? (
                      <div>
                        <div>{log.entity}</div>
                        {log.entityId && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {log.entityId}
                          </div>
                        )}
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-mono">{log.ip}</TableCell>
                  <TableCell className="text-xs max-w-xs truncate" title={log.userAgent}>
                    {log.userAgent}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <LogMeta meta={log.meta} />
                      <Link
                        href={`/admin/logs/${log.id}`}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        title="Подробнее"
                      >
                        →
                      </Link>
                    </div>
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
}
