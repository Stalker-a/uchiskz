"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MathText from "./MathText";
import { CheckCircle, XCircle, ArrowRight, BarChart3 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateScore } from "@/app/actions/updateScore"; // 👈 Добавил импорт

interface Task {
  id: string;
  topicId: string;
  contentRu: string;
  contentKz: string;
  options: string[];
  answer: string;
  solution: string | null;
}

const TOTAL_QUESTIONS = 20; 

export default function TaskTrainer({ 
  task, 
  nextTaskId 
}: { 
  task: Task | null; 
  nextTaskId?: string 
}) {
  const locale = useLocale();
  const t = useTranslations('Trainer');
  const router = useRouter(); // 👈 Инициализируем роутер

  const [selected, setSelected] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (!task) return;
    const storageKey = `score_${task.topicId}`;
    if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, "0");
    }
  }, [task]);

  if (!task) return <div className="p-10 text-center text-slate-500">Загрузка...</div>;

  const questionText = locale === 'kk' ? task.contentKz : task.contentRu;
  const finalContent = questionText || task.contentRu;
  const isCorrect = selected === task.answer;

  const handleCheck = () => {
    if (!selected) return;
    setIsChecked(true);

    const storageKey = `score_${task.topicId}`;
    const currentScore = parseInt(localStorage.getItem(storageKey) || "0");
    
    if (isCorrect) {
      localStorage.setItem(storageKey, (currentScore + 1).toString());
    }
  };

  // 👇 НОВАЯ ФУНКЦИЯ ЗАВЕРШЕНИЯ
  // 👇 Измени функцию handleFinish вот так:
  const handleFinish = async () => {
    const storageKey = `score_${task.topicId}`;
    const score = parseInt(localStorage.getItem(storageKey) || "0");

    // 🔥 1. СОХРАНЯЕМ В БАЗУ (Ждем завершения)
    // Нам не нужно передавать subjectId, новый updateScore найдет его сам!
    await updateScore(score, TOTAL_QUESTIONS, task.topicId);

    localStorage.removeItem(storageKey);

    // 🔥 2. ПЕРЕХОДИМ НА СТРАНИЦУ (Где просто покажем результат)
    router.push(`/results?correct=${score}&total=${TOTAL_QUESTIONS}&topicId=${task.topicId}`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-8">
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <span className="text-slate-500 font-bold tracking-wider text-sm">
            {t('question')}
          </span>
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
            <Link 
              href={`/tasks/${nextTaskId}`} 
              className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 hover:shadow-xl hover:-translate-y-1 transition"
            >
              {t('nextButton')} <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
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