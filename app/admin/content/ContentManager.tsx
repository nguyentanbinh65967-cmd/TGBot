"use client";

import { useState } from "react";
import { DirectionForm } from "./DirectionForm";
import { CourseForm } from "./CourseForm";
import { LessonForm } from "./LessonForm";
import {
  createDirection,
  updateDirection,
  deleteDirection,
  createCourse,
  updateCourse,
  deleteCourse,
  createLesson,
  updateLesson,
  deleteLesson,
} from "./actions";

type Direction = {
  id: number;
  name: string;
  description: string | null;
  order: number;
  isActive: boolean;
  courses: Course[];
};

type Course = {
  id: number;
  directionId: number;
  name: string;
  description: string | null;
  order: number;
  isActive: boolean;
  lessons: Lesson[];
};

type Lesson = {
  id: number;
  courseId: number;
  name: string;
  description: string | null;
  content: string | null;
  order: number;
  isActive: boolean;
};

type ContentManagerProps = {
  initialDirections: Direction[];
};

type ActiveTab = "directions" | "courses" | "lessons";
type EditMode = {
  type: "direction" | "course" | "lesson";
  id: number;
} | null;

export function ContentManager({ initialDirections }: ContentManagerProps) {
  const [directions, setDirections] = useState<Direction[]>(initialDirections);
  const [activeTab, setActiveTab] = useState<ActiveTab>("directions");
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedDirectionId, setSelectedDirectionId] = useState<number | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  const handleCreateDirection = async (formData: FormData) => {
    const result = await createDirection(formData);
    if (result.success) {
      // Перезагружаем страницу для обновления данных
      window.location.reload();
    } else {
      alert(result.error || "Ошибка при создании направления");
    }
  };

  const handleUpdateDirection = async (id: number, formData: FormData) => {
    const result = await updateDirection(id, formData);
    if (result.success) {
      window.location.reload();
    } else {
      alert(result.error || "Ошибка при обновлении направления");
    }
  };

  const handleDeleteDirection = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить это направление? Все курсы и уроки также будут удалены.")) {
      return;
    }
    const result = await deleteDirection(id);
    if (result.success) {
      window.location.reload();
    } else {
      alert(result.error || "Ошибка при удалении направления");
    }
  };

  const handleCreateCourse = async (formData: FormData) => {
    const result = await createCourse(formData);
    if (result.success) {
      window.location.reload();
    } else {
      alert(result.error || "Ошибка при создании курса");
    }
  };

  const handleUpdateCourse = async (id: number, formData: FormData) => {
    const result = await updateCourse(id, formData);
    if (result.success) {
      window.location.reload();
    } else {
      alert(result.error || "Ошибка при обновлении курса");
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот курс? Все уроки также будут удалены.")) {
      return;
    }
    const result = await deleteCourse(id);
    if (result.success) {
      window.location.reload();
    } else {
      alert(result.error || "Ошибка при удалении курса");
    }
  };

  const handleCreateLesson = async (formData: FormData) => {
    const result = await createLesson(formData);
    if (result.success) {
      window.location.reload();
    } else {
      alert(result.error || "Ошибка при создании урока");
    }
  };

  const handleUpdateLesson = async (id: number, formData: FormData) => {
    const result = await updateLesson(id, formData);
    if (result.success) {
      window.location.reload();
    } else {
      alert(result.error || "Ошибка при обновлении урока");
    }
  };

  const handleDeleteLesson = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот урок?")) {
      return;
    }
    const result = await deleteLesson(id);
    if (result.success) {
      window.location.reload();
    } else {
      alert(result.error || "Ошибка при удалении урока");
    }
  };

  const selectedDirection = selectedDirectionId
    ? directions.find((d) => d.id === selectedDirectionId)
    : null;

  const selectedCourse = selectedCourseId && selectedDirection
    ? selectedDirection.courses.find((c) => c.id === selectedCourseId)
    : null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Управление контентом
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Создавайте и управляйте направлениями, курсами и уроками
        </p>
      </div>

      {/* Вкладки */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          <button
            onClick={() => {
              setActiveTab("directions");
              setShowForm(false);
              setEditMode(null);
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "directions"
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Направления
          </button>
          <button
            onClick={() => {
              setActiveTab("courses");
              setShowForm(false);
              setEditMode(null);
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "courses"
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Курсы
          </button>
          <button
            onClick={() => {
              setActiveTab("lessons");
              setShowForm(false);
              setEditMode(null);
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "lessons"
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Уроки
          </button>
        </nav>
      </div>

      {/* Контент вкладок */}
      {activeTab === "directions" && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Направления ({directions.length})
            </h2>
            <button
              onClick={() => {
                setShowForm(true);
                setEditMode(null);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Создать направление
            </button>
          </div>

          {showForm && (
            <div className="mb-6">
              <DirectionForm
                onSubmit={editMode?.type === "direction" && editMode.id
                  ? (formData) => handleUpdateDirection(editMode.id, formData)
                  : handleCreateDirection}
                onCancel={() => {
                  setShowForm(false);
                  setEditMode(null);
                }}
                initialData={
                  editMode?.type === "direction" && editMode.id
                    ? directions.find((d) => d.id === editMode.id)
                    : undefined
                }
              />
            </div>
          )}

          <div className="space-y-4">
            {directions.map((direction) => (
              <div
                key={direction.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {direction.name}
                      </h3>
                      {!direction.isActive && (
                        <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                          Неактивно
                        </span>
                      )}
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Порядок: {direction.order}
                      </span>
                    </div>
                    {direction.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {direction.description}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Курсов: {direction.courses.length}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditMode({ type: "direction", id: direction.id });
                        setShowForm(true);
                      }}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDeleteDirection(direction.id)}
                      className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {directions.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                Направления не созданы. Создайте первое направление.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "courses" && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Курсы
            </h2>
            <div className="flex gap-2">
              <select
                value={selectedDirectionId || ""}
                onChange={(e) => setSelectedDirectionId(Number(e.target.value) || null)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Выберите направление</option>
                {directions.map((dir) => (
                  <option key={dir.id} value={dir.id}>
                    {dir.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (!selectedDirectionId) {
                    alert("Выберите направление");
                    return;
                  }
                  setShowForm(true);
                  setEditMode(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={!selectedDirectionId}
              >
                + Создать курс
              </button>
            </div>
          </div>

          {showForm && selectedDirectionId && (
            <div className="mb-6">
              <CourseForm
                directionId={selectedDirectionId}
                onSubmit={editMode?.type === "course" && editMode.id
                  ? (formData) => handleUpdateCourse(editMode.id, formData)
                  : handleCreateCourse}
                onCancel={() => {
                  setShowForm(false);
                  setEditMode(null);
                }}
                initialData={
                  editMode?.type === "course" && editMode.id && selectedDirection
                    ? selectedDirection.courses.find((c) => c.id === editMode.id)
                    : undefined
                }
              />
            </div>
          )}

          <div className="space-y-4">
            {selectedDirection ? (
              selectedDirection.courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {course.name}
                        </h3>
                        {!course.isActive && (
                          <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                            Неактивно
                          </span>
                        )}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Порядок: {course.order}
                        </span>
                      </div>
                      {course.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {course.description}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Уроков: {course.lessons.length}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditMode({ type: "course", id: course.id });
                          setShowForm(true);
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                Выберите направление для просмотра курсов
              </div>
            )}

            {selectedDirection && selectedDirection.courses.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                В этом направлении пока нет курсов. Создайте первый курс.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "lessons" && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Уроки
            </h2>
            <div className="flex gap-2">
              <select
                value={selectedDirectionId || ""}
                onChange={(e) => {
                  setSelectedDirectionId(Number(e.target.value) || null);
                  setSelectedCourseId(null);
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Выберите направление</option>
                {directions.map((dir) => (
                  <option key={dir.id} value={dir.id}>
                    {dir.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedCourseId || ""}
                onChange={(e) => setSelectedCourseId(Number(e.target.value) || null)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                disabled={!selectedDirectionId}
              >
                <option value="">Выберите курс</option>
                {selectedDirection?.courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (!selectedCourseId) {
                    alert("Выберите курс");
                    return;
                  }
                  setShowForm(true);
                  setEditMode(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={!selectedCourseId}
              >
                + Создать урок
              </button>
            </div>
          </div>

          {showForm && selectedCourseId && (
            <div className="mb-6">
              <LessonForm
                courseId={selectedCourseId}
                onSubmit={editMode?.type === "lesson" && editMode.id
                  ? (formData) => handleUpdateLesson(editMode.id, formData)
                  : handleCreateLesson}
                onCancel={() => {
                  setShowForm(false);
                  setEditMode(null);
                }}
                initialData={
                  editMode?.type === "lesson" && editMode.id && selectedCourse
                    ? selectedCourse.lessons.find((l) => l.id === editMode.id)
                    : undefined
                }
              />
            </div>
          )}

          <div className="space-y-4">
            {selectedCourse ? (
              selectedCourse.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {lesson.name}
                        </h3>
                        {!lesson.isActive && (
                          <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                            Неактивно
                          </span>
                        )}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Порядок: {lesson.order}
                        </span>
                      </div>
                      {lesson.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {lesson.description}
                        </p>
                      )}
                      {lesson.content && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          Контент: {lesson.content.substring(0, 100)}...
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditMode({ type: "lesson", id: lesson.id });
                          setShowForm(true);
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                Выберите направление и курс для просмотра уроков
              </div>
            )}

            {selectedCourse && selectedCourse.lessons.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                В этом курсе пока нет уроков. Создайте первый урок.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
