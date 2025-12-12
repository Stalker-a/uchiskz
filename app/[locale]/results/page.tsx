import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db"; // ✅ ПРАВИЛЬНО

interface ResultsPageProps {
  searchParams: Promise<{
    correct: string;
    total: string;
    topicId: string;
  }>;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  // Достаем цифры из ссылки (например, /results?correct=8&total=10)
  const { correct, total, topicId } = await searchParams;

  const score = Number(correct) || 0;
  const questions = Number(total) || 0;
  
  // Защита от деления на ноль
  const percentage = questions > 0 ? Math.round((score / questions) * 100) : 0;

  // Найдем название темы, чтобы было красиво
  const topic = topicId ? await db.topic.findUnique({ where: { id: parseInt(topicId) } }) : null;

  // Оценка смайликом
  let emoji = "🤔";
  let title = "Неплохо!";
  let color = "text-yellow-600";

  if (percentage >= 90) { emoji = "🏆"; title = "Грант наш!"; color = "text-green-600"; }
  else if (percentage >= 70) { emoji = "😎"; title = "Хороший результат!"; color = "text-blue-600"; }
  else if (percentage < 50) { emoji = "😅"; title = "Нужно потренироваться"; color = "text-red-600"; }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden text-center p-8 border border-slate-200">
        
        {/* Смайлик */}
        <div className="text-8xl mb-6 animate-bounce">{emoji}</div>
        
        <h1 className={`text-3xl font-extrabold mb-2 ${color}`}>{title}</h1>
        <p className="text-slate-500 mb-8">
            Тема: {topic?.titleRu || "Тренировка"}
        </p>

        {/* Карточка со счетом */}
        <div className="bg-slate-100 rounded-2xl p-6 mb-8">
          <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Твой результат</div>
          <div className="text-5xl font-black text-slate-900">
            {score} <span className="text-2xl text-slate-400 font-medium">/ {questions}</span>
          </div>
          <div className="mt-2 inline-block px-3 py-1 rounded-full bg-white shadow-sm text-sm font-bold text-slate-600">
            {percentage}%
          </div>
        </div>

        {/* Кнопки */}
        <div className="space-y-3">
          <Link 
            href="/"
            className="block w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Вернуться к предметам
          </Link>
          {topicId && (
            <Link 
               href={`/tasks/${await db.task.findFirst({ where: { topicId: parseInt(topicId) } }).then(t => t?.id)}`}
               className="block w-full bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-50 transition"
            >
              Пройти заново 🔄
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}