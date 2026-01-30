/**
 * Drizzle ORM Schema для Telegram WebApp проекта
 * PostgreSQL Database
 * 
 * @see https://orm.drizzle.team/docs/overview
 */

import { pgTable, bigint, varchar, text, boolean, timestamp, jsonb, pgEnum, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// ENUMS
// ============================================

/**
 * Роли пользователей в системе
 * - user: обычный пользователь
 * - admin: администратор
 * - superadmin: суперадминистратор
 * 
 * Примечание: "guest" не хранится в БД, это роль для неавторизованных пользователей
 */
export const roleEnum = pgEnum("role", ["user", "admin", "superadmin"]);

// ============================================
// TABLES
// ============================================

/**
 * Пользователи Telegram WebApp
 * 
 * Основная таблица для хранения данных пользователей из Telegram.
 * Telegram ID используется как первичный ключ (bigint).
 */
export const users = pgTable(
  "users",
  {
    // Telegram User ID (используется как PK)
    id: bigint("id", { mode: "bigint" }).primaryKey(),

    // Telegram username (может быть null)
    username: varchar("username", { length: 255 }),

    // Имя пользователя из Telegram
    firstName: varchar("first_name", { length: 255 }).notNull(),

    // Фамилия пользователя из Telegram (может быть null)
    lastName: varchar("last_name", { length: 255 }),

    // URL фото профиля из Telegram (может быть null)
    photoUrl: varchar("photo_url", { length: 500 }),

    // Роль пользователя в системе
    role: roleEnum("role").notNull().default("user"),

    // Заблокирован ли пользователь
    isBlocked: boolean("is_blocked").notNull().default(false),

    // Дата создания записи
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),

    // Дата последнего обновления
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),

    // Дата последнего входа
    lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: "date" }),
  },
  (table) => ({
    // Индексы для оптимизации запросов
    roleIdx: index("idx_users_role").on(table.role),
    isBlockedIdx: index("idx_users_is_blocked").on(table.isBlocked),
    lastLoginAtIdx: index("idx_users_last_login_at").on(table.lastLoginAt),
  })
);

/**
 * Логи действий пользователей и администраторов (Audit Trail)
 * 
 * Таблица для логирования всех действий в системе.
 * Используется для аудита и отладки.
 */
export const logs = pgTable(
  "logs",
  {
    // ID лога (автоинкремент)
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),

    // ID пользователя, выполнившего действие (nullable для системных действий)
    userId: bigint("user_id", { mode: "bigint" }).references(() => users.id, {
      onDelete: "set null",
    }),

    // Роль пользователя на момент действия
    role: roleEnum("role").notNull(),

    // Тип действия (например: "user.created", "admin.access")
    action: varchar("action", { length: 100 }).notNull(),

    // Тип сущности, над которой выполнено действие (например: "user", "settings")
    entity: varchar("entity", { length: 100 }),

    // ID сущности, над которой выполнено действие
    entityId: varchar("entity_id", { length: 255 }),

    // IP адрес пользователя
    ip: varchar("ip", { length: 45 }).notNull(), // IPv6 может быть до 45 символов

    // User Agent браузера
    userAgent: text("user_agent").notNull(),

    // Дополнительные метаданные в формате JSON
    meta: jsonb("meta"),

    // Дата создания лога
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    // Индексы для оптимизации запросов
    userIdIdx: index("idx_logs_user_id").on(table.userId),
    actionIdx: index("idx_logs_action").on(table.action),
    entityIdx: index("idx_logs_entity").on(table.entity, table.entityId),
    createdAtIdx: index("idx_logs_created_at").on(table.createdAt),
    roleIdx: index("idx_logs_role").on(table.role),
  })
);

// ============================================
// RELATIONS
// ============================================

/**
 * Связи между таблицами
 */
export const usersRelations = relations(users, ({ many }) => ({
  logs: many(logs),
}));

export const logsRelations = relations(logs, ({ one }) => ({
  user: one(users, {
    fields: [logs.userId],
    references: [users.id],
  }),
}));

// ============================================
// TYPES
// ============================================

/**
 * Типы для TypeScript (автогенерируемые из схемы)
 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Log = typeof logs.$inferSelect;
export type NewLog = typeof logs.$inferInsert;
