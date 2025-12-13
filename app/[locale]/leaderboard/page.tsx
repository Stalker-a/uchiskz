import { db } from "@/lib/db";
import { Trophy, Medal, Star } from "lucide-react";
import Link from "next/link";
// 👇 Импорты для защиты страницы
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface LeaderboardProps {
  searchParams: Promise<{ subject?: string }>;
}

export default async function LeaderboardPage({ searchParams }: LeaderboardProps) {
  // ---------------------------------------------------------
  // 1. ЗАЩИТА СТРАНИЦЫ
  // ---------------------------------------------------------
  const { userId } = await auth();
  
  // Если пользователь не вошел в систему — отправляем его на страницу входа
  if (!userId) {
    redirect("/sign-in");
  }

  // ---------------------------------------------------------
  // 2. ПОЛУЧЕНИЕ ДАННЫХ
  // ---------------------------------------------------------
  // Смотрим, какой фильтр выбран (из ссылки ?subject=...)
  const { subject: subjectId } = await searchParams;

  // Получаем список всех предметов для кнопок-фильтров
  const allSubjects = await db.subject.findMany({ orderBy: { titleRu: "asc" } });

  // Получаем пользователей в зависимости от фильтра
  let users;

  if (subjectId) {
    // Если выбран предмет -> берем данные из SubjectStat (таблица статистики предметов)
    users = await db.subjectStat.findMany({
      where: { subjectId: subjectId },
      orderBy: { score: "desc" },
      take: 50,
    });
  } else {
    // Если ничего не выбрано -> берем ОБЩИЙ рейтинг из UserStat
    users = await db.userStat.findMany({
      orderBy: { score: "desc" },
      take: 50,
    });
  }

  // Найдем название текущего предмета для заголовка
  const currentSubjectName = subjectId 
    ? allSubjects.find(s => s.id === subjectId)?.titleRu 
    : "Общий рейтинг";

  // ---------------------------------------------------------
  // 3. ОТРИСОВКА (UI)
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-slate-800 flex justify-center items-center gap-3 mb-2">
            <Trophy className="w-10 h-10 text-yellow-500" />
            {currentSubjectName}
          </h1>
          <p className="text-slate-500">
            {subjectId ? "Лучшие знатоки этого предмета" : "Самые активные ученики платформы"}
          </p>
        </div>

        {/* 🔘 КНОПКИ ФИЛЬТРОВ */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Link
            href="/leaderboard"
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${
              !subjectId 
                ? "bg-slate-800 text-white shadow-lg" 
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            🌍 Все предметы
          </Link>
          
          {allSubjects.map((sub) => (
            <Link
              key={sub.id}
              href={`/leaderboard?subject=${sub.id}`}
              className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                subjectId === sub.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {sub.titleRu}
            </Link>
          ))}
        </div>

        {/* 📋 ТАБЛИЦА */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          {users.map((user, index) => {
            // Красивые иконки для топ-3
            let rankContent = <span className="font-bold text-slate-500">{index + 1}</span>;
            let bgClass = "bg-white hover:bg-slate-50";

            if (index === 0) {
              rankContent = <Medal className="w-6 h-6 text-yellow-400 mx-auto" />; 
              bgClass = "bg-yellow-50/50 hover:bg-yellow-50 border-l-4 border-yellow-400";
            } else if (index === 1) {
              rankContent = <Medal className="w-6 h-6 text-slate-400 mx-auto" />;
              bgClass = "bg-slate-50 hover:bg-slate-100 border-l-4 border-slate-300";
            } else if (index === 2) {
              rankContent = <Medal className="w-6 h-6 text-orange-400 mx-auto" />;
              bgClass = "bg-orange-50/50 hover:bg-orange-50 border-l-4 border-orange-300";
            }

            return (
              <div key={user.id} className={`flex items-center justify-between p-4 border-b border-slate-100 transition ${bgClass}`}>
                <div className="flex items-center gap-4">
                  <div className="w-8 text-center">{rankContent}</div>
                  <div>
                    <div className="font-bold text-slate-800 text-lg">
                      {user.name || "Ученик"}
                    </div>
                    {/* Показываем кол-во тестов только в общем рейтинге (в SubjectStat этого поля нет) */}
                    {!subjectId && "tests" in user && (
                      <div className="text-xs text-slate-400">
                        Тестов: {user.tests}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full text-blue-700 font-bold">
                  <Star className="w-4 h-4 fill-blue-700" />
                  {user.score} XP
                </div>
              </div>
            );
          })}

          {users.length === 0 && (
            <div className="p-10 text-center text-slate-500">
              Пока в этом рейтинге пусто. Пройди тест и стань первым! 🚀
            </div>
          )}
        </div>

      </div>
    </div>
  );
}