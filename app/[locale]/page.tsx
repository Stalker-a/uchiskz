import { db } from "@/lib/db";
import Link from "next/link";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { getTranslations, setRequestLocale } from 'next-intl/server';
import LanguageSwitcher from "@/components/LanguageSwitcher";

// 👇 1. Добавили Trophy в список иконок
import { 
  BookOpen, Calculator, FlaskConical, Globe, Zap, Dna, 
  Languages, Cpu, Landmark, GraduationCap, ArrowRight, 
  CheckCircle, Layout, Smartphone, BarChart3,
  Code, Send, Rocket, Trophy 
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Подключаем словари
  const tHero = await getTranslations('Hero');
  const tNav = await getTranslations('Nav');
  const tStats = await getTranslations('Stats');
  const tSteps = await getTranslations('Steps');
  const tSub = await getTranslations('Subjects');
  const tFeat = await getTranslations('Features');
  const tMotiv = await getTranslations('Motivation');
  const tFAQ = await getTranslations('FAQ');
  const tDev = await getTranslations('Developer');

  const subjects = await db.subject.findMany({
    orderBy: { id: "asc" },
    include: { topics: true },
  });

  const tasksCount = await db.task.count();

  const getSubjectStyle = (slug: string) => {
    switch (slug) {
      case "math-literacy": return { icon: <Calculator className="w-8 h-8" />, color: "text-orange-600 bg-orange-100" };
      case "algebra":       return { icon: <BookOpen className="w-8 h-8" />,   color: "text-blue-600 bg-blue-100" };
      case "geometry":      return { icon: <Layout className="w-8 h-8" />,     color: "text-indigo-600 bg-indigo-100" };
      case "physics":       return { icon: <Zap className="w-8 h-8" />,        color: "text-yellow-600 bg-yellow-100" };
      case "chemistry":     return { icon: <FlaskConical className="w-8 h-8" />, color: "text-purple-600 bg-purple-100" };
      case "biology":       return { icon: <Dna className="w-8 h-8" />,        color: "text-green-600 bg-green-100" };
      case "geography":     return { icon: <Globe className="w-8 h-8" />,      color: "text-sky-600 bg-sky-100" };
      case "history-kz":    return { icon: <Landmark className="w-8 h-8" />,   color: "text-amber-600 bg-amber-100" };
      case "english":       return { icon: <Languages className="w-8 h-8" />,  color: "text-pink-600 bg-pink-100" };
      case "informatics":   return { icon: <Cpu className="w-8 h-8" />,        color: "text-slate-600 bg-slate-100" };
      default:              return { icon: <BookOpen className="w-8 h-8" />,   color: "text-blue-600 bg-blue-100" };
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* --- ШАПКА --- */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <Link href={`/${locale}`} className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              Uchis.KZ
            </Link>
          </div>
          
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="#subjects" className="hidden md:block hover:text-blue-600 transition">{tNav('subjects')}</Link>
            <LanguageSwitcher />

            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                  {tNav('login')}
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center gap-4">
                <Link href={`/${locale}/profile`} className="text-slate-500 hover:text-blue-600 font-bold">
                   Профиль
                </Link>
                 <Link href={`/${locale}/admin`} className="text-slate-500 hover:text-blue-600">
                    {tNav('admin')}
                 </Link>
                 <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </nav>
        </div>
      </header>

      {/* --- HERO --- */}
      <section className="relative bg-slate-50 py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <span className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-6 tracking-wide uppercase">
            <CheckCircle className="w-4 h-4" /> {tHero('features')}
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            {tHero('title')} <br/>
            <span className="text-blue-600">{tHero('highlight')}</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            {tHero('subtitle')}
          </p>
          
          {/* 👇 2. ИЗМЕНЕННЫЙ БЛОК КНОПОК */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="#subjects" className="flex justify-center items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 hover:shadow-lg transition transform hover:-translate-y-1">
              {tHero('button')} <ArrowRight className="w-5 h-5" />
            </Link>

            {/* Кнопка Рейтинга */}
            <Link 
              href={`/${locale}/leaderboard`} 
              className="flex justify-center items-center gap-2 bg-yellow-400 text-yellow-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition shadow-lg transform hover:-translate-y-1"
            >
              <Trophy className="w-6 h-6" />
              Рейтинг
            </Link>
          </div>

        </div>
      </section>

      {/* --- СТАТИСТИКА --- */}
      <section className="bg-blue-600 py-12 text-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold mb-1">{tasksCount}+</div>
            <div className="text-blue-200 text-sm uppercase tracking-wider">{tStats('tasks')}</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">{subjects.length}</div>
            <div className="text-blue-200 text-sm uppercase tracking-wider">{tStats('subjects')}</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">24/7</div>
            <div className="text-blue-200 text-sm uppercase tracking-wider">{tStats('access')}</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">0₸</div>
            <div className="text-blue-200 text-sm uppercase tracking-wider">{tStats('free')}</div>
          </div>
        </div>
      </section>

      {/* --- ПРЕИМУЩЕСТВА --- */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{tFeat('title')}</h2>
            <p className="text-slate-500">{tFeat('subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{tFeat('f1_title')}</h3>
              <p className="text-slate-500">{tFeat('f1_desc')}</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-6">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{tFeat('f2_title')}</h3>
              <p className="text-slate-500">{tFeat('f2_desc')}</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{tFeat('f3_title')}</h3>
              <p className="text-slate-500">{tFeat('f3_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- ПРЕДМЕТЫ --- */}
      <section id="subjects" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">{tSub('title')}</h2>
            <p className="text-slate-500 text-lg">{tSub('subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => {
              const style = getSubjectStyle(subject.slug);
              const title = locale === 'kk' ? subject.titleKz : subject.titleRu;
              
              return (
                <Link 
                  key={subject.id} 
                  href={`/subjects/${subject.slug}`} 
                  className="group relative bg-white rounded-2xl p-6 border-2 border-slate-100 hover:border-blue-500 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-4 rounded-xl transition ${style.color}`}>
                      {style.icon}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600 transition">
                      {subject.topics.length} {tSub('topics')}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-6 group-hover:text-blue-600 transition">
                    {title}
                  </h3>
                  
                  <div className="flex items-center text-slate-700 font-bold group-hover:text-blue-600 transition">
                    {tSub('button')} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- МОТИВАЦИЯ --- */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <Rocket className="w-16 h-16 mx-auto mb-6 text-blue-200" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
               {tMotiv('title')}
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
               {tMotiv('subtitle')}
            </p>
            <Link 
               href="#subjects" 
               className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition shadow-lg transform hover:-translate-y-1"
            >
               {tMotiv('button')}
            </Link>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10 text-center">{tFAQ('title')}</h2>
          <div className="space-y-4">
            <details className="group bg-slate-50 p-6 rounded-2xl cursor-pointer">
              <summary className="flex justify-between items-center font-bold list-none">
                {tFAQ('q1')}
                <span className="transition group-open:rotate-180"><ArrowRight className="w-4 h-4 rotate-90"/></span>
              </summary>
              <p className="text-slate-600 mt-4 leading-relaxed">{tFAQ('a1')}</p>
            </details>
            <details className="group bg-slate-50 p-6 rounded-2xl cursor-pointer">
              <summary className="flex justify-between items-center font-bold list-none">
                {tFAQ('q2')}
                <span className="transition group-open:rotate-180"><ArrowRight className="w-4 h-4 rotate-90"/></span>
              </summary>
              <p className="text-slate-600 mt-4 leading-relaxed">{tFAQ('a2')}</p>
            </details>
            <details className="group bg-slate-50 p-6 rounded-2xl cursor-pointer">
              <summary className="flex justify-between items-center font-bold list-none">
                {tFAQ('q3')}
                <span className="transition group-open:rotate-180"><ArrowRight className="w-4 h-4 rotate-90"/></span>
              </summary>
              <p className="text-slate-600 mt-4 leading-relaxed">{tFAQ('a3')}</p>
            </details>
          </div>
        </div>
      </section>

      {/* --- ДЛЯ РАЗРАБОТЧИКА --- */}
      <section className="bg-slate-900 py-16 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-slate-800 px-4 py-1.5 rounded-full text-blue-400 font-bold text-xs mb-6 border border-slate-700">
            <Code className="w-4 h-4" /> Developer Offer
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {tDev('text')}
          </h2>
          <p className="text-slate-400 mb-8 text-lg max-w-xl mx-auto">
            {tDev('subtext')}
          </p>
          <a 
            href="https://t.me/SHAKOTAN2" 
            target="_blank"
            className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition"
          >
            <Send className="w-5 h-5" /> {tDev('button')}
          </a>
        </div>
      </section>

      {/* --- ПОДВАЛ --- */}
      <footer className="bg-slate-950 text-slate-500 py-12 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-white">
              <GraduationCap className="w-6 h-6" />
              <span className="text-lg font-bold">Uchis.KZ</span>
            </div>
            <p className="text-sm">© 2025 Uchis.KZ. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
