"use client";

/**
 * Client компонент для отображения метаданных лога (collapsible JSON)
 * 
 * Безопасный рендеринг JSON без eval или dangerouslySetInnerHTML
 */

import { useState, useMemo } from "react";

interface LogMetaProps {
  meta: any;
}

/**
 * Безопасное преобразование объекта в строку для preview
 */
function getMetaPreview(meta: any): string {
  if (!meta || typeof meta !== "object") {
    return String(meta);
  }

  const keys = Object.keys(meta);
  if (keys.length === 0) {
    return "{}";
  }

  // Показываем первые 3 ключа для preview
  const previewKeys = keys.slice(0, 3);
  const preview = previewKeys
    .map((key) => {
      const value = meta[key];
      if (typeof value === "object" && value !== null) {
        return `${key}: {...}`;
      }
      const valueStr = String(value);
      return `${key}: ${valueStr.length > 20 ? valueStr.slice(0, 20) + "..." : valueStr}`;
    })
    .join(", ");

  return keys.length > 3 ? `${preview}... (+${keys.length - 3})` : preview;
}

export function LogMeta({ meta }: LogMetaProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const preview = useMemo(() => getMetaPreview(meta), [meta]);
  const metaString = useMemo(() => {
    if (!meta || Object.keys(meta).length === 0) {
      return null;
    }
    try {
      return JSON.stringify(meta, null, 2);
    } catch {
      return String(meta);
    }
  }, [meta]);

  if (!meta || Object.keys(meta).length === 0) {
    return <span className="text-gray-400 dark:text-gray-500">—</span>;
  }

  return (
    <div className="min-w-[200px]">
      {!isExpanded ? (
        <div>
          <button
            onClick={() => setIsExpanded(true)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline text-left"
            title="Нажмите для просмотра полных метаданных"
          >
            {preview}
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline mb-2"
          >
            Скрыть
          </button>
          <pre className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto max-w-md max-h-64 border border-gray-200 dark:border-gray-600">
            {metaString}
          </pre>
        </div>
      )}
    </div>
  );
}
