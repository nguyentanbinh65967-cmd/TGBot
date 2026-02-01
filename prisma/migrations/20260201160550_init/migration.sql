/*
  Warnings:

  - You are about to alter the column `is_blocked` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT '',
    "username" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "photo_url" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "last_login_at" DATETIME
);
INSERT INTO "new_users" ("created_at", "first_name", "id", "is_blocked", "last_login_at", "last_name", "photo_url", "role", "updated_at", "username") SELECT "created_at", "first_name", "id", "is_blocked", "last_login_at", "last_name", "photo_url", "role", "updated_at", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE INDEX "idx_users_role" ON "users"("role");
CREATE INDEX "idx_users_is_blocked" ON "users"("is_blocked");
CREATE INDEX "idx_users_last_login_at" ON "users"("last_login_at");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
