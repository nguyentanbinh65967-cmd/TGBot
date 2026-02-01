/**
 * Реэкспорт клиентских функций авторизации для обратной совместимости
 * 
 * ВАЖНО: Этот файл реэкспортирует только клиентские функции из lib/auth/client.ts
 * для обратной совместимости. Серверные функции (validateInitData) должны импортироваться
 * напрямую из @/lib/auth/server.
 * 
 * Новый код должен импортировать напрямую из:
 * - @/lib/auth/client - для Client Components
 * - @/lib/auth/server - для Server Components, API Routes, Middleware
 */

// Клиентские функции (без node:crypto)
export {
  checkAuth,
  isAdmin,
  getUserRole,
  hasAdminAccess,
} from "./auth/client";

// Серверные функции НЕ реэкспортируются, чтобы избежать включения node:crypto в клиентский бандл
// Импортируйте напрямую: import { validateInitData } from "@/lib/auth/server";
