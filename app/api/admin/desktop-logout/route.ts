import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * API для выхода десктоп-админа
 * 
 * Удаляет куку desktop_admin.
 */

export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: "Выход выполнен успешно",
  });

  // Удаляем куку
  response.cookies.delete("desktop_admin");

  return response;
}
