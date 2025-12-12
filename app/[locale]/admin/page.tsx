import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";

// 👇 1. НОВЫЕ ИМПОРТЫ ДЛЯ ЗАЩИТЫ
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

// Импортируем серверные действия (Actions)
import { createSubject } from "@/app/actions/createSubject";
import { createTopic } from "@/app/actions/createTopic";
import { createTask } from "@/app/actions/createTask";
import { deleteSubject } from "@/app/actions/deleteSubject";
import { deleteTopic } from "@/app/actions/deleteTopic";
import { deleteTask } from "@/app/actions/deleteTask";

// Компонент для красивого отображения формул
import MathText from "@/components/MathText";

export default async function AdminPage() {
  // 👇 2. ЛОГИКА ЗАЩИТЫ (Вставляем в самое начало)
  const { userId } = auth();

  // Если не вошел — отправляем на вход
  if (!userId) {
    redirect("/sign-in");
  }

  // Если ID не совпадает с Админом — выкидываем на главную
  if (userId !== "user_36huiyWyu7re6JWPtpwFf7VI6is") { 
    redirect("/");
  }

  // 👇 ДАЛЬШЕ ТВОЙ СТАРЫЙ КОД (без изменений)
  // 1. Получаем данные из базы
  const subjects = await db.subject.findMany({ 
    orderBy: { id: 'asc' },
    include: { topics: true } // Чтобы показать количество тем
  });
  
  const topics = await db.topic.findMany({ 
    include: { subject: true }, 
    orderBy: { id: 'desc' } 
  });
  
  const tasks = await db.task.findMany({
    orderBy: { id: "desc" },
    include: { topic: { include: { subject: true } } },
    take: 50 // Ограничим вывод 50 последними задачами
  });

  return (
    <div className="min-h-screen bg-slate-100 p-6 font-sans text-slate-900">
      
      {/* --- КНОПКА ВОЗВРАТА НА ГЛАВНУЮ --- */}
      <div className="max-w-7xl mx-auto mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center text-slate-500 hover:text-blue-600 font-bold transition bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Вернуться на сайт
        </Link>
      </div>

      <h1 className="text-3xl font-extrabold text-slate-800 mb-8 text-center uppercase tracking-wide">
        Панель Управления 🛡️
      </h1>

      {/* --- СЕТКА ИЗ 3 КОЛОНОК --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1600px] mx-auto mb-12">

        {/* ========================================== */}
        {/* 1. ПРЕДМЕТЫ */}
        {/* ========================================== */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-t-8 border-purple-500">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            📚 1. Предмет
          </h2>
          
          {/* Форма создания */}
          <form action={createSubject} className="space-y-3 mb-8 bg-purple-50 p-4 rounded-xl border border-purple-100">
            <input name="slug" placeholder="URL (например: math, physics)" className="w-full p-3 border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" required />
            <input name="titleRu" placeholder="Название (RU)" className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" required />
            <input name="titleKz" placeholder="Название (KZ)" className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" required />
            <button className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition shadow-md hover:shadow-lg transform active:scale-95">
              Создать Предмет
            </button>
          </form>

          {/* Список */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {subjects.map((s) => (
              <div key={s.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center group hover:border-purple-300 transition">
                <div>
                   <div className="font-bold text-slate-800">{s.titleRu}</div>
                   <div className="text-xs text-slate-400 font-mono">{s.slug} • Тем: {s.topics.length}</div>
                </div>
                
                {/* Кнопка удаления */}
                <form action={deleteSubject}>
                  <input type="hidden" name="id" value={s.id} />
                  <button className="text-red-400 hover:text-white hover:bg-red-500 p-2 rounded-lg transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================== */}
        {/* 2. ТЕМЫ */}
        {/* ========================================== */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-t-8 border-blue-500">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            📑 2. Тема
          </h2>

          {/* Форма создания */}
          <form action={createTopic} className="space-y-3 mb-8 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <select name="subjectId" className="w-full p-3 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer" required>
              <option value="">Выберите предмет...</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.titleRu}</option>)}
            </select>
            <input name="titleRu" placeholder="Название темы (RU)" className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            <input name="titleKz" placeholder="Название темы (KZ)" className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg transform active:scale-95">
              Создать Тему
            </button>
          </form>

          {/* Список */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {topics.map((t) => (
              <div key={t.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center group hover:border-blue-300 transition">
                <div>
                  <span className="text-[10px] uppercase font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-md mb-1 inline-block">
                    {t.subject.titleRu}
                  </span>
                  <div className="font-bold text-sm text-slate-800 leading-tight">{t.titleRu}</div>
                </div>
                
                {/* Кнопка удаления */}
                <form action={deleteTopic}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="text-red-400 hover:text-white hover:bg-red-500 p-2 rounded-lg transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================== */}
        {/* 3. ЗАДАЧИ */}
        {/* ========================================== */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-t-8 border-green-500">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            ✏️ 3. Задача
          </h2>

          {/* Форма создания */}
          <form action={createTask} className="space-y-3 mb-8 bg-green-50 p-4 rounded-xl border border-green-100">
            <select name="topicId" className="w-full p-3 border border-green-200 rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none cursor-pointer" required>
              <option value="">Выберите тему...</option>
              {topics.map(t => <option key={t.id} value={t.id}>{t.subject.titleRu} — {t.titleRu}</option>)}
            </select>
            
            <textarea name="contentRu" placeholder="Текст вопроса (RU)" className="w-full p-3 border border-green-200 rounded-lg min-h-[80px] text-sm focus:ring-2 focus:ring-green-500 outline-none" required />
            <textarea name="contentKz" placeholder="Текст вопроса (KZ)" className="w-full p-3 border border-green-200 rounded-lg min-h-[80px] text-sm focus:ring-2 focus:ring-green-500 outline-none" required />
            
            <div className="grid grid-cols-2 gap-2">
               <input name="opt1" placeholder="Вариант A" className="p-2 border border-green-200 rounded-lg text-sm" required />
               <input name="opt2" placeholder="Вариант B" className="p-2 border border-green-200 rounded-lg text-sm" required />
               <input name="opt3" placeholder="Вариант C" className="p-2 border border-green-200 rounded-lg text-sm" required />
               <input name="opt4" placeholder="Вариант D" className="p-2 border border-green-200 rounded-lg text-sm" required />
            </div>

            <input name="answer" placeholder="Правильный ответ (текст варианта)" className="w-full p-3 border-2 border-green-400 bg-white rounded-lg text-sm font-bold text-green-700 placeholder-green-700/50 focus:ring-2 focus:ring-green-500 outline-none" required />
            <input name="solution" placeholder="Объяснение (необязательно)" className="w-full p-3 border border-green-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />

            <button className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition shadow-md hover:shadow-lg transform active:scale-95">
              Добавить Задачу
            </button>
          </form>

          {/* Список (последние 50) */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {tasks.map((task) => (
              <div key={task.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-start group hover:border-green-300 transition">
                <div className="overflow-hidden w-full">
                  <div className="text-[10px] text-slate-400 mb-1 truncate">
                    {task.topic.subject.titleRu} / {task.topic.titleRu}
                  </div>
                  <div className="text-sm font-medium line-clamp-2 mb-2">
                    <MathText text={task.contentRu} />
                  </div>
                  <div className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold border border-green-200">
                    Ответ: {task.answer}
                  </div>
                </div>
                
                {/* Кнопка удаления */}
                <form action={deleteTask} className="ml-2">
                  <input type="hidden" name="id" value={task.id} />
                  <button className="text-red-400 hover:text-white hover:bg-red-500 p-2 rounded-lg transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}