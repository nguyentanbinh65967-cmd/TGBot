/**
 * API Route для получения статуса пользователя
 * GET /api/user/status - получить статус доступа пользователя
 * POST /api/user/status - получить статус доступа пользователя (с initData в body)
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { headers } from "next/headers";
import { validateInitData } from "@/lib/auth/server";

/**
 * Явно указываем Node.js runtime для использования node:crypto в validateInitData
 */
export const runtime = "nodejs";

async function getUserId(request: Request): Promise<string | null> {
  // Сначала проверяем заголовок (для защищенных роутов через middleware)
  const headersList = await headers();
  const userIdFromHeader = headersList.get("x-user-id");
  
  if (userIdFromHeader && userIdFromHeader !== "desktop-admin" && userIdFromHeader !== "0") {
    return userIdFromHeader;
  }

  // Если заголовка нет, пытаемся получить initData из body (POST) или query (GET)
  try {
    const url = new URL(request.url);
    const initDataFromQuery = url.searchParams.get("initData");
    
    if (initDataFromQuery) {
      const telegramUser = validateInitData(initDataFromQuery);
      return String(telegramUser.id);
    }

    // Для POST запросов проверяем body
    if (request.method === "POST") {
      const body = await request.json();
      if (body?.initData) {
        const telegramUser = validateInitData(body.initData);
        return String(telegramUser.id);
      }
    }
  } catch (error) {
    // Игнорируем ошибки валидации initData
    console.warn("Error validating initData:", error);
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please provide initData or be authenticated." },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        accessStatus: true,
        startCourseId: true,
        isBlocked: true,
      },
    });

    if (!user) {
      // Если пользователя нет в БД, возвращаем pending статус
      return NextResponse.json({
        success: true,
        user: {
          accessStatus: "pending" as const,
          startCourseId: null,
          isBlocked: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        accessStatus: user.accessStatus,
        startCourseId: user.startCourseId,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error: any) {
    console.error("Error fetching user status:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
