"use client";

/**
 * Client компонент для фильтров пользователей
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface UsersFiltersClientProps {
  currentRole: string;
  currentIsBlocked: string | boolean;
  currentLastLoginDays?: string;
}

export function UsersFiltersClient({
  currentRole,
  currentIsBlocked,
  currentLastLoginDays,
}: UsersFiltersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState(currentRole);
  const [isBlocked, setIsBlocked] = useState(
    typeof currentIsBlocked === "boolean" ? currentIsBlocked.toString() : currentIsBlocked
  );
  const [lastLoginDays, setLastLoginDays] = useState(currentLastLoginDays || "");

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page"); // Сбрасываем страницу при изменении фильтров

    if (role && role !== "all") {
      params.set("role", role);
    } else {
      params.delete("role");
    }

    if (isBlocked && isBlocked !== "all") {
      params.set("isBlocked", isBlocked);
    } else {
      params.delete("isBlocked");
    }

    if (lastLoginDays) {
      params.set("lastLoginDays", lastLoginDays);
    } else {
      params.delete("lastLoginDays");
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Роль</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Все</option>
            <option value="user">user</option>
            <option value="admin">admin</option>
            <option value="superadmin">superadmin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Статус</label>
          <select
            value={isBlocked}
            onChange={(e) => setIsBlocked(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Все</option>
            <option value="false">Активен</option>
            <option value="true">Заблокирован</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Активен за последние (дней)
          </label>
          <input
            type="number"
            value={lastLoginDays}
            onChange={(e) => setLastLoginDays(e.target.value)}
            placeholder="Например: 7"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={applyFilters}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
}
