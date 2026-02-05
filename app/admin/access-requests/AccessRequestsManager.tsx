"use client";

import { useState } from "react";
import { Badge } from "@/components/admin/Badge";
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from "@/components/admin/Table";

interface User {
  id: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
  accessStatus: "pending" | "approved" | "rejected";
  startCourseId: number | null;
}

interface AccessRequest {
  id: number;
  userId: string;
  status: "pending" | "approved" | "rejected";
  message: string | null;
  createdAt: string;
  processedAt: string | null;
  adminComment: string | null;
  user: User;
}

interface Course {
  id: number;
  name: string;
  direction: {
    id: number;
    name: string;
  };
}

interface AccessRequestsManagerProps {
  initialRequests: AccessRequest[];
  courses: Course[];
}

export function AccessRequestsManager({ initialRequests, courses }: AccessRequestsManagerProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [processing, setProcessing] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<{ [key: number]: number }>({});
  const [comment, setComment] = useState<{ [key: number]: string }>({});

  const handleProcess = async (requestId: number, action: "approve" | "reject") => {
    setProcessing(requestId);

    try {
      const courseId = action === "approve" ? selectedCourse[requestId] : undefined;
      if (action === "approve" && !courseId) {
        alert("Пожалуйста, выберите начальный курс");
        setProcessing(null);
        return;
      }

      const response = await fetch("/api/admin/access-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          action,
          courseId,
          comment: comment[requestId] || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Ошибка при обработке запроса");
        setProcessing(null);
        return;
      }

      // Обновляем список запросов
      const updatedRequests = requests.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: action === "approve" ? "approved" : "rejected",
              processedAt: new Date().toISOString(),
              adminComment: comment[requestId] || null,
              user: {
                ...req.user,
                accessStatus: action === "approve" ? "approved" : "rejected",
                startCourseId: action === "approve" ? courseId : null,
              },
            }
          : req
      );

      setRequests(updatedRequests);
      setProcessing(null);
      setSelectedCourse({});
      setComment({});
    } catch (error) {
      console.error("Error processing request:", error);
      alert("Ошибка подключения к серверу");
      setProcessing(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const processedRequests = requests.filter((r) => r.status !== "pending");

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Запросы на доступ</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Всего: {requests.length} | Ожидают: {pendingRequests.length}
        </div>
      </div>

      {/* Ожидающие запросы */}
      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Ожидающие рассмотрения ({pendingRequests.length})
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <Table>
              <TableHead>
                <TableHeader>Пользователь</TableHeader>
                <TableHeader>Сообщение</TableHeader>
                <TableHeader>Дата запроса</TableHeader>
                <TableHeader>Начальный курс</TableHeader>
                <TableHeader>Комментарий</TableHeader>
                <TableHeader>Действия</TableHeader>
              </TableHead>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {request.user.firstName} {request.user.lastName || ""}
                        </div>
                        {request.user.username && (
                          <div className="text-xs text-gray-500">@{request.user.username}</div>
                        )}
                        <div className="text-xs font-mono text-gray-400">{request.user.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.message ? (
                        <div className="max-w-xs text-sm">{request.message}</div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(request.createdAt).toLocaleString("ru-RU")}
                    </TableCell>
                    <TableCell>
                      <select
                        value={selectedCourse[request.id] || ""}
                        onChange={(e) =>
                          setSelectedCourse({
                            ...selectedCourse,
                            [request.id]: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                        disabled={processing === request.id}
                      >
                        <option value="">Выберите курс</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.direction.name} → {course.name}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <input
                        type="text"
                        value={comment[request.id] || ""}
                        onChange={(e) =>
                          setComment({
                            ...comment,
                            [request.id]: e.target.value,
                          })
                        }
                        placeholder="Комментарий (необязательно)"
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                        disabled={processing === request.id}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleProcess(request.id, "approve")}
                          disabled={processing === request.id || !selectedCourse[request.id]}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Одобрить
                        </button>
                        <button
                          onClick={() => handleProcess(request.id, "reject")}
                          disabled={processing === request.id}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Отклонить
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Обработанные запросы */}
      {processedRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Обработанные запросы ({processedRequests.length})
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <Table>
              <TableHead>
                <TableHeader>Пользователь</TableHeader>
                <TableHeader>Статус</TableHeader>
                <TableHeader>Начальный курс</TableHeader>
                <TableHeader>Дата обработки</TableHeader>
                <TableHeader>Комментарий</TableHeader>
              </TableHead>
              <TableBody>
                {processedRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {request.user.firstName} {request.user.lastName || ""}
                        </div>
                        {request.user.username && (
                          <div className="text-xs text-gray-500">@{request.user.username}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.status === "approved"
                            ? "success"
                            : request.status === "rejected"
                            ? "danger"
                            : "default"
                        }
                      >
                        {request.status === "approved"
                          ? "Одобрен"
                          : request.status === "rejected"
                          ? "Отклонен"
                          : "Ожидает"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.user.startCourseId ? (
                        courses.find((c) => c.id === request.user.startCourseId)?.name || "—"
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {request.processedAt
                        ? new Date(request.processedAt).toLocaleString("ru-RU")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {request.adminComment ? (
                        <div className="max-w-xs text-sm">{request.adminComment}</div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">Нет запросов на доступ</p>
        </div>
      )}
    </div>
  );
}
