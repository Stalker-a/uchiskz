"use server";

import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function finishTopic(topicId: string, score: number, total: number) {
  // 1. Проверяем авторизацию
  const { userId } = await auth();
  const user = await currentUser();

  // Если пользователь не авторизован, выбрасываем ошибку
  if (!userId || !user) {
    throw new Error("Вы должны войти в систему, чтобы сохранить результат.");
  }

  // 2. Сохраняем конкретный результат прохождения теста
  await db.result.create({
    data: {
      topicId,
      score,
      total,
      userId,
    },
  });

  // 3. Находим тему, чтобы узнать предмет (для статистики)
  const topic = await db.topic.findUnique({
    where: { id: topicId },
    select: { subjectId: true },
  });

  if (topic) {
    // 4. Обновляем рейтинг по ПРЕДМЕТУ (SubjectStat)
    await db.subjectStat.upsert({
      where: {
        userId_subjectId: {
          userId: userId,
          subjectId: topic.subjectId,
        },
      },
      update: { score: { increment: score } },
      create: {
        userId: userId,
        subjectId: topic.subjectId,
        name: user.firstName || "Ученик",
        score: score,
      },
    });
  }

  // 5. Обновляем ОБЩИЙ рейтинг пользователя (UserStat)
  await db.userStat.upsert({
    where: { userId: userId },
    update: {
      score: { increment: score },
      tests: { increment: 1 },
    },
    create: {
      userId: userId,
      name: user.firstName || "Ученик",
      score: score,
      tests: 1,
    },
  });

  // --- ГЕНЕРАЦИЯ ДАННЫХ ДЛЯ ГРАФИКА (Исправление ошибки) ---
  
  // 6. Получаем результаты ВСЕХ учеников по этой теме
  const allResults = await db.result.findMany({
    where: { topicId },
    select: { score: true }
  });

  // 7. Считаем распределение (сколько людей набрали 0, 1, 2... баллов)
  // Создаем массив нулей длиной (total + 1). Например, если total=5, массив [0,0,0,0,0,0]
  const distribution = new Array(total + 1).fill(0);

  allResults.forEach((r) => {
    // Учитываем только корректные баллы (защита от ошибок базы)
    if (r.score <= total) {
      distribution[r.score]++;
    }
  });

  // 8. Форматируем данные для библиотеки Recharts
  const chartData = distribution.map((count, index) => ({
    name: index.toString(), // Ось X: Балл (0, 1, 2...)
    users: count            // Ось Y: Количество людей
  }));

  // 9. Обновляем кэш страниц, чтобы рейтинги обновились сразу
  revalidatePath("/leaderboard");
  revalidatePath("/subjects");

  // 10. ВОЗВРАЩАЕМ ДАННЫЕ В КОМПОНЕНТ
  // Именно этого не хватало, из-за чего возникала ошибка 'data' is undefined
  return chartData;
}