"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createTopic(formData: FormData) {
  const subjectId = formData.get("subjectId") as string;
  const titleRu = formData.get("titleRu") as string;
  const titleKz = formData.get("titleKz") as string; // <--- Новое поле

  if (!subjectId || !titleRu || !titleKz) return;

  try {
    await db.topic.create({
      data: {
        titleRu,
        titleKz,
        subjectId: subjectId as string,
        grade: 11,
      },
    });

    revalidatePath("/admin");
  } catch (error) {
    console.error("Ошибка создания темы:", error);
  }
}