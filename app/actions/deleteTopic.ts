"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteTopic(formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) return;

  try {
    await db.topic.delete({
      where: { id },
    });

    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Ошибка удаления темы:", error);
  }
}