/**
 * Логика авторизации и проверки прав доступа
 * 
 * ВАЖНО: Клиентская проверка только для UX.
 * Реальная проверка должна быть на сервере через валидацию initData.
 */

import { createHmac } from "node:crypto";
import type { TelegramUser } from "@/types/telegram";
import type { UserRole, AuthResult, Role } from "@/types/user";
import { getUserRole as getRBACRole } from "@/config/rbac";

/**
 * Получить список админ ID из переменных окружения
 */
function getAdminIds(): number[] {
  if (typeof process === "undefined" || !process.env) {
    return [];
  }

  const adminIdsEnv = process.env.NEXT_PUBLIC_ADMIN_IDS || process.env.ADMIN_IDS;
  
  if (!adminIdsEnv) {
    return [];
  }

  try {
    return adminIdsEnv
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id) && id > 0);
  } catch {
    return [];
  }
}

/**
 * Проверить, является ли пользователь администратором
 * 
 * @param telegramId - Telegram ID пользователя
 * @returns true если пользователь админ
 */
export function isAdmin(telegramId: number): boolean {
  const adminIds = getAdminIds();
  return adminIds.includes(telegramId);
}

/**
 * Определить роль пользователя (legacy, использует старую логику)
 * 
 * @deprecated Используйте getUserRole из @/config/rbac для получения Role
 * @param telegramId - Telegram ID пользователя
 * @returns роль пользователя (admin | user)
 */
export function getUserRole(telegramId: number): UserRole {
  return isAdmin(telegramId) ? "admin" : "user";
}

/**
 * Получить роль пользователя на основе TelegramUser (новая версия с поддержкой всех ролей)
 * 
 * @param user - Пользователь Telegram
 * @returns роль пользователя (guest | user | admin | superadmin)
 */
export function getUserRoleFromUser(user: TelegramUser): Role {
  return getRBACRole(user);
}

/**
 * Проверить авторизацию пользователя
 * 
 * @param user - Данные пользователя из Telegram WebApp
 * @returns результат проверки авторизации
 */
export function checkAuth(user: TelegramUser | null | undefined): AuthResult {
  // Если пользователь не передан
  if (!user || !user.id) {
    return {
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      error: "Пользователь не авторизован",
    };
  }

  const role = getUserRole(user.id);
  const isAdminUser = role === "admin";

  return {
    isAuthenticated: true,
    isAdmin: isAdminUser,
    user: {
      id: user.id,
      firstName: user.first_name,
      username: user.username,
      role,
    },
  };
}

/**
 * Проверить доступ к админке
 * 
 * @param user - Данные пользователя из Telegram WebApp
 * @returns true если доступ разрешен
 */
export function hasAdminAccess(user: TelegramUser | null | undefined): boolean {
  const authResult = checkAuth(user);
  return authResult.isAuthenticated && authResult.isAdmin;
}

/**
 * Парсинг initData строки в объект параметров
 * 
 * @param initData - initData строка из Telegram WebApp (query string)
 * @returns Объект с параметрами (значения в оригинальном виде для проверки подписи)
 */
function parseInitData(initData: string): Record<string, string> {
  const params: Record<string, string> = {};
  
  if (!initData || initData.trim().length === 0) {
    return params;
  }

  const pairs = initData.split("&");
  
  for (const pair of pairs) {
    const [key, ...valueParts] = pair.split("=");
    if (key) {
      // Сохраняем значение в оригинальном виде для проверки подписи
      // По документации Telegram нужно использовать оригинальные значения
      params[key] = valueParts.join("=");
    }
  }
  
  return params;
}

/**
 * Декодирование значения параметра (для использования в приложении)
 * 
 * @param value - URL-encoded значение
 * @returns Декодированное значение
 */
function decodeParamValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    // Если декодирование не удалось, возвращаем оригинальное значение
    return value;
  }
}

/**
 * Создание data_check_string для валидации
 * 
 * @param params - Параметры initData без hash
 * @returns Строка для проверки подписи
 */
function createDataCheckString(params: Record<string, string>): string {
  // Сортируем параметры по ключу
  const sortedKeys = Object.keys(params).sort();
  
  // Собираем строку вида: key=value\nkey=value
  return sortedKeys
    .map((key) => `${key}=${params[key]}`)
    .join("\n");
}

/**
 * Валидация initData на сервере согласно документации Telegram
 * 
 * Алгоритм проверки:
 * 1. Парсинг initData (query string)
 * 2. Извлечение hash
 * 3. Удаление hash из параметров
 * 4. Сортировка параметров по ключу
 * 5. Создание data_check_string: key=value\nkey=value
 * 6. Создание secret_key = HMAC_SHA256(botToken, "WebAppData")
 * 7. Создание check_hash = HMAC_SHA256(data_check_string, secret_key)
 * 8. Сравнение check_hash с hash из initData
 * 
 * @param initData - initData строка из Telegram WebApp
 * @returns Типизированный объект пользователя Telegram
 * @throws Error если initData невалидна или подпись не совпадает
 * 
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 */
export function validateInitData(initData: string): TelegramUser {
  // Проверка на пустую строку
  if (!initData || initData.trim().length === 0) {
    throw new Error("Invalid initData: empty string");
  }

  // Проверка наличия BOT_TOKEN
  const botToken = process.env.BOT_TOKEN;
  if (!botToken) {
    throw new Error("BOT_TOKEN is not configured in environment variables");
  }

  // Парсим initData
  const params = parseInitData(initData);

  // Извлекаем hash
  const hash = params.hash;
  if (!hash) {
    throw new Error("Invalid initData: hash is missing");
  }

  // Удаляем hash из параметров для создания data_check_string
  const { hash: _, ...paramsWithoutHash } = params;

  // Создаем data_check_string
  const dataCheckString = createDataCheckString(paramsWithoutHash);

  // Проверка, что функция вызывается только на сервере
  if (typeof window !== "undefined") {
    throw new Error("validateInitData must be called on the server side only");
  }

  // Создаем secret_key = HMAC_SHA256(botToken, "WebAppData")
  // По документации Telegram: secret_key = HMAC_SHA256(botToken, "WebAppData")
  // В Node.js: createHmac(algorithm, key).update(data).digest()
  const secretKey = createHmac("sha256", botToken)
    .update("WebAppData")
    .digest();

  // Создаем check_hash = HMAC_SHA256(data_check_string, secret_key)
  const checkHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  // Сравниваем check_hash с hash из initData
  if (checkHash !== hash) {
    throw new Error("Invalid initData signature");
  }

  // Парсим user из параметров (декодируем для парсинга JSON)
  const userParam = params.user;
  if (!userParam) {
    throw new Error("Invalid initData: user data is missing");
  }

  let userData: TelegramUser;
  try {
    // Декодируем значение перед парсингом JSON
    const decodedUserParam = decodeParamValue(userParam);
    userData = JSON.parse(decodedUserParam);
  } catch (error) {
    throw new Error("Invalid initData: user data is not valid JSON");
  }

  // Валидация обязательных полей
  if (!userData.id || typeof userData.id !== "number") {
    throw new Error("Invalid initData: user.id is missing or invalid");
  }

  if (!userData.first_name || typeof userData.first_name !== "string") {
    throw new Error("Invalid initData: user.first_name is missing or invalid");
  }

  // Проверяем auth_date (данные не должны быть старше 24 часов)
  const authDate = params.auth_date;
  if (authDate) {
    const authTimestamp = parseInt(authDate, 10);
    if (!isNaN(authTimestamp)) {
      const authDateObj = new Date(authTimestamp * 1000);
      const now = new Date();
      const hoursDiff = (now.getTime() - authDateObj.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        throw new Error("Invalid initData: auth_date is too old (more than 24 hours)");
      }
    }
  }

  // Возвращаем типизированный объект пользователя
  return {
    id: userData.id,
    first_name: userData.first_name,
    last_name: userData.last_name,
    username: userData.username,
    photo_url: userData.photo_url,
    language_code: userData.language_code,
    is_premium: userData.is_premium,
  };
}
