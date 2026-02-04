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
    // Если Prisma Client не перегенерирован, показываем сообщение
    if (error?.message?.includes("direction") || error?.message?.includes("Cannot read properties")) {
      return (
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Prisma Client не обновлен
            </h2>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              Необходимо перегенерировать Prisma Client после добавления новых моделей.
            </p>
            <div className="bg-white dark:bg-gray-800 rounded p-4 mb-4">
              <p className="text-sm font-mono text-gray-800 dark:text-gray-200 mb-2">
                Выполните следующие шаги:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>Остановите dev-сервер (Ctrl+C в терминале)</li>
                <li>Выполните: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">npm run prisma:generate</code></li>
                <li>Запустите dev-сервер снова: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">npm run dev</code></li>
              </ol>
            </div>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              После перезапуска страница заработает автоматически.
            </p>
          </div>
        </div>
      );
    }
    
    // Другие ошибки
    throw error;
  }
}
