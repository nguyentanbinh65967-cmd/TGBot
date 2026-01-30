/**
 * Примеры использования БД
 * 
 * Этот файл содержит примеры для обоих ORM (Prisma и Drizzle).
 * Выберите нужный вариант в зависимости от вашего выбора.
 */

// ============================================
// PRISMA EXAMPLES
// ============================================

/**
 * Пример 1: Получить пользователя по Telegram ID
 */
async function example1_getUser_Prisma() {
  const { db } = await import("@/lib/db/prisma");

  const user = await db.user.findUnique({
    where: { id: BigInt(123456789) },
  });

  console.log("User:", user);
}

/**
 * Пример 2: Создать или обновить пользователя
 */
async function example2_upsertUser_Prisma() {
  const { db } = await import("@/lib/db/prisma");

  const user = await db.user.upsert({
    where: { id: BigInt(123456789) },
    update: {
      firstName: "John",
      lastName: "Doe",
      lastLoginAt: new Date(),
    },
    create: {
      id: BigInt(123456789),
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      role: "user",
    },
  });

  console.log("User upserted:", user);
}

/**
 * Пример 3: Получить пользователей с определенной ролью
 */
async function example3_getUsersByRole_Prisma() {
  const { db } = await import("@/lib/db/prisma");
  const { Role } = await import("@prisma/client");

  const admins = await db.user.findMany({
    where: {
      role: {
        in: [Role.admin, Role.superadmin],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log("Admins:", admins);
}

/**
 * Пример 4: Записать лог действия
 */
async function example4_logAction_Prisma() {
  const { db } = await import("@/lib/db/prisma");

  await db.log.create({
    data: {
      userId: BigInt(123456789),
      role: "admin",
      action: "user.created",
      entity: "user",
      entityId: "987654321",
      ip: "192.168.1.1",
      userAgent: "Mozilla/5.0...",
      meta: {
        additional: "data",
      },
    },
  });

  console.log("Log created");
}

/**
 * Пример 5: Получить логи пользователя
 */
async function example5_getUserLogs_Prisma() {
  const { db } = await import("@/lib/db/prisma");

  const logs = await db.log.findMany({
    where: {
      userId: BigInt(123456789),
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
    include: {
      user: {
        select: {
          firstName: true,
          username: true,
        },
      },
    },
  });

  console.log("Logs:", logs);
}

// ============================================
// DRIZZLE EXAMPLES
// ============================================

/**
 * Пример 1: Получить пользователя по Telegram ID
 */
async function example1_getUser_Drizzle() {
  const { db } = await import("@/lib/db/drizzle");
  const { eq } = await import("drizzle-orm");

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, BigInt(123456789)),
  });

  console.log("User:", user);
}

/**
 * Пример 2: Создать или обновить пользователя
 */
async function example2_upsertUser_Drizzle() {
  const { db } = await import("@/lib/db/drizzle");
  const { users } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");

  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, BigInt(123456789)),
  });

  if (existingUser) {
    await db
      .update(users)
      .set({
        firstName: "John",
        lastName: "Doe",
        lastLoginAt: new Date(),
      })
      .where(eq(users.id, BigInt(123456789)));
  } else {
    await db.insert(users).values({
      id: BigInt(123456789),
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      role: "user",
    });
  }
}

/**
 * Пример 3: Получить пользователей с определенной ролью
 */
async function example3_getUsersByRole_Drizzle() {
  const { db } = await import("@/lib/db/drizzle");
  const { users } = await import("@/db/schema");
  const { inArray } = await import("drizzle-orm");

  const admins = await db.query.users.findMany({
    where: (users, { inArray }) => inArray(users.role, ["admin", "superadmin"]),
    orderBy: (users, { desc }) => [desc(users.createdAt)],
  });

  console.log("Admins:", admins);
}

/**
 * Пример 4: Записать лог действия
 */
async function example4_logAction_Drizzle() {
  const { db } = await import("@/lib/db/drizzle");
  const { logs } = await import("@/db/schema");

  await db.insert(logs).values({
    userId: BigInt(123456789),
    role: "admin",
    action: "user.created",
    entity: "user",
    entityId: "987654321",
    ip: "192.168.1.1",
    userAgent: "Mozilla/5.0...",
    meta: {
      additional: "data",
    },
  });

  console.log("Log created");
}

/**
 * Пример 5: Получить логи пользователя
 */
async function example5_getUserLogs_Drizzle() {
  const { db } = await import("@/lib/db/drizzle");
  const { logs } = await import("@/db/schema");
  const { eq, desc } = await import("drizzle-orm");

  const result = await db.query.logs.findMany({
    where: (logs, { eq }) => eq(logs.userId, BigInt(123456789)),
    orderBy: (logs, { desc }) => [desc(logs.createdAt)],
    limit: 50,
    with: {
      user: {
        columns: {
          firstName: true,
          username: true,
        },
      },
    },
  });

  console.log("Logs:", result);
}

// ============================================
// ИНТЕГРАЦИЯ С СУЩЕСТВУЮЩИМ КОДОМ
// ============================================

/**
 * Пример: Использование в API Route с Prisma
 */
export async function example_apiRoute_Prisma(request: Request) {
  const { db } = await import("@/lib/db/prisma");
  const { validateInitData } = await import("@/lib/auth");
  const { getUserRole } = await import("@/config/rbac.db.prisma");

  // Получаем initData из запроса
  const { initData } = await request.json();

  // Валидируем initData
  const user = validateInitData(initData);

  // Получаем роль из БД
  const role = await getUserRole(user);

  // Создаем или обновляем пользователя
  await db.user.upsert({
    where: { id: BigInt(user.id) },
    update: {
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      photoUrl: user.photo_url,
      lastLoginAt: new Date(),
    },
    create: {
      id: BigInt(user.id),
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      photoUrl: user.photo_url,
      role: "user",
    },
  });

  return { user, role };
}

/**
 * Пример: Использование в API Route с Drizzle
 */
export async function example_apiRoute_Drizzle(request: Request) {
  const { validateInitData } = await import("@/lib/auth");
  const { getUserRole, upsertUser } = await import("@/config/rbac.db.drizzle");

  // Получаем initData из запроса
  const { initData } = await request.json();

  // Валидируем initData
  const telegramUser = validateInitData(initData);

  // Создаем или обновляем пользователя
  await upsertUser(telegramUser);

  // Получаем роль из БД
  const role = await getUserRole(telegramUser);

  return { user: telegramUser, role };
}
