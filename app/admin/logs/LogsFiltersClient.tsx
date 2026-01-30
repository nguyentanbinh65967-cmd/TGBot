"use client";

/**
 * Client компонент для фильтров логов
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface LogsFiltersClientProps {
  currentAction?: string;
  currentEntity?: string;
  currentRole: string;
  currentUserId?: string;
  currentDateFrom?: string;
  currentDateTo?: string;
}

export function LogsFiltersClient({
  currentAction,
  currentEntity,
  currentRole,
  currentUserId,
  currentDateFrom,
  currentDateTo,
}: LogsFiltersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [action, setAction] = useState(currentAction || "");
  const [entity, setEntity] = useState(currentEntity || "");
  const [role, setRole] = useState(currentRole);
  const [userId, setUserId] = useState(currentUserId || "");
  const [dateFrom, setDateFrom] = useState(currentDateFrom || "");
  const [dateTo, setDateTo] = useState(currentDateTo || "");

  const applyFilters = () => {
    const params = new URLSearchParams();
    params.delete("page"); // Сбрасываем страницу при изменении фильтров

    if (action) {
      params.set("action", action);
    }

    if (entity) {
      params.set("entity", entity);
    }

    if (role && role !== "all") {
      params.set("role", role);
    }

    if (userId) {
      params.set("userId", userId);
    }

    if (dateFrom) {
      params.set("dateFrom", dateFrom);
    }

    if (dateTo) {
      params.set("dateTo", dateTo);
    }

    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    setAction("");
    setEntity("");
    setRole("all");
    setUserId("");
    setDateFrom("");
    setDateTo("");
    router.push("/admin/logs");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Действие</label>
          <input
            type="text"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="user.created или user.*"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Сущность</label>
          <input
            type="text"
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            placeholder="user, settings..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Роль</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
          >
            <option value="all">Все</option>
            <option value="user">user</option>
            <option value="admin">admin</option>
            <option value="superadmin">superadmin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User ID</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="123456789"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">От</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">До</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={applyFilters}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Применить
        </button>
        <button
          onClick={clearFilters}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Сбросить
        </button>
      </div>
    </div>
  );
}
