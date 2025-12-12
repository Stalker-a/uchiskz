"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createSubject(formData: FormData) {
  const titleRu = formData.get("titleRu") as string;
  const titleKz = formData.get("titleKz") as string; // <--- Новое поле
  const slug = formData.get("slug") as string;

  if (!titleRu || !titleKz || !slug) return;

  try {
    await db.subject.create({
      data: {
        titleRu,
        titleKz, // Записываем настоящий казахский перевод
        slug: slug.toLowerCase(),
      },
    });

    revalidatePath("/admin");
  } catch (error) {
    console.error("Ошибка создания предмета:", error);
  }
}