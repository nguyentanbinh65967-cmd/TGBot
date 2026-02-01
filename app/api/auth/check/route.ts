import { validateInitData } from "@/lib/auth/server";
import { NextResponse } from "next/server";

/**
 * Явно указываем Node.js runtime для использования node:crypto
 */
export const runtime = "nodejs";

/**
 * API Route для проверки валидности initData
 * 
 * POST /api/auth/check
 * 
 * Body:
 * {
 *   "initData": "query_id=...&user=...&hash=..."
 * }
 * 
 * Response (success):
 * {
 *   "success": true,
 *   "user": {
 *     "id": 123456789,
 *     "first_name": "John",
 *     ...
 *   }
 * }
 * 
 * Response (error):
 * {
 *   "success": false,
 *   "error": "Invalid initData signature"
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { initData } = body;

    if (!initData || typeof initData !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "initData is required and must be a string",
        },
        { status: 400 }
      );
    }

    // Валидируем initData
    const user = validateInitData(initData);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    // Обработка ошибок валидации
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
