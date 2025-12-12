"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createTask(formData: FormData) {
  // 1. Получаем ID Темы (а не предмета!)
  const topicId = formData.get("topicId") as string;
  
  const contentRu = formData.get("contentRu") as string;
  const contentKz = formData.get("contentKz") as string;
  const answer = formData.get("answer") as string;
  const solution = formData.get("solution") as string;

  // Собираем варианты ответов
  const opt1 = formData.get("opt1") as string;
  const opt2 = formData.get("opt2") as string;
  const opt3 = formData.get("opt3") as string;
  const opt4 = formData.get("opt4") as string;

  if (!topicId || !contentRu || !answer) return;

  try {
    await db.task.create({
      data: {
        topicId: topicId, // ✅ Используем topicId (строка)
        contentRu,
        contentKz,
        answer,
        solution: solution || null,
        options: [opt1, opt2, opt3, opt4], // Массив строк
        difficulty: 1,
      },
    });

    revalidatePath("/", "layout");
  } catch (error) {
    console.log("Ошибка создания задачи:", error);
  }
}