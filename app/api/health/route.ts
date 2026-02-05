/**
 * Health check endpoint для диагностики
 * GET /api/health - проверка работоспособности приложения
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Проверяем базовые вещи
    const checks = {
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL === "1",
      databaseUrl: process.env.DATABASE_URL ? "set" : "not set",
      botToken: process.env.BOT_TOKEN ? "set" : "not set",
    };

    return NextResponse.json({
      status: "ok",
      checks,
      message: "Application is running",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
