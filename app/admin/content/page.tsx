import { db } from "@/lib/db/prisma";
import { ContentManager } from "./ContentManager";

export default async function AdminContentPage() {
  try {
    // Загружаем все направления с курсами и уроками
    const directions = await db.direction.findMany({
      include: {
        courses: {
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    return <ContentManager initialDirections={directions} />;
  } catch (error: any) {
    console.error("Error loading content:", error);
    
    // Если Prisma Client не перегенерирован, показываем сообщение
    if (
      error?.message?.includes("direction") || 
      error?.message?.includes("Cannot read properties") ||
      error?.message?.includes("model") ||
      error?.code === "P2001" ||
      error?.code === "P2025"
    ) {
      return (
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Ошибка загрузки данных
            </h2>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              {error?.message || "Не удалось загрузить контент. Возможно, Prisma Client не обновлен или база данных не настроена."}
            </p>
            <div className="bg-white dark:bg-gray-800 rounded p-4 mb-4">
              <p className="text-sm font-mono text-gray-800 dark:text-gray-200 mb-2">
                Возможные решения:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>Проверьте, что DATABASE_URL установлен в переменных окружения Vercel</li>
                <li>Убедитесь, что Prisma Client перегенерирован (должно происходить автоматически при деплое)</li>
                <li>Проверьте логи Vercel для детальной информации об ошибке</li>
              </ol>
            </div>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Если проблема сохраняется, проверьте настройки базы данных в Vercel.
            </p>
          </div>
        </div>
      );
    }
    
    // Другие ошибки - показываем общее сообщение
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Ошибка сервера
          </h2>
          <p className="text-red-700 dark:text-red-300 mb-4">
            Произошла ошибка при загрузке контента. Проверьте логи сервера для детальной информации.
          </p>
          {process.env.NODE_ENV === "development" && error?.message && (
            <div className="bg-white dark:bg-gray-800 rounded p-4 mt-4">
              <p className="text-xs font-mono text-gray-800 dark:text-gray-200">
                {error.message}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
}
