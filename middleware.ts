import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";

// 1. Настройки локализации
const intlMiddleware = createMiddleware({
  locales: ['ru', 'kk', 'en'],
  defaultLocale: 'ru',
  localePrefix: 'always' // Всегда добавлять префикс (/ru)
});

// 2. Защита админки
const isProtectedRoute = createRouteMatcher(['/:locale/admin(.*)']);
const adminUserIds = (process.env.ADMIN_USER_IDS ?? "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

export default clerkMiddleware(async (auth, req) => {
  // Если это админка - проверяем права
  if (isProtectedRoute(req)) {
    const { userId } = auth();
    if (!userId) {
      await auth.protect();
    }

    if (!userId || !adminUserIds.includes(userId)) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  // Для всех остальных случаев запускаем переводчик
  return intlMiddleware(req);
});

export const config = {
  // Matcher ловит ВСЕ страницы, кроме статики
  matcher: [
    // Важно: эта регулярка должна ловить корень "/"
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
