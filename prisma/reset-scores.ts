import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Начинаем полное обнуление баллов...");

  // 1. Удаляем статистику по конкретным темам (галочки и результаты тестов)
  const topicStats = await prisma.topicStat.deleteMany();
  console.log(`✅ Удалено записей о пройденных темах: ${topicStats.count}`);

  // 2. Удаляем статистику по предметам (Информатика, Биология и т.д.)
  const subjectStats = await prisma.subjectStat.deleteMany();
  console.log(`✅ Удалено записей о предметах: ${subjectStats.count}`);

  // 3. Удаляем общий рейтинг пользователей (XP и уровень)
  // Мы удаляем записи целиком. Когда пользователь пройдет первый тест,
  // запись создастся заново с правильными баллами.
  const userStats = await prisma.userStat.deleteMany();
  console.log(`✅ Удалено записей из общего рейтинга: ${userStats.count}`);

  console.log("🚀 Готово! Все баллы обнулены. Рейтинг чист.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
  