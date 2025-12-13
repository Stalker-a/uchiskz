import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, CheckCircle, PlayCircle } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

interface SubjectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { slug } = await params;
  const { userId } = await auth(); // Получаем ID пользователя

  // 1. Ищем предмет и его темы
  const subject = await db.subject.findUnique({
    where: { slug },
    include: {
      topics: {
        orderBy: { id: "asc" }
      }
    }
  });

  if (!subject) return notFound();

  // 2. 🔥 Получаем статистику пользователя по темам этого предмета
  let userStats: Record<string, { score: number; total: number }> = {};

  if (userId) {
    const stats = await db.topicStat.findMany({
      where: {
        userId: userId,
        topicId: { in: subject.topics.map(t => t.id) } // Берем стату только для тем этого предмета
      }
    });

    // Превращаем массив в удобный объект: { "id_темы": {score: 5, total: 10}, ... }
    stats.forEach(s => {
      userStats[s.topicId] = { score: s.score, total: s.total };
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
      
      {/* Кнопка назад */}
      <div className="max-w-4xl mx-auto mb-6">
        <Link href="/#subjects" className="inline-flex items-center text-slate-500 hover:text-blue-600 font-bold transition">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Назад к предметам
        </Link>
      </div>

      {/* Заголовок предмета */}
      <div className="max-w-4xl mx-auto mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 uppercase tracking-wide">
          {subject.titleRu}
        </h1>
        <p className="text-slate-500">Выберите тему для тренировки</p>
      </div>

      {/* Список тем */}
      <div className="max-w-3xl mx-auto space-y-4">
        {subject.topics.map((topic) => {
          // Проверяем, есть ли результат в нашем объекте userStats
          const stat = userStats[topic.id];
          const isPassed = !!stat; // Если запись есть — значит true (пройдено)

          return (
            <Link 
              key={topic.id} 
              // Ссылка ведет на промежуточную страницу, которая найдет первую задачу
              href={`/tasks/topic/${topic.id}`} 
              className={`group block p-6 rounded-2xl border-2 transition-all duration-200 relative overflow-hidden ${
                isPassed 
                  ? "bg-green-50 border-green-200 hover:border-green-400" // 🟢 ЗЕЛЕНЫЙ ЦВЕТ
                  : "bg-white border-slate-200 hover:border-blue-400 hover:shadow-lg"
              }`}
            >
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-4">
                  {/* Иконка: Галочка или Play */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isPassed 
                      ? "bg-green-200 text-green-700" 
                      : "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition"
                  }`}>
                    {isPassed ? <CheckCircle className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                  </div>
                  
                  {/* Название темы */}
                  <div>
                    <h3 className={`text-lg font-bold ${isPassed ? "text-green-900" : "text-slate-800"}`}>
                      {topic.titleRu}
                    </h3>
                    {isPassed && (
                      <div className="text-xs font-bold text-green-600 uppercase tracking-wider mt-1">
                        Пройдено
                      </div>
                    )}
                  </div>
                </div>

                {/* 🔥 БАЛЛЫ (Показываем только если пройдено) */}
                {isPassed && (
                  <div className="text-right">
                    <div className="text-2xl font-black text-green-600">
                      {stat.score}
                      <span className="text-sm text-green-400 font-medium">/{stat.total}</span>
                    </div>
                  </div>
                )}
                
                {/* Стрелочка (Показываем только если НЕ пройдено) */}
                {!isPassed && (
                  <div className="opacity-0 group-hover:opacity-100 transition text-blue-500 transform group-hover:translate-x-1">
                      <ArrowLeft className="w-6 h-6 rotate-180" />
                  </div>
                )}
              </div>
            </Link>
          );
        })}

        {subject.topics.length === 0 && (
          <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
            В этом предмете пока нет тем. Скоро добавим! 🏗️
          </div>
        )}
      </div>

    </div>
  );
}