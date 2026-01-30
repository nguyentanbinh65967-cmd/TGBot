/**
 * Drizzle Client для работы с БД
 * 
 * Использование:
 * import { db } from "@/lib/db/drizzle";
 * 
 * const user = await db.query.users.findFirst({
 *   where: (users, { eq }) => eq(users.id, BigInt(123456789))
 * });
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
