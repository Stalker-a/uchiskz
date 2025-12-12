"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteTask(formData: FormData) {
  // 1. Получаем ID задачи, которую надо удалить
  const taskId = formData.get("taskId") as string;

  if (!taskId) return;

  // 2. Удаляем из базы
  try {
    await db.task.delete({
      where: {id:taskId },
    });

    // 3. Обновляем страницу админки (чтобы задача исчезла из списка)
    revalidatePath("/admin");
    revalidatePath("/"); // И на главной тоже обновляем
  } catch (error) {
    console.error("Ошибка удаления:", error);
  }
}