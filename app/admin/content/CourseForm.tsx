"use client";

import { useState } from "react";

type Course = {
  id: number;
  directionId: number;
  name: string;
  description: string | null;
  order: number;
  isActive: boolean;
};

type CourseFormProps = {
  directionId: number;
  onSubmit: (formData: FormData) => void | Promise<void>;
  onCancel: () => void;
  initialData?: Course;
};

export function CourseForm({ directionId, onSubmit, onCancel, initialData }: CourseFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [order, setOrder] = useState(initialData?.order.toString() || "0");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("directionId", directionId.toString());
    formData.append("name", name);
    formData.append("description", description);
    formData.append("order", order);
    formData.append("isActive", isActive ? "true" : "false");
    onSubmit(formData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {initialData ? "Редактировать курс" : "Создать курс"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Название *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Описание
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Порядок отображения
          </label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Активно
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {initialData ? "Сохранить" : "Создать"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
