"use server";

import { db } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

/**
 * Server Actions для управления контентом (направления, курсы, уроки)
 */

// ============================================
// НАПРАВЛЕНИЯ (DIRECTIONS)
// ============================================

export async function createDirection(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const orderStr = formData.get("order") as string;
  const order = orderStr ? parseInt(orderStr, 10) : 0;
  const isActiveStr = formData.get("isActive") as string;
  const isActive = isActiveStr === "true" || isActiveStr === "on";

  if (!name || name.trim().length === 0) {
    return { error: "Название направления обязательно" };
  }

  try {
    const direction = await db.direction.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        order,
        isActive,
      },
    });

    revalidatePath("/admin/content");
    return { success: true, direction };
  } catch (error) {
    console.error("Error creating direction:", error);
    return { error: "Ошибка при создании направления" };
  }
}

export async function updateDirection(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const orderStr = formData.get("order") as string;
  const order = orderStr ? parseInt(orderStr, 10) : 0;
  const isActiveStr = formData.get("isActive") as string;
  const isActive = isActiveStr === "true" || isActiveStr === "on";

  if (!name || name.trim().length === 0) {
    return { error: "Название направления обязательно" };
  }

  try {
    const direction = await db.direction.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        order,
        isActive,
      },
    });

    revalidatePath("/admin/content");
    return { success: true, direction };
  } catch (error) {
    console.error("Error updating direction:", error);
    return { error: "Ошибка при обновлении направления" };
  }
}

export async function deleteDirection(id: number) {
  try {
    await db.direction.delete({
      where: { id },
    });

    revalidatePath("/admin/content");
    return { success: true };
  } catch (error) {
    console.error("Error deleting direction:", error);
    return { error: "Ошибка при удалении направления" };
  }
}

// ============================================
// КУРСЫ (COURSES)
// ============================================

export async function createCourse(formData: FormData) {
  const directionIdStr = formData.get("directionId") as string;
  const directionId = directionIdStr ? parseInt(directionIdStr, 10) : 0;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const orderStr = formData.get("order") as string;
  const order = orderStr ? parseInt(orderStr, 10) : 0;
  const isActiveStr = formData.get("isActive") as string;
  const isActive = isActiveStr === "true" || isActiveStr === "on";

  if (!directionId || isNaN(directionId)) {
    return { error: "Необходимо выбрать направление" };
  }

  if (!name || name.trim().length === 0) {
    return { error: "Название курса обязательно" };
  }

  try {
    const course = await db.course.create({
      data: {
        directionId,
        name: name.trim(),
        description: description?.trim() || null,
        order,
        isActive,
      },
    });

    revalidatePath("/admin/content");
    return { success: true, course };
  } catch (error) {
    console.error("Error creating course:", error);
    return { error: "Ошибка при создании курса" };
  }
}

export async function updateCourse(id: number, formData: FormData) {
  const directionIdStr = formData.get("directionId") as string;
  const directionId = directionIdStr ? parseInt(directionIdStr, 10) : 0;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const orderStr = formData.get("order") as string;
  const order = orderStr ? parseInt(orderStr, 10) : 0;
  const isActiveStr = formData.get("isActive") as string;
  const isActive = isActiveStr === "true" || isActiveStr === "on";

  if (!directionId || isNaN(directionId)) {
    return { error: "Необходимо выбрать направление" };
  }

  if (!name || name.trim().length === 0) {
    return { error: "Название курса обязательно" };
  }

  try {
    const course = await db.course.update({
      where: { id },
      data: {
        directionId,
        name: name.trim(),
        description: description?.trim() || null,
        order,
        isActive,
      },
    });

    revalidatePath("/admin/content");
    return { success: true, course };
  } catch (error) {
    console.error("Error updating course:", error);
    return { error: "Ошибка при обновлении курса" };
  }
}

export async function deleteCourse(id: number) {
  try {
    await db.course.delete({
      where: { id },
    });

    revalidatePath("/admin/content");
    return { success: true };
  } catch (error) {
    console.error("Error deleting course:", error);
    return { error: "Ошибка при удалении курса" };
  }
}

// ============================================
// УРОКИ (LESSONS)
// ============================================

export async function createLesson(formData: FormData) {
  const courseIdStr = formData.get("courseId") as string;
  const courseId = courseIdStr ? parseInt(courseIdStr, 10) : 0;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const content = formData.get("content") as string | null;
  const orderStr = formData.get("order") as string;
  const order = orderStr ? parseInt(orderStr, 10) : 0;
  const isActiveStr = formData.get("isActive") as string;
  const isActive = isActiveStr === "true" || isActiveStr === "on";

  if (!courseId || isNaN(courseId)) {
    return { error: "Необходимо выбрать курс" };
  }

  if (!name || name.trim().length === 0) {
    return { error: "Название урока обязательно" };
  }

  try {
    const lesson = await db.lesson.create({
      data: {
        courseId,
        name: name.trim(),
        description: description?.trim() || null,
        content: content?.trim() || null,
        order,
        isActive,
      },
    });

    revalidatePath("/admin/content");
    return { success: true, lesson };
  } catch (error) {
    console.error("Error creating lesson:", error);
    return { error: "Ошибка при создании урока" };
  }
}

export async function updateLesson(id: number, formData: FormData) {
  const courseIdStr = formData.get("courseId") as string;
  const courseId = courseIdStr ? parseInt(courseIdStr, 10) : 0;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const content = formData.get("content") as string | null;
  const orderStr = formData.get("order") as string;
  const order = orderStr ? parseInt(orderStr, 10) : 0;
  const isActiveStr = formData.get("isActive") as string;
  const isActive = isActiveStr === "true" || isActiveStr === "on";

  if (!courseId || isNaN(courseId)) {
    return { error: "Необходимо выбрать курс" };
  }

  if (!name || name.trim().length === 0) {
    return { error: "Название урока обязательно" };
  }

  try {
    const lesson = await db.lesson.update({
      where: { id },
      data: {
        courseId,
        name: name.trim(),
        description: description?.trim() || null,
        content: content?.trim() || null,
        order,
        isActive,
      },
    });

    revalidatePath("/admin/content");
    return { success: true, lesson };
  } catch (error) {
    console.error("Error updating lesson:", error);
    return { error: "Ошибка при обновлении урока" };
  }
}

export async function deleteLesson(id: number) {
  try {
    await db.lesson.delete({
      where: { id },
    });

    revalidatePath("/admin/content");
    return { success: true };
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return { error: "Ошибка при удалении урока" };
  }
}
