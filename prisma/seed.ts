/**
 * Prisma Seed для начальных данных
 * 
 * Запуск: npx prisma db seed
 * 
 * Или через package.json:
 * "prisma": {
 *   "seed": "ts-node prisma/seed.ts"
 * }
 */

import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

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
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          id,
          firstName: "Superadmin",
          role: Role.superadmin,
          username: `superadmin_${id}`,
        },
      });
      console.log(`✅ Created superadmin: ${id}`);
    } else {
      // Обновляем роль, если пользователь уже существует
      if (existingUser.role !== Role.superadmin) {
        await prisma.user.update({
          where: { id },
          data: { role: Role.superadmin },
        });
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

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          id,
          firstName: "Admin",
          role: Role.admin,
          username: `admin_${id}`,
        },
      });
      console.log(`✅ Created admin: ${id}`);
    } else {
      // Обновляем роль, если пользователь уже существует и не суперадмин
      if (existingUser.role !== Role.superadmin && existingUser.role !== Role.admin) {
        await prisma.user.update({
          where: { id },
          data: { role: Role.admin },
        });
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
    await prisma.$disconnect();
  });
