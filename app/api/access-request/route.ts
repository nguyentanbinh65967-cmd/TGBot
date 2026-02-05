/**
 * API Route для запросов на доступ
 * POST /api/access-request - создать запрос на доступ
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    
    if (!userId || userId === "desktop-admin" || userId === "0") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message } = body;

    // Проверяем, существует ли пользователь
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
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
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    
    if (!userId || userId === "desktop-admin" || userId === "0") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
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
