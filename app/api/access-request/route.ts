/**
 * API Route для запросов на доступ
 * POST /api/access-request - создать запрос на доступ
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { headers } from "next/headers";
import { validateInitData } from "@/lib/auth/server";

async function getUserId(request: Request): Promise<string | null> {
  // Сначала проверяем заголовок (для защищенных роутов через middleware)
  const headersList = await headers();
  const userIdFromHeader = headersList.get("x-user-id");
  
  if (userIdFromHeader && userIdFromHeader !== "desktop-admin" && userIdFromHeader !== "0") {
    return userIdFromHeader;
  }

  // Если заголовка нет, пытаемся получить initData из Authorization header
  try {
    const authHeader = headersList.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const initData = authHeader.slice(7).trim();
      if (initData) {
        const telegramUser = validateInitData(initData);
        return String(telegramUser.id);
      }
    }

    // Для POST запросов проверяем body
    if (request.method === "POST") {
      const body = await request.clone().json();
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

export async function POST(request: Request) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please provide initData." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message } = body;

    // Проверяем, существует ли пользователь, если нет - создаем
    let user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      // Получаем данные пользователя из initData для создания записи
      const headersList = await headers();
      const authHeader = headersList.get("authorization");
      let telegramUser = null;
      
      if (authHeader?.startsWith("Bearer ")) {
        const initData = authHeader.slice(7).trim();
        if (initData) {
          telegramUser = validateInitData(initData);
        }
      }

      if (!telegramUser) {
        return NextResponse.json(
          { success: false, error: "User data not found" },
          { status: 400 }
        );
      }

      // Создаем пользователя
      user = await db.user.create({
        data: {
          id: String(telegramUser.id),
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name || null,
          username: telegramUser.username || null,
          photoUrl: telegramUser.photo_url || null,
          role: "user",
          accessStatus: "pending",
        },
      });
    }

    // Проверяем, есть ли уже активный запрос
    const existingRequest = await db.accessRequest.findFirst({
      where: {
        userId,
        status: "pending",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { success: false, error: "У вас уже есть активный запрос на доступ" },
        { status: 400 }
      );
    }

    // Создаем новый запрос
    const accessRequest = await db.accessRequest.create({
      data: {
        userId,
        message: message || null,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      request: accessRequest,
      message: "Запрос на доступ успешно отправлен. Ожидайте одобрения администратора.",
    });
  } catch (error: any) {
    console.error("Error creating access request:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please provide initData." },
        { status: 401 }
      );
    }

    // Получаем последний запрос пользователя
    const accessRequest = await db.accessRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      request: accessRequest,
    });
  } catch (error: any) {
    console.error("Error fetching access request:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Ошибка сервера" },
      { status: 500 }
    );
  }
}
