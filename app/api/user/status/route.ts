/**
 * API Route для получения статуса пользователя
 * GET /api/user/status - получить статус доступа пользователя
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { headers } from "next/headers";

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
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
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
