/**
 * API Route для управления запросами на доступ (админ)
 * GET /api/admin/access-requests - получить все запросы
 * POST /api/admin/access-requests - обработать запрос (одобрить/отклонить)
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { headers } from "next/headers";

/**
 * Явно указываем Node.js runtime для работы с Prisma
 */
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const currentUserId = headersList.get("x-user-id");
    const currentUserRole = headersList.get("x-user-role");

    if (!currentUserId || (currentUserRole !== "admin" && currentUserRole !== "superadmin")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // pending, approved, rejected, all

    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }

    const requests = await db.accessRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            photoUrl: true,
            accessStatus: true,
            startCourseId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error: any) {
    console.error("Error fetching access requests:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const currentUserId = headersList.get("x-user-id");
    const currentUserRole = headersList.get("x-user-role");

    if (!currentUserId || (currentUserRole !== "admin" && currentUserRole !== "superadmin")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { requestId, action, courseId, comment } = body;

    if (!requestId || !action) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      );
    }

    // Получаем запрос
    const accessRequest = await db.accessRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!accessRequest) {
      return NextResponse.json(
        { success: false, error: "Request not found" },
        { status: 404 }
      );
    }

    if (accessRequest.status !== "pending") {
      return NextResponse.json(
        { success: false, error: "Request already processed" },
        { status: 400 }
      );
    }

    // Если одобряем, проверяем наличие курса
    if (action === "approve" && !courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID is required for approval" },
        { status: 400 }
      );
    }

    // Проверяем существование курса
    if (action === "approve") {
      const course = await db.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        return NextResponse.json(
          { success: false, error: "Course not found" },
          { status: 404 }
        );
      }
    }

    // Обновляем запрос и пользователя в транзакции
    await db.$transaction(async (tx) => {
      // Обновляем запрос
      await tx.accessRequest.update({
        where: { id: requestId },
        data: {
          status: action === "approve" ? "approved" : "rejected",
          processedBy: currentUserId,
          processedAt: new Date(),
          adminComment: comment || null,
        },
      });

      // Обновляем пользователя
      if (action === "approve") {
        await tx.user.update({
          where: { id: accessRequest.userId },
          data: {
            accessStatus: "approved",
            startCourseId: courseId,
            approvedAt: new Date(),
            approvedBy: currentUserId,
          },
        });
      } else {
        await tx.user.update({
          where: { id: accessRequest.userId },
          data: {
            accessStatus: "rejected",
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: action === "approve" ? "Запрос одобрен" : "Запрос отклонен",
    });
  } catch (error: any) {
    console.error("Error processing access request:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Ошибка сервера" },
      { status: 500 }
    );
  }
}
