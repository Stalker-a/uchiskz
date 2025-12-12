"use server";

import { db } from "@/lib/db";

export async function finishTopic(topicId: string, score: number, total: number) {
  // 1. Сохраняем результат ученика
  await db.result.create({
    data: {
      topicId,
      score,
      total,
    },
  });

  // 2. Получаем статистику по этой теме
  const allResults = await db.result.findMany({
    where: { topicId },
  });

  // 3. Готовим данные для графика (Группируем: сколько людей набрали 0, 1, 2... баллов)
  // Создаем массив нулей длиной (total + 1)
  const distribution = new Array(total + 1).fill(0);

  allResults.forEach((r) => {
    // Если вопросов стало меньше/больше, игнорируем старые некорректные записи
    if (r.score <= total) {
      distribution[r.score]++;
    }
  });

  // Превращаем в формат для графика: [{ name: "1 балл", count: 5 }, ...]
  const chartData = distribution.map((count, score) => ({
    name: `${score}`,
    users: count,
  }));

  return chartData;
}