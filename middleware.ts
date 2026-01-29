import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";

// 1. Настройки локализации
const intlMiddleware = createMiddleware({
  locales: ['ru', 'kk', 'en'],
  defaultLocale: 'ru',
  localePrefix: 'always' // Всегда добавлять префикс (/ru)
});

// 2. Защита админки
const isProtectedRoute = createRouteMatcher(['/:locale/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // Если это админка - проверяем права
  if (isProtectedRoute(req)) {
    await auth.protect();
    const { userId, sessionClaims } = auth();
    const isAdmin =
      sessionClaims?.publicMetadata?.role === "admin" ||
      sessionClaims?.role === "admin" ||
      sessionClaims?.orgRole === "admin" ||
      sessionClaims?.orgRole === "owner" ||
      userId === process.env.CLERK_ADMIN_USER_ID;

    if (!isAdmin) {
      return new Response("Forbidden", { status: 403 });
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
