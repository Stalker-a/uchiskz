import type { Metadata } from "next";
import { Inter } from "next/font/google";
// Важно: путь к стилям. Если подчеркнет красным, попробуй "@/globals.css"
import "@/app/globals.css"; 
import { ClerkProvider } from "@clerk/nextjs";
import { ruRU } from "@clerk/localizations";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Script from "next/script"; // ✅ Импорт есть, отлично

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Uchis.KZ",
  description: "Подготовка к ЕНТ",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; 
}) {
  const { locale } = await params;

  // Проверка: если язык странный — ошибка 404
  if (!['ru', 'kk', 'en'].includes(locale)) {
    notFound();
  }

  // Загружаем переводы
  const messages = await getMessages();

  return (
    <ClerkProvider localization={ruRU}>
      {/* Указываем язык сайта */}
      <html lang={locale}>
        <body className={inter.className}>
          
          {/* 👇 1. ВОТ СЮДА ВСТАВЛЯЕМ РЕКЛАМУ (ВНУТРЬ BODY) */}
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6241200265313280"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />

          {/* Подключаем переводчик ко всем страницам внутри */}
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}