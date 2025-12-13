import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";

interface TopicStartPageProps {
  params: Promise<{ topicId: string }>;
}

export default async function TopicStartPage({ params }: TopicStartPageProps) {
  const { topicId } = await params;

  // 1. Ищем ПЕРВУЮ задачу в этой теме
  const firstTask = await db.task.findFirst({
    where: { topicId: topicId },
    orderBy: { id: "asc" }, // Сортируем от старых к новым (или desc, если наоборот)
  });

  // 2. Если задач в теме вообще нет — показываем ошибку или возвращаемся
  if (!firstTask) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Ой! 😕</h1>
        <p className="text-slate-500 mb-6">В этой теме пока нет задач.</p>
        <a href="/#subjects" className="text-blue-600 hover:underline font-bold">
          Вернуться назад
        </a>
      </div>
    );
  }

  // 3. Если задача есть — перекидываем пользователя на неё
  redirect(`/tasks/${firstTask.id}`);
}