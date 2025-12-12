"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { rootTaskDispose } from "next/dist/build/swc/generated-native";

export async function deleteSubject(formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) return;

  try {
    await db.subject.delete({
      where: { id },
    });
    
    // Обновляем ВЕСЬ сайт, чтобы точно сбросить кэш во всех языках
    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Ошибка удаления предмета:", error);
  }
}