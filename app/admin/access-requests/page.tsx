import { db } from "@/lib/db/prisma";
import { headers } from "next/headers";
import { AccessRequestsManager } from "./AccessRequestsManager";

export default async function AdminAccessRequestsPage() {
  const headersList = await headers();
  const currentUserId = headersList.get("x-user-id");
  const currentUserRole = headersList.get("x-user-role");

  if (!currentUserId || (currentUserRole !== "admin" && currentUserRole !== "superadmin")) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">
            Недостаточно прав
          </h2>
          <p className="text-red-700 dark:text-red-300 mt-2">
            У вас нет прав для доступа к этой странице.
          </p>
        </div>
      </div>
    );
  }

  try {
    // Получаем все запросы
    const requests = await db.accessRequest.findMany({
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

    // Получаем все курсы для выбора начального курса
    const courses = await db.course.findMany({
      where: { isActive: true },
      include: {
        direction: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { direction: { order: "asc" } },
        { order: "asc" },
      ],
    });

    return <AccessRequestsManager initialRequests={requests} courses={courses} />;
  } catch (error: any) {
    console.error("Error loading access requests:", error);
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Ошибка загрузки запросов
          </h2>
          <p className="text-red-700 dark:text-red-300">
            {error?.message || "Не удалось загрузить запросы на доступ. Проверьте настройки базы данных."}
          </p>
        </div>
      </div>
    );
  }
}
