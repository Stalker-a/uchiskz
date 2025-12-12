import type { Metadata } from "next";
import { Inter } from "next/font/google";
// Важно: путь к стилям. Если подчеркнет красным, попробуй "@/globals.css"
import "@/app/globals.css"; 
import { ClerkProvider } from "@clerk/nextjs";
import { ruRU } from "@clerk/localizations";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

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
  // 👇 ВОТ ЭТО МЫ ДОБАВЛЯЕМ (ОБЯЗАТЕЛЬНО ДЛЯ Next.js 15)
  params: Promise<{ locale: string }>; 
}) {
  // 👇 И ВОТ ЭТО ТОЖЕ (ЖДЕМ ЗАГРУЗКИ ЯЗЫКА)
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
          {/* Подключаем переводчик ко всем страницам внутри */}
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}