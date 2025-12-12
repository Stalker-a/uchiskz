import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Ищем (или создаем) предмет "Алгебра"
    const subject = await db.subject.upsert({
      where: { slug: "algebra" },
      update: {},
      create: {
        slug: "algebra",
        titleRu: "Алгебра",
        titleKz: "Алгебра",
      },
    });

    // 2. Ищем (или создаем) тему "Квадратные уравнения" внутри Алгебры
    // Примечание: upsert требует уникального поля, поэтому используем findFirst + create
    let topic = await db.topic.findFirst({
      where: { 
        subjectId: subject.id,
        titleRu: "Квадратные уравнения" 
      }
    });

    if (!topic) {
      topic = await db.topic.create({
        data: {
          titleRu: "Квадратные уравнения",
          titleKz: "Квадрат теңдеулер",
          grade: 8,
          subjectId: subject.id,
        }
      });
    }

    // 3. Создаем задачу в ЭТОЙ теме
    const newTask = await db.task.create({
      data: {
        contentRu: 'Чему равен дискриминант уравнения $x^2 - 5x + 6 = 0$?',
        contentKz: 'Теңдеудің дискриминанты неге тең $x^2 - 5x + 6 = 0$?',
        answer: '1',
        difficulty: 1,
        options: ['24', '1', '-1', '5'], // Варианты ответов
        topicId: topic.id,
      },
    });

    return NextResponse.json({ 
      message: "Успешно! Задача добавлена в Алгебру -> Квадратные уравнения", 
      task: newTask 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}