"use client";

import { usePathname, useRouter } from "next/navigation";

export default function LanguageSwitcher() {
  const pathname = usePathname(); // Получаем текущий путь, например /ru/admin
  const router = useRouter();

  const changeLanguage = (newLocale: string) => {
    if (!pathname) return;
    
    // Разбиваем путь на части: ["", "ru", "admin"]
    const segments = pathname.split('/');
    // Заменяем язык (второй элемент массива)
    segments[1] = newLocale;
    // Собираем обратно: "/kk/admin"
    const newUrl = segments.join('/');
    
    router.push(newUrl);
  };

  return (
    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
      <button 
        onClick={() => changeLanguage('ru')} 
        className={`px-2 py-1 text-xs font-bold rounded-md transition ${pathname.startsWith('/ru') ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
      >
        RU
      </button>
      <button 
        onClick={() => changeLanguage('kk')} 
        className={`px-2 py-1 text-xs font-bold rounded-md transition ${pathname.startsWith('/kk') ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
      >
        KZ
      </button>
      <button 
        onClick={() => changeLanguage('en')} 
        className={`px-2 py-1 text-xs font-bold rounded-md transition ${pathname.startsWith('/en') ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
      >
        EN
      </button>
    </div>
  );
}