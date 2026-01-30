import { getLogById } from "@/lib/admin/logs-stats";
import { Badge } from "@/components/admin/Badge";
import { LogMeta } from "../LogMeta";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function LogDetailPage({ params }: PageProps) {
  const logId = parseInt(params.id, 10);

  if (isNaN(logId)) {
    notFound();
  }

  const log = await getLogById(logId);

  if (!log) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/logs"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          ← Назад к логам
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Детали лога #{log.id}</h1>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Дата и время</label>
            <p className="text-base text-gray-900 dark:text-white mt-1">
              {new Date(log.createdAt).toLocaleString("ru-RU", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                timeZoneName: "short",
              })}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Пользователь</label>
            {log.user ? (
              <div className="mt-1">
                <p className="text-base text-gray-900 dark:text-white font-medium">
                  {log.user.firstName} {log.user.lastName || ""}
                </p>
                {log.user.username && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">@{log.user.username}</p>
                )}
                <p className="text-xs font-mono text-gray-500 dark:text-gray-500 mt-1">
                  ID: {log.userId}
                </p>
                <Badge
                  variant={
                    log.user.role === "superadmin"
                      ? "danger"
                      : log.user.role === "admin"
                      ? "warning"
                      : "default"
                  }
                  className="mt-2"
                >
                  {log.user.role}
                </Badge>
              </div>
            ) : (
              <p className="text-base text-gray-500 dark:text-gray-400 mt-1">System</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Роль на момент действия</label>
            <div className="mt-1">
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
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Действие</label>
            <p className="text-base font-mono text-gray-900 dark:text-white mt-1 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
              {log.action}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Сущность</label>
            {log.entity ? (
              <div className="mt-1">
                <p className="text-base text-gray-900 dark:text-white">{log.entity}</p>
                {log.entityId && (
                  <p className="text-sm font-mono text-gray-600 dark:text-gray-400 mt-1">
                    ID: {log.entityId}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-base text-gray-500 dark:text-gray-400 mt-1">—</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">IP адрес</label>
            <p className="text-base font-mono text-gray-900 dark:text-white mt-1">{log.ip}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">User Agent</label>
            <p className="text-sm text-gray-900 dark:text-white mt-1 break-all">{log.userAgent}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Метаданные</label>
            <div className="mt-2">
              <LogMeta meta={log.meta} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
