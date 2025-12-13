"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateScore(
  points: number,       
  totalQuestions: number, 
  topicId?: string,     
  subjectId?: string    
) {
  const user = await currentUser();
  if (!user) return;

  // 👇 НОВАЯ ЛОГИКА: Если дали тему, но не дали предмет — найдем его сами
  if (topicId && !subjectId) {
    const topic = await db.topic.findUnique({
      where: { id: topicId },
      select: { subjectId: true }
    });
    if (topic) {
      subjectId = topic.subjectId;
    }
  }

  const displayName = user.firstName 
    ? `${user.firstName} ${user.lastName || ""}`.trim() 
    : "Ученик";

  // 1. Общий рейтинг
  await db.userStat.upsert({
    where: { userId: user.id },
    update: {
      score: { increment: points },
      tests: { increment: 1 },
      name: displayName
    },
    create: {
      userId: user.id,
      name: displayName,
      score: points,
      tests: 1
    }
  });

  // 2. Рейтинг Предмета
  if (subjectId) {
    await db.subjectStat.upsert({
      where: { userId_subjectId: { userId: user.id, subjectId } },
      update: { score: { increment: points }, name: displayName },
      create: { userId: user.id, subjectId, score: points, name: displayName }
    });
  }

  // 3. Статистика Темы
  if (topicId) {
    await db.topicStat.upsert({
      where: { userId_topicId: { userId: user.id, topicId } },
      update: { score: points, total: totalQuestions },
      create: {
        userId: user.id,
        topicId,
        score: points,
        total: totalQuestions,
        passed: true
      }
    });
  }

  // Обновляем кэш
  revalidatePath("/profile");
  revalidatePath("/subjects/[slug]"); 
  revalidatePath("/leaderboard");
}