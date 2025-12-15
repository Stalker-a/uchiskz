"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateScore(
  newPoints: number,       
  totalQuestions: number, 
  topicId?: string,     
  subjectId?: string    
) {
  const user = await currentUser();
  if (!user) return;

  // 1. Если передана тема, но не передан предмет — найдем его
  if (topicId && !subjectId) {
    const topic = await db.topic.findUnique({
      where: { id: topicId },
      select: { subjectId: true }
    });
    if (topic) {
      subjectId = topic.subjectId;
    }
  }

  // 2. ЛОГИКА СОХРАНЕНИЯ РЕЗУЛЬТАТА ТЕМЫ
  // Мы должны сохранять только ЛУЧШИЙ результат
  if (topicId) {
    // Ищем старый результат по этой теме
    const existingStat = await db.topicStat.findUnique({
      where: { 
        userId_topicId: { 
          userId: user.id, 
          topicId 
        } 
      }
    });

    // Если результата не было ИЛИ новый результат лучше старого — обновляем
    if (!existingStat || newPoints > existingStat.score) {
      await db.topicStat.upsert({
        where: { userId_topicId: { userId: user.id, topicId } },
        update: { 
          score: newPoints, 
          total: totalQuestions,
          passed: true 
        },
        create: {
          userId: user.id,
          topicId,
          score: newPoints,
          total: totalQuestions,
          passed: true
        }
      });
      console.log(`📈 Обновлен рекорд темы: ${newPoints} баллов`);
    } else {
      console.log(`😐 Новый результат (${newPoints}) не лучше старого (${existingStat.score}). Пропускаем.`);
    }
  }

  // 3. ПЕРЕСЧЕТ ОБЩЕГО РЕЙТИНГА (Самое важное!)
  // Мы не прибавляем (+), мы считаем сумму всех пройденных тем заново.
  // Это гарантирует, что баллы никогда не "наслоятся" ошибочно.

  // Получаем все пройденные темы пользователя
  const allUserStats = await db.topicStat.findMany({
    where: { userId: user.id }
  });

  // Считаем общую сумму баллов
  const totalXP = allUserStats.reduce((sum, stat) => sum + stat.score, 0);
  // Считаем количество пройденных тестов
  const totalTests = allUserStats.length;

  const displayName = user.firstName 
    ? `${user.firstName} ${user.lastName || ""}`.trim() 
    : "Ученик";

  // 4. Обновляем Глобальный Рейтинг (UserStat)
  await db.userStat.upsert({
    where: { userId: user.id },
    update: {
      score: totalXP,       // 👈 Записываем точную сумму (SET), а не прибавляем (INCREMENT)
      tests: totalTests,
      name: displayName
    },
    create: {
      userId: user.id,
      name: displayName,
      score: totalXP,
      tests: totalTests
    }
  });

  // 5. Обновляем Рейтинг Предмета (SubjectStat)
  // Тоже через пересчет, чтобы было точно
  if (subjectId) {
    // Берем все темы только этого предмета
    const subjectStats = await db.topicStat.findMany({
      where: { 
        userId: user.id,
        topic: { subjectId: subjectId } // Фильтр через связь с Topic
      }
    });

    const subjectXP = subjectStats.reduce((sum, stat) => sum + stat.score, 0);

    await db.subjectStat.upsert({
      where: { userId_subjectId: { userId: user.id, subjectId } },
      update: { score: subjectXP, name: displayName },
      create: { userId: user.id, subjectId, score: subjectXP, name: displayName }
    });
  }

  // Обновляем страницы, чтобы пользователь сразу увидел изменения
  revalidatePath("/profile");
  revalidatePath("/subjects/[slug]"); 
  revalidatePath("/leaderboard");
}