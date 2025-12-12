"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MathText from "./MathText";
import { CheckCircle, XCircle, ArrowRight, BarChart3, Trophy, Home } from "lucide-react"; // Импортируй иконки
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { finishTopic } from "@/app/actions/finishTopic"; // Наше новое действие
// Импортируем график
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Task {
  id: string;
  topicId: string; // Важно: нам нужен ID темы
  contentRu: string;
  contentKz: string;
  options: string[];
  answer: string;
  solution: string | null;
}

export default function TaskTrainer({ 
  task, 
  nextTaskId 
}: { 
  task: Task | null; 
  nextTaskId?: string 
}) {
  const locale = useLocale();
  const t = useTranslations('Trainer');

  // --- СОСТОЯНИЯ ---
  const [selected, setSelected] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [showResultScreen, setShowResultScreen] = useState(false); // Показать график?
  const [chartData, setChartData] = useState<any[]>([]); // Данные для графика
  const [finalScore, setFinalScore] = useState(0); // Итоговый счет

  // --- СЧЕТЧИК БАЛЛОВ (LocalStorage) ---
  // При загрузке страницы проверяем, есть ли сохраненный счет для этой темы
  useEffect(() => {
    if (!task) return;
    const storageKey = `score_${task.topicId}`;
    
    // Если это первая задача в теме (можно определить по логике, но упростим)
    // Мы просто читаем текущий счет. Если его нет — значит 0.
    // А сбрасывать будем при выходе.
  }, [task]);

  if (!task) return <div className="p-10 text-center text-slate-500">Загрузка...</div>;

  const questionText = locale === 'kk' ? task.contentKz : task.contentRu;
  const finalContent = questionText || task.contentRu;
  const isCorrect = selected === task.answer;

  // --- ЛОГИКА ПРОВЕРКИ ---
  const handleCheck = () => {
    if (!selected) return;
    setIsChecked(true);

    // Сохраняем балл в браузере
    const storageKey = `score_${task.topicId}`;
    const currentScore = parseInt(localStorage.getItem(storageKey) || "0");
    
    if (isCorrect) {
      localStorage.setItem(storageKey, (currentScore + 1).toString());
    }
  };

  // --- ЛОГИКА ЗАВЕРШЕНИЯ ---
  const handleFinish = async () => {
    // 1. Считываем итоговый счет
    const storageKey = `score_${task.topicId}`;
    const score = parseInt(localStorage.getItem(storageKey) || "0");
    const totalQuestions = parseInt(localStorage.getItem(`total_${task.topicId}`) || "5"); // Можно передавать реальное кол-во

    setFinalScore(score);

    // 2. Отправляем на сервер и получаем данные для графика
    // (Пока хардкодим 5 вопросов для примера, или можно посчитать)
    const data = await finishTopic(task.topicId, score, 5); // 5 - условное число вопросов в тесте
    setChartData(data);
    
    // 3. Показываем экран результатов
    setShowResultScreen(true);
    
    // 4. Чистим память
    localStorage.removeItem(storageKey);
  };

  // --- ЭКРАН РЕЗУЛЬТАТОВ (ГРАФИК) ---
  if (showResultScreen) {
    // Определяем мотивацию
    let messageTitle = "";
    let messageDesc = "";
    if (finalScore === 5) { messageTitle = "Легенда! 🏆"; messageDesc = "Ты уничтожил этот тест. Идеально!"; }
    else if (finalScore >= 3) { messageTitle = "Хорошая работа! 👍"; messageDesc = "Ты выше среднего, но можно еще лучше."; }
    else { messageTitle = "Не сдавайся! 💪"; messageDesc = "Ошибки делают нас сильнее. Попробуй еще раз!"; }

    return (
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 text-center">
         <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 text-blue-600 rounded-full mb-6">
              <Trophy className="w-10 h-10" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-slate-800">{messageTitle}</h2>
            <p className="text-slate-500 mb-8 text-lg">{messageDesc}</p>

            <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Твой результат</div>
              <div className="text-5xl font-extrabold text-blue-600 mb-2">{finalScore} / 5</div>
            </div>

            {/* ГРАФИК */}
            <div className="h-64 w-full mb-8">
               <p className="text-xs text-slate-400 mb-2 text-left">Как отвечали другие ученики:</p>
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData}>
                   <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                   <Tooltip 
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   />
                   <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                 </BarChart>
               </ResponsiveContainer>
            </div>

            <Link href="/#subjects" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition">
              <Home className="w-5 h-5" /> Вернуться к предметам
            </Link>
         </motion.div>
      </div>
    );
  }

  // --- ОБЫЧНЫЙ ЭКРАН ВОПРОСА ---
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-8">
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <span className="text-slate-500 font-bold tracking-wider text-sm">
            {t('question')}
          </span>
          {/* Сброс прогресса, если нужно */}
        </div>
        
        <div className="p-8 md:p-12">
          <div className="text-2xl md:text-3xl font-medium text-slate-800 leading-relaxed mb-8">
             <MathText text={finalContent} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {task.options.map((option, index) => {
              const isSelected = selected === option;
              let style = "border-slate-200 hover:border-blue-400 hover:bg-blue-50";
              
              if (isChecked) {
                if (option === task.answer) style = "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-500 ring-offset-2";
                else if (isSelected) style = "border-red-500 bg-red-50 text-red-700";
                else style = "border-slate-100 opacity-50";
              } else if (isSelected) {
                style = "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600 ring-offset-2";
              }

              return (
                <button
                  key={index}
                  onClick={() => !isChecked && setSelected(option)}
                  disabled={isChecked}
                  className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-4 group ${style}`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    isSelected || (isChecked && option === task.answer) ? 'bg-current text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-lg font-medium">
                    <MathText text={option} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isChecked && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-6 mb-8 border-l-4 shadow-lg ${isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}
          >
             <div className="flex gap-4">
                {isCorrect ? <CheckCircle className="w-8 h-8 text-green-600" /> : <XCircle className="w-8 h-8 text-red-600" />}
                <div>
                  <h3 className={`text-xl font-bold mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    {isCorrect ? t('correctTitle') : t('wrongTitle')}
                  </h3>
                  <div className="text-slate-600">
                    <MathText text={task.solution || ""} />
                  </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end gap-4">
        {!isChecked ? (
          <button 
            onClick={handleCheck}
            disabled={!selected}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('checkButton')}
          </button>
        ) : (
          nextTaskId ? (
             <a 
               href={`/tasks/${nextTaskId}`} 
               className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 hover:shadow-xl hover:-translate-y-1 transition"
             >
               {t('nextButton')} <ArrowRight className="w-5 h-5" />
             </a>
          ) : (
            // 👇 КНОПКА ТЕПЕРЬ ЗАПУСКАЕТ ЭКРАН РЕЗУЛЬТАТОВ
            <button 
               onClick={handleFinish}
               className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 hover:shadow-xl hover:-translate-y-1 transition"
            >
               {t('finishButton')} <BarChart3 className="w-5 h-5" />
            </button>
          )
        )}
      </div>
    </div>
  );
}