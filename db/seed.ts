/**
 * Drizzle Seed для начальных данных
 * 
 * Запуск: tsx db/seed.ts
 * 
 * Или через package.json:
 * "scripts": {
 *   "db:seed": "tsx db/seed.ts"
 * }
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "./schema";

// Подключение к БД
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
  console.log("🌱 Seeding database...");

  // Получаем ID суперадминов из переменных окружения
  const superadminIds = process.env.SUPERADMIN_IDS
    ? process.env.SUPERADMIN_IDS.split(",").map((id) => BigInt(id.trim()))
    : [];

  const adminIds = process.env.ADMIN_IDS
    ? process.env.ADMIN_IDS.split(",").map((id) => BigInt(id.trim()))
    : [];

  // Создаем суперадминов (если их еще нет)
  for (const id of superadminIds) {
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    });

    if (!existingUser) {
      await db.insert(users).values({
        id,
        firstName: "Superadmin",
        role: "superadmin",
        username: `superadmin_${id}`,
      });
      console.log(`✅ Created superadmin: ${id}`);
    } else {
      // Обновляем роль, если пользователь уже существует
      if (existingUser.role !== "superadmin") {
        await db
          .update(users)
          .set({ role: "superadmin" })
          .where((users, { eq }) => eq(users.id, id));
        console.log(`🔄 Updated user ${id} to superadmin`);
      }
    }
  }

  // Создаем админов (если их еще нет)
  for (const id of adminIds) {
    // Пропускаем, если уже суперадмин
    if (superadminIds.includes(id)) {
      continue;
    }

    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    });

    if (!existingUser) {
      await db.insert(users).values({
        id,
        firstName: "Admin",
        role: "admin",
        username: `admin_${id}`,
      });
      console.log(`✅ Created admin: ${id}`);
    } else {
      // Обновляем роль, если пользователь уже существует и не суперадмин
      if (existingUser.role !== "superadmin" && existingUser.role !== "admin") {
        await db
          .update(users)
          .set({ role: "admin" })
          .where((users, { eq }) => eq(users.id, id));
        console.log(`🔄 Updated user ${id} to admin`);
      }
    }
  }

  console.log("✨ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await client.end();
  });
