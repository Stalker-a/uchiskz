import { PrismaClient } from "@prisma/client";

// 👇 ПРОВЕРЬ ИМПОРТЫ:
// Путь ./seeds/biology должен существовать, и внутри должен быть export const biologyData
import { biologyData } from "./seeds/biology"; 
import { historyData } from "./seeds/history";
import { mathData } from "./seeds/math"; 
import { physicsData } from "./seeds/physics"; 
import { informaticsData } from "./seeds/informatics";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Начинаем посев данных...");

  // Очистка старых данных
  await prisma.task.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.subject.deleteMany();
  console.log("🗑️ Старые данные удалены.");

  // 👇 ПРОВЕРЬ МАССИВ:
  // Убедись, что все эти переменные (biologyData, historyData...)
  // подсвечены цветом (значит, они найдены).
  // Если какая-то переменная серая или подчеркнута красным — проблема в импорте выше.
  const allSubjectsData = [
    biologyData,
    historyData,
    mathData,
    physicsData,
    informaticsData
  ];

  for (const data of allSubjectsData) {
    // 🔥 ОШИБКА БЫЛА ТУТ: Если data undefined, скрипт падает
    if (!data) {
      console.error("❌ ОШИБКА: Один из предметов не загрузился (undefined). Проверь импорты!");
      continue; 
    }

    const subject = await prisma.subject.create({
      data: {
        slug: data.subject.slug,
        titleRu: data.subject.titleRu,
        titleKz: data.subject.titleKz,
      }
    });
    console.log(`✅ Предмет создан: ${subject.titleRu}`);

    for (const topicData of data.topics) {
      const topic = await prisma.topic.create({
        data: {
          titleRu: topicData.titleRu,
          titleKz: topicData.titleKz,
          subjectId: subject.id,
          grade: 11
        }
      });
      console.log(`   📂 Тема создана: ${topic.titleRu}`);

      if (topicData.questions.length > 0) {
        const tasksToInsert = topicData.questions.map(q => ({
          topicId: topic.id,
          contentRu: q.contentRu,
          contentKz: q.contentKz,
          options: q.options,
          answer: q.answer,
          solution: q.solution,
          difficulty: 1
        }));

        await prisma.task.createMany({
          data: tasksToInsert
        });
        console.log(`      📝 Добавлено задач: ${tasksToInsert.length}`);
      }
    }
  }
  console.log("🏁 Посев завершен успешно!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });