import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import TaskTrainer from "@/components/TaskTrainer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface TaskPageProps {
  params: Promise<{
    taskId: string;
  }>;
}

export default async function TaskPage({ params }: TaskPageProps) {
  // 1. Ждем параметры (ОБЯЗАТЕЛЬНО для Next.js 15)
  const { taskId } = await params;

  // 2. Ищем задачу в базе
  const task = await db.task.findUnique({
    where: { id: taskId },
    include: {
      topic: { include: { subject: true } },
    },
  });

  // 3. Если задачи нет в базе — показываем ошибку 404
  if (!task) return notFound();

  // 4. Ищем ID следующей задачи (для кнопки "Далее")
  const nextTask = await db.task.findFirst({
    where: {
      topicId: task.topicId,
      id: { gt: task.id }, // ID больше текущего
    },
    orderBy: { id: "asc" },
    select: { id: true },
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto mb-6">
        <Link 
          href={`/subjects/${task.topic.subject.slug}`} 
          className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Назад к темам
        </Link>
      </div>

      <TaskTrainer task={task} nextTaskId={nextTask?.id} />
    </div>
  );
}