import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css"; 
import { ClerkProvider } from "@clerk/nextjs";
import { ruRU } from "@clerk/localizations";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
// Script нам тут больше не нужен, будем использовать нативный HTML
// import Script from "next/script"; 

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

  if (!['ru', 'kk', 'en'].includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <ClerkProvider localization={ruRU}>
      <html lang={locale}>
        <head>
          {/* 🔥 ЖЕЛЕЗНЫЙ ВАРИАНТ: Вставляем прямо в head как обычный HTML */}
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6241200265313280"
            crossOrigin="anonymous"
          ></script>
        </head>
        <body className={inter.className}>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}