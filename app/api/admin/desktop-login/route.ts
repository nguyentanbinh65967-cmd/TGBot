import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

/**
 * API для десктоп-логина администратора
 * 
 * Проверяет логин и пароль, устанавливает куку для сессии.
 * Работает в production на Vercel.
 */

/**
 * Явно указываем Node.js runtime
 */
export const runtime = "nodejs";

const ADMIN_USERNAME = "Admin";
const ADMIN_PASSWORD = "Thekvando900";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Проверка логина и пароля
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: "Неверный логин или пароль" },
        { status: 401 }
      );
    }

    // Успешный вход - устанавливаем куку
    const response = NextResponse.json({
      success: true,
      message: "Вход выполнен успешно",
    });

    // Устанавливаем куку с флагом десктоп-админа
    // HttpOnly: false, чтобы можно было читать на клиенте (для AdminLayout)
    // Secure: true в production (HTTPS на Vercel), SameSite: Lax для безопасности
    // На Vercel всегда HTTPS, поэтому secure должен быть true
    const isProduction = process.env.NODE_ENV === "production";
    const isVercel = process.env.VERCEL === "1";
    const useSecure = isProduction || isVercel;
    
    // Устанавливаем куку с правильными настройками для Vercel
    // Используем cookies() из next/headers для серверной установки
    cookies().set("desktop_admin", "1", {
      httpOnly: false, // Нужно для чтения на клиенте
      secure: useSecure, // HTTPS на Vercel и в production
      sameSite: "lax", // Lax для безопасности
      maxAge: 60 * 60 * 24 * 7, // 7 дней
      path: "/",
      // Не указываем domain, чтобы кука работала на всех поддоменах Vercel
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
