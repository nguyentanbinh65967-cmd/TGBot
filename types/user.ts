/**
 * Типы для пользователей и ролей
 */

/**
 * Роли пользователей в системе
 * - guest: неавторизованный пользователь
 * - user: обычный пользователь
 * - admin: администратор
 * - superadmin: суперадминистратор
 */
export type Role = "guest" | "user" | "admin" | "superadmin";

/**
 * @deprecated Используйте Role вместо UserRole
 * Оставлено для обратной совместимости
 */
export type UserRole = "admin" | "user";

export interface User {
  id: number;
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResult {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: {
    id: number;
    firstName: string;
    username?: string;
    role: UserRole;
  } | null;
  error?: string;
}

/**
 * Схема таблицы для БД (PostgreSQL пример)
 * 
 * CREATE TABLE users (
 *   id SERIAL PRIMARY KEY,
 *   telegram_id BIGINT UNIQUE NOT NULL,
 *   first_name VARCHAR(255) NOT NULL,
 *   last_name VARCHAR(255),
 *   username VARCHAR(255),
 *   role VARCHAR(20) NOT NULL DEFAULT 'user',
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 * 
 * CREATE INDEX idx_users_telegram_id ON users(telegram_id);
 * CREATE INDEX idx_users_role ON users(role);
 */
