import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateInitData } from "@/lib/auth/server";
import { getUserRole, hasAdminAccess } from "@/config/rbac";
import type { Role } from "@/types/user";

/**
 * ВАЖНО: Middleware использует validateInitData, который требует node:crypto.
 * В Vercel middleware по умолчанию использует Edge runtime, но мы явно указываем
 * Node.js runtime через конфигурацию или используем альтернативный подход.
 * 
 * Для production на Vercel убедитесь, что middleware может использовать Node.js runtime.
 * Если это невозможно, валидация initData должна происходить в API routes или Server Components.
 */

/**
 * RBAC Middleware для защиты API routes и страниц
 * 
 * Защищает:
 * - /api/admin/* → требует admin | superadmin
 * - /admin/* → требует admin | superadmin
 * 
 * Алгоритм:
 * 1. Извлекает initData из Authorization header или body
 * 2. Валидирует initData через validateInitData
 * 3. Определяет роль пользователя через getUserRole
 * 4. Проверяет доступ на основе роли
 * 5. Возвращает 401/403 для API или redirect для страниц
 */

/**
 * Извлечь initData из запроса
 * 
 * Проверяет:
 * - Authorization header (Bearer initData)
 * - Body для POST запросов (initData поле)
 * 
 * @param request - Next.js request объект
 * @returns initData строка или null
 */
async function extractInitData(request: NextRequest): Promise<string | null> {
  // Проверяем Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const initData = authHeader.slice(7).trim();
    if (initData) {
      return initData;
    }
  }

  // Для POST запросов проверяем body
  if (request.method === "POST") {
    try {
      const body = await request.clone().json();
      if (body?.initData && typeof body.initData === "string") {
        return body.initData;
      }
    } catch {
      // Игнорируем ошибки парсинга body
    }
  }

  return null;
}

/**
 * Проверить доступ к роуту на основе роли
 * 
 * @param role - Роль пользователя
 * @param pathname - Путь запроса
 * @returns true если доступ разрешен
 */
function checkRouteAccess(role: Role, pathname: string): boolean {
  // API admin routes требуют admin или superadmin
  if (pathname.startsWith("/api/admin")) {
    return role === "admin" || role === "superadmin";
  }

  // Admin pages требуют admin или superadmin
  if (pathname.startsWith("/admin")) {
    return role === "admin" || role === "superadmin";
  }

  // Остальные роуты доступны всем авторизованным пользователям
  return role !== "guest";
}

/**
 * Создать ответ об отказе в доступе для API
 * 
 * @param status - HTTP статус код
 * @param message - Сообщение об ошибке
 * @returns NextResponse с JSON ошибкой
 */
function createApiErrorResponse(status: number, message: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

/**
 * Создать redirect на страницу unauthorized
 * 
 * @param request - Next.js request объект
 * @returns NextResponse с redirect
 */
function createUnauthorizedRedirect(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/unauthorized";
  url.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

/**
 * Основная функция middleware
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  const isDev = process.env.NODE_ENV !== "production";

  // Пропускаем статические файлы и системные роуты
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth/check") || // Публичный endpoint для проверки
    pathname === "/unauthorized" || // Страница unauthorized доступна всем
    pathname.includes(".") // Статические файлы
  ) {
    return NextResponse.next();
  }

  // 🔧 DEV-режим: разрешить вход в админку с десктопа без Telegram
  // Включается, только если:
  // - NODE_ENV !== "production"
  // - DEV_DESKTOP_ADMIN === "true" в .env.local
  if (
    isDev &&
    process.env.DEV_DESKTOP_ADMIN === "true" &&
    pathname.startsWith("/admin")
  ) {
    const response = NextResponse.next();
    // Подставляем "фейкового" супер-админа для серверной части
    response.headers.set("x-user-id", "0");
    response.headers.set("x-user-role", "superadmin");
    response.headers.set("x-user-username", "dev_desktop_admin");
    return response;
  }

  // Проверяем, нужно ли защищать этот роут
  const isAdminRoute = pathname.startsWith("/api/admin") || pathname.startsWith("/admin");
  
  if (!isAdminRoute) {
    // Для не-админ роутов просто пропускаем
    return NextResponse.next();
  }

  // Извлекаем initData
  const initData = await extractInitData(request);

  if (!initData) {
    // initData не предоставлен
    if (pathname.startsWith("/api")) {
      return createApiErrorResponse(
        401,
        "Unauthorized: initData is required. Send it in Authorization header (Bearer initData) or in request body."
      );
    }
    return createUnauthorizedRedirect(request);
  }

  // Валидируем initData
  let user;
  try {
    user = validateInitData(initData);
  } catch (error) {
    // Ошибка валидации initData
    const errorMessage = error instanceof Error ? error.message : "Invalid initData";
    
    if (pathname.startsWith("/api")) {
      return createApiErrorResponse(401, `Unauthorized: ${errorMessage}`);
    }
    return createUnauthorizedRedirect(request);
  }

  // Определяем роль пользователя
  const role = getUserRole(user);

  // Проверяем доступ
  const hasAccess = checkRouteAccess(role, pathname);

  if (!hasAccess) {
    // Доступ запрещен
    if (pathname.startsWith("/api")) {
      return createApiErrorResponse(
        403,
        `Forbidden: Access denied. Required role: admin or superadmin, your role: ${role}`
      );
    }
    return createUnauthorizedRedirect(request);
  }

  // Доступ разрешен - добавляем информацию о пользователе в headers для использования в API routes
  const response = NextResponse.next();
  
  // Добавляем заголовки с информацией о пользователе (для использования в API routes)
  response.headers.set("x-user-id", user.id.toString());
  response.headers.set("x-user-role", role);
  response.headers.set("x-user-username", user.username || "");

  return response;
}

/**
 * Конфигурация matcher для middleware
 * 
 * Middleware будет выполняться только для указанных путей
 */
export const config = {
  matcher: [
    "/api/admin/:path*",
    "/admin/:path*",
  ],
};
