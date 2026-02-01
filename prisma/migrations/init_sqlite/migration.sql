-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "photo_url" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "is_blocked" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "last_login_at" DATETIME
);

-- CreateTable
CREATE TABLE "logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT,
    "role" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entity_id" TEXT,
    "ip" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "meta" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "idx_users_role" ON "users"("role");

-- CreateIndex
CREATE INDEX "idx_users_is_blocked" ON "users"("is_blocked");

-- CreateIndex
CREATE INDEX "idx_users_last_login_at" ON "users"("last_login_at");

-- CreateIndex
CREATE INDEX "idx_logs_user_id" ON "logs"("user_id");

-- CreateIndex
CREATE INDEX "idx_logs_action" ON "logs"("action");

-- CreateIndex
CREATE INDEX "idx_logs_entity" ON "logs"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "idx_logs_created_at" ON "logs"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_logs_role" ON "logs"("role");
