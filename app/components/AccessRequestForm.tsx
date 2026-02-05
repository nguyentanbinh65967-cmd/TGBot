"use client";

import { useState, useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";

interface AccessRequest {
  id: number;
  status: "pending" | "approved" | "rejected";
  message: string | null;
  createdAt: string;
  processedAt: string | null;
  adminComment: string | null;
}

export function AccessRequestForm() {
  const { user, isReady } = useTelegram();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<AccessRequest | null>(null);

  useEffect(() => {
    if (isReady && user) {
      fetchCurrentRequest();
    }
  }, [isReady, user]);

  const fetchCurrentRequest = async () => {
    try {
      const response = await fetch("/api/access-request");
      const data = await response.json();
      if (data.success && data.request) {
        setCurrentRequest(data.request);
      }
    } catch (err) {
      console.error("Error fetching request:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ошибка при отправке запроса");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setMessage("");
      await fetchCurrentRequest();
      setLoading(false);
    } catch (err) {
      console.error("Error submitting request:", err);
      setError("Ошибка подключения к серверу");
      setLoading(false);
    }
  };

  if (!isReady || !user) {
    return null;
  }

  if (currentRequest) {
    if (currentRequest.status === "pending") {
      return (
        <div className="max-w-2xl mx-auto bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">⏳</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Запрос на доступ отправлен
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                Ваш запрос находится на рассмотрении. Администратор скоро обработает его.
              </p>
              {currentRequest.message && (
                <div className="bg-white dark:bg-gray-800 rounded p-3 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ваше сообщение:</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{currentRequest.message}</p>
                </div>
              )}
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Отправлено: {new Date(currentRequest.createdAt).toLocaleString("ru-RU")}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (currentRequest.status === "approved") {
      return (
        <div className="max-w-2xl mx-auto bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">✅</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                Доступ одобрен!
              </h3>
              <p className="text-green-700 dark:text-green-300">
                Администратор одобрил ваш запрос. Теперь вы можете начать обучение.
              </p>
              {currentRequest.adminComment && (
                <div className="bg-white dark:bg-gray-800 rounded p-3 mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Комментарий администратора:</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{currentRequest.adminComment}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (currentRequest.status === "rejected") {
      return (
        <div className="max-w-2xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">❌</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Запрос отклонен
              </h3>
              <p className="text-red-700 dark:text-red-300 mb-4">
                К сожалению, ваш запрос был отклонен администратором.
              </p>
              {currentRequest.adminComment && (
                <div className="bg-white dark:bg-gray-800 rounded p-3 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Причина:</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{currentRequest.adminComment}</p>
                </div>
              )}
              <button
                onClick={() => setCurrentRequest(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Отправить новый запрос
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Запрос на доступ
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Для доступа к материалам обучения необходимо получить одобрение администратора.
        Заполните форму ниже, и мы рассмотрим ваш запрос.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-green-700 dark:text-green-300 text-sm">
          Запрос успешно отправлен! Ожидайте одобрения администратора.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Сообщение (необязательно)
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Расскажите о себе или укажите причину, по которой вы хотите получить доступ..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? "Отправка..." : "Отправить запрос"}
        </button>
      </form>
    </div>
  );
}
