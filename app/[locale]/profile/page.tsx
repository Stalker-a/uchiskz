import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { GraduationCap, Star, Trophy, Clock } from "lucide-react";
import Image from "next/image";

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Загружаем статистику
  const stat = await db.userStat.findUnique({ where: { userId: user.id } });
  
  // Загружаем последние пройденные темы
  const recentTopics = await db.topicStat.findMany({
    where: { userId: user.id },
    orderBy: { id: "desc" }, // Показываем последние
    take: 5,
    include: { topic: { include: { subject: true } } }
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Шапка профиля */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-8 mb-8">
          <div className="relative">
            <Image 
              src={user.imageUrl} 
              alt="Avatar" 
              width={120} 
              height={120} 
              className="rounded-full border-4 border-blue-100 shadow-sm"
            />
            <div className="absolute bottom-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
              LVL {Math.floor((stat?.score || 0) / 100) + 1}
            </div>
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-slate-500 mb-4">{user.emailAddresses[0].emailAddress}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                <Star className="w-5 h-5" /> {stat?.score || 0} XP
              </div>
              <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5" /> Тестов: {stat?.tests || 0}
              </div>
            </div>
          </div>
        </div>

        {/* История */}
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-400" />
          Последние активности
        </h2>

        <div className="space-y-3">
          {recentTopics.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {item.topic.subject.titleRu}
                </div>
                <div className="font-bold text-slate-800 text-lg">
                  {item.topic.titleRu}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-green-600">
                  {item.score}
                  <span className="text-sm text-slate-400 font-medium">/{item.total}</span>
                </div>
              </div>
            </div>
          ))}

          {recentTopics.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
              Вы еще не прошли ни одного теста. <br/>
              Самое время начать! 🚀
            </div>
          )}
        </div>

      </div>
    </div>
  );
}