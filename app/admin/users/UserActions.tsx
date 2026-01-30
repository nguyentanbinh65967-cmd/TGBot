"use client";

/**
 * Client компонент для действий с пользователями
 */

import { useState } from "react";
import { toggleUserBlock, changeUserRole } from "./actions";
import type { Role } from "@/types/user";

interface UserActionsProps {
  userId: string;
  currentRole: Role;
  isBlocked: boolean;
  canChangeRole: boolean;
}

export function UserActions({ userId, currentRole, isBlocked, canChangeRole }: UserActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggleBlock = async () => {
    if (!confirm(`Вы уверены, что хотите ${isBlocked ? "разблокировать" : "заблокировать"} этого пользователя?`)) {
      return;
    }

    setLoading("block");
    setError(null);

    try {
      await toggleUserBlock(userId);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при изменении статуса");
      setLoading(null);
    }
  };

  const handleChangeRole = async (newRole: Role) => {
    if (!confirm(`Вы уверены, что хотите изменить роль на "${newRole}"?`)) {
      return;
    }

    setLoading("role");
    setError(null);

    try {
      await changeUserRole(userId, newRole);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при изменении роли");
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleToggleBlock}
        disabled={loading !== null}
        className={`px-3 py-1 text-xs rounded ${
          isBlocked
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-red-600 hover:bg-red-700 text-white"
        } disabled:opacity-50`}
      >
        {loading === "block" ? "..." : isBlocked ? "Разблокировать" : "Заблокировать"}
      </button>

      {canChangeRole && (
        <select
          value={currentRole}
          onChange={(e) => handleChangeRole(e.target.value as Role)}
          disabled={loading !== null}
          className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 disabled:opacity-50"
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
          <option value="superadmin">superadmin</option>
        </select>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
