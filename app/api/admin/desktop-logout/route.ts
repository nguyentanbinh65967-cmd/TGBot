import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

/**
 * API для выхода десктоп-админа
 * 
 * Удаляет куку desktop_admin.
 */

/**
 * Явно указываем Node.js runtime
 */
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: "Выход выполнен успешно",
  });

  // Удаляем куку используя cookies() из next/headers
  cookies().delete("desktop_admin");

  return response;
}
