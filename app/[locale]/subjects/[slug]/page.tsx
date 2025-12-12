import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Calculator, PlayCircle } from "lucide-react"; // Добавил иконки для красоты

// Отключаем кэш, чтобы новые темы появлялись сразу
export const dynamic = "force-dynamic";

interface SubjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { slug } = await params;

  // 1. Ищем предмет в базе по его slug (например, "physics")
  const subject = await db.subject.findUnique({
    where: { slug: slug },
    include: {
      topics: {
        orderBy: { id: 'asc' }, // Сортируем темы по порядку создания
        include: { 
          tasks: {
            // 🔥 ВАЖНО: Сортируем задачи по ID (от старых к новым)
            // Это гарантирует, что tasks[0] - это действительно первая задача
            orderBy: { id: 'asc' },
            select: { id: true } // Нам нужен только ID для ссылки
          } 
        }, 
      }
    },
  });

  // Если такого предмета нет в базе -> ошибка 404
  if (!subject) return notFound();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Шапка предмета */}
      <div className="bg-white border-b border-slate-200 py-10 px-6 mb-8 shadow-sm">
        <div className="max-w-4xl mx-auto">
            <Link 
              href="/" 
              className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-6 transition group"
            >
              <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition" /> 
              На главную
            </Link>
            
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{subject.titleRu}</h1>
                <p className="text-slate-500 font-medium">{subject.titleKz}</p>
              </div>
            </div>
        </div>
      </div>

      {/* Список тем */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Темы курса</h2>
          <span className="text-sm font-bold bg-slate-200 text-slate-600 px-3 py-1 rounded-full">
            {subject.topics.length} тем
          </span>
        </div>
        
        <div className="space-y-4">
          {subject.topics.map((topic, index) => (
            <div 
              key={topic.id} 
              className="group bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300"
            >
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition">
                        {topic.titleRu}
                      </h3>
                      <p className="text-sm text-slate-500 mb-2">{topic.titleKz}</p>
                      
                      <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">
                        <Calculator className="w-3 h-3" />
                        Задач: {topic.tasks.length}
                      </div>
                    </div>
                  </div>

                  {/* Кнопка действия */}
                  <div className="flex-shrink-0">
                    {topic.tasks.length > 0 ? (
                      <Link 
                        href={`/tasks/${topic.tasks[0].id}`} // Ведем на САМУЮ ПЕРВУЮ задачу (благодаря orderBy)
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                      >
                        <PlayCircle className="w-5 h-5" />
                        Начать тест
                      </Link>
                    ) : (
                      <button disabled className="bg-slate-100 text-slate-400 px-6 py-3 rounded-lg font-bold cursor-not-allowed border border-slate-200">
                        Скоро будет
                      </button>
                    )}
                  </div>
               </div>
            </div>
          ))}

          {subject.topics.length === 0 && (
             <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
               <p className="text-slate-400 font-medium">В этом предмете пока нет тем.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}